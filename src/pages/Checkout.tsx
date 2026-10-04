import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { CheckoutStepper } from '../components/CheckoutStepper';
import { AddressCard } from '../components/AddressCard';
import { PaymentSelector, PaymentMethod } from '../components/PaymentSelector';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { IAddress } from '../types';

export const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshProfile } = useAuth();
  const { cart, clearCart, refreshCart } = useCart();
  const { success, error: toastError } = useToast();

  const buyNowItem = (location.state as any)?.buyNowItem;
  const initialCoupon = (location.state as any)?.couponCode || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponCode, setCouponCode] = useState(initialCoupon);

  // Authoritative server calculation state
  const [calculatedPricing, setCalculatedPricing] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    houseFlat: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    addressType: 'home' as const,
    isDefault: false,
  });

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Load user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.getAddresses();
        const addrList = res.addresses || [];
        setAddresses(addrList);
        const def = addrList.find((a: any) => a.isDefault) || addrList[0];
        if (def) setSelectedAddressId(def._id || '');
      } catch {
        // ignore
      }
    };
    fetchAddresses();
  }, []);

  // Determine items to checkout: either single Buy Now item or active cart items
  const checkoutItems = buyNowItem
    ? [buyNowItem]
    : cart?.items.map((i) => ({
        productId: i.product,
        variantSku: i.variantSku,
        quantity: i.quantity,
      })) || [];

  // Revalidate pricing on server whenever items, coupon, or delivery speed change
  useEffect(() => {
    const runAuthoritativeCalculation = async () => {
      if (checkoutItems.length === 0) return;
      setIsCalculating(true);
      try {
        const result = await api.calculateCheckout(checkoutItems, couponCode, deliverySpeed);
        setCalculatedPricing(result);
      } catch (err: any) {
        toastError(err.message || 'Price revalidation failed.');
      } finally {
        setIsCalculating(false);
      }
    };

    runAuthoritativeCalculation();
  }, [couponCode, deliverySpeed]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addAddress(newAddress);
      setAddresses(res.addresses);
      const added = res.addresses[res.addresses.length - 1];
      if (added) setSelectedAddressId(added._id);
      setIsAddressModalOpen(false);
      success('Delivery address saved.');
    } catch (err: any) {
      toastError(err.message || 'Failed to save address.');
    }
  };

  const handlePlaceOrder = async () => {
    if (isSubmittingOrder) return; // Prevent duplicate order creation

    const chosenAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!chosenAddress) {
      toastError('Please select a valid delivery address.');
      setCurrentStep(1);
      return;
    }

    if (!calculatedPricing) {
      toastError('Waiting for backend price confirmation.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      // For online payment methods, simulate/verify gateway transaction with backend
      let paymentDetails: any = undefined;

      if (paymentMethod !== 'cod') {
        const paymentOrder = await api.createPaymentOrder(calculatedPricing.total);
        // Simulate gateway completion & backend signature verification
        const sigRes = await api.getSandboxSignature(paymentOrder.id, `pay_sim_${Date.now()}`);
        const verifyRes = await api.verifyPayment({
          orderId: paymentOrder.id,
          paymentId: `pay_sim_${Date.now()}`,
          signature: sigRes.signature,
        });

        paymentDetails = {
          transactionId: `TXN-${paymentOrder.id}`,
          provider: 'sandbox_gateway',
          paidAt: new Date().toISOString(),
        };
      }

      // Authoritative Order Creation
      const orderRes = await api.createOrder({
        items: checkoutItems,
        address: chosenAddress,
        deliveryMethod: {
          type: deliverySpeed,
          title: deliverySpeed === 'express' ? 'Priority Express (Next Day)' : 'Standard Ground Delivery',
          estimatedDays: deliverySpeed === 'express' ? 1 : 3,
        },
        couponCode: calculatedPricing.couponApplied?.code,
        paymentMethod,
        paymentDetails,
        clearCartOnSuccess: !buyNowItem,
      });

      if (!buyNowItem) {
        await refreshCart();
      }

      success('Order confirmed and verified!');
      navigate('/order-success', {
        state: { order: orderRes.order },
      });
    } catch (err: any) {
      toastError(err.message || 'Order creation failed.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <CheckoutStepper currentStep={currentStep} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Wizard Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* STEP 1: Address Selection */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Step 1: Choose Delivery Destination</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-xs font-semibold text-zinc-950 hover:text-zinc-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Address
                  </button>
                </div>

                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-xl space-y-3">
                      <p className="text-xs text-zinc-500">No saved addresses found on your account.</p>
                      <button
                        type="button"
                        onClick={() => setIsAddressModalOpen(true)}
                        className="px-4 py-2 rounded-lg bg-zinc-950 text-white text-xs font-semibold"
                      >
                        Add New Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr) => (
                      <AddressCard
                        key={addr._id}
                        address={addr}
                        isSelected={addr._id === selectedAddressId}
                        onSelect={() => setSelectedAddressId(addr._id || '')}
                        showActions={false}
                      />
                    ))
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-100 flex justify-end">
                  <button
                    type="button"
                    disabled={!selectedAddressId}
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-40 flex items-center gap-2"
                  >
                    <span>Proceed to Delivery Speed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Delivery Speed */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 uppercase tracking-wider pb-3 border-b border-zinc-100">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Choose Delivery Option</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setDeliverySpeed('standard')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliverySpeed === 'standard'
                        ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-zinc-900">Standard Ground Transit</div>
                      <input
                        type="radio"
                        name="speed"
                        checked={deliverySpeed === 'standard'}
                        onChange={() => setDeliverySpeed('standard')}
                        className="w-4 h-4 text-zinc-950"
                      />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Estimated 2-3 Business Days</div>
                    <div className="text-xs font-semibold text-emerald-700 mt-3">FREE on orders over ₹1,000</div>
                  </div>

                  <div
                    onClick={() => setDeliverySpeed('express')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliverySpeed === 'express'
                        ? 'border-zinc-950 bg-zinc-50/50 shadow-sm ring-1 ring-zinc-950'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-zinc-900">Priority Express Air Cargo</div>
                      <input
                        type="radio"
                        name="speed"
                        checked={deliverySpeed === 'express'}
                        onChange={() => setDeliverySpeed('express')}
                        className="w-4 h-4 text-zinc-950"
                      />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Guaranteed Next-Day Doorstep Dispatch</div>
                    <div className="text-xs font-semibold text-zinc-900 mt-3">+₹150 Priority Charge</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Method */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
                <PaymentSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  orderTotal={calculatedPricing?.total || 0}
                />

                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <span>Review & Finalize Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review & Place Order */}
            {currentStep === 4 && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 uppercase tracking-wider pb-3 border-b border-zinc-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Step 4: Final Review Before Order Confirmation</span>
                </div>

                {/* Selected Address Snapshot */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Shipping To</span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-zinc-950 font-semibold hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  {(() => {
                    const a = addresses.find((addr) => addr._id === selectedAddressId);
                    return a ? (
                      <div className="text-xs text-zinc-700">
                        <span className="font-semibold text-zinc-900">{a.name}</span> · {a.phone}
                        <br />
                        {a.houseFlat}, {a.street}, {a.city}, {a.state} - {a.pincode}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Items in this Order */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Order Items ({calculatedPricing?.items?.length || 0})
                  </span>
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                    {calculatedPricing?.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3 bg-white flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-lg object-cover bg-zinc-50 border border-zinc-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-zinc-900 truncate">{item.productName}</div>
                          {item.variantTitle && (
                            <div className="text-[11px] text-zinc-500">{item.variantTitle}</div>
                          )}
                          <div className="text-[11px] text-zinc-400">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</div>
                        </div>
                        <div className="text-xs font-bold text-zinc-950 shrink-0">
                          ₹{item.itemTotal.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Place Order Button */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Payment
                  </button>

                  <button
                    type="button"
                    disabled={isSubmittingOrder || isCalculating}
                    onClick={handlePlaceOrder}
                    className="px-8 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingOrder ? (
                      <span>Verifying & Placing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Confirm & Place Order (₹{calculatedPricing?.total?.toLocaleString()})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Column */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Payment Summary
            </h3>

            {isCalculating ? (
              <div className="py-6 text-center text-xs text-zinc-400">Rechecking prices & inventory...</div>
            ) : calculatedPricing ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Cart Subtotal</span>
                  <span className="font-semibold text-zinc-900">₹{calculatedPricing.subtotal.toLocaleString()}</span>
                </div>

                {calculatedPricing.productDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Catalog Savings</span>
                    <span>-₹{calculatedPricing.productDiscount.toLocaleString()}</span>
                  </div>
                )}

                {calculatedPricing.couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon ({calculatedPricing.couponApplied.code})</span>
                    <span>-₹{calculatedPricing.couponApplied.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-600">
                  <span>Shipping ({deliverySpeed === 'express' ? 'Priority Express' : 'Ground'})</span>
                  <span>{calculatedPricing.deliveryFee === 0 ? <span className="font-semibold text-emerald-700">FREE</span> : `₹${calculatedPricing.deliveryFee}`}</span>
                </div>

                <div className="flex justify-between text-zinc-600">
                  <span>GST Tax (18% Included)</span>
                  <span>₹{calculatedPricing.tax.toLocaleString()}</span>
                </div>

                <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-zinc-950">Payable Total</span>
                  <span className="text-xl font-extrabold text-zinc-950">
                    ₹{calculatedPricing.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pt-2 text-[11px] text-zinc-400 flex items-center gap-1.5 leading-snug">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Prices, stock, and coupon discounts are recalculate-verified strictly on backend servers.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Add New Delivery Address"
      >
        <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newAddress.name}
                onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Mobile Phone</label>
              <input
                type="text"
                required
                value={newAddress.phone}
                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">House / Flat / Suite</label>
            <input
              type="text"
              required
              value={newAddress.houseFlat}
              onChange={(e) => setNewAddress({ ...newAddress, houseFlat: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">City</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">State</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Pincode</label>
              <input
                type="text"
                required
                maxLength={6}
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <span className="font-semibold text-zinc-700">Address Type:</span>
            {['home', 'work', 'other'].map((t) => (
              <label key={t} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="addrType"
                  checked={newAddress.addressType === t}
                  onChange={() => setNewAddress({ ...newAddress, addressType: t as any })}
                  className="w-3.5 h-3.5 text-zinc-950"
                />
                <span>{t}</span>
              </label>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="px-4 py-2 rounded-lg text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800"
            >
              Save Address
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
