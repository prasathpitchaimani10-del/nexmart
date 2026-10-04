import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Bookmark,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { EmptyState } from '../components/EmptyState';

export const Cart: React.FC = () => {
  const { cart, isLoading, updateQuantity, removeItem, toggleSaveForLater } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.getAvailableCoupons();
        setAvailableCoupons(res.coupons || []);
      } catch {
        // ignore
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) return;
    if (!cart || cart.subtotal <= 0) {
      toastError('Cart subtotal must be greater than zero to apply a coupon.');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const res = await api.validateCoupon(code, cart.subtotal);
      setAppliedCoupon(res);
      setCouponCode(code);
      success(res.message || `Coupon "${code}" applied successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Invalid coupon.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    success('Coupon removed.');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Shopping Cart is Waiting"
          description="Sign in to view items currently in your cart or proceed to checkout."
          actionText="Sign In to Continue"
          onAction={() => navigate('/login?redirect=/cart')}
        />
      </div>
    );
  }

  const activeItems = cart?.items || [];
  const savedItems = cart?.savedForLater || [];

  if (activeItems.length === 0 && savedItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Your Cart is Empty"
          description="Explore our high-performance electronics, apparel, and home essentials."
          actionText="Start Shopping"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const subtotal = cart?.subtotal || 0;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Math.round((taxableAmount * 0.18) * 100) / 100;
  const total = Math.max(0, taxableAmount + deliveryFee);

  const handleProceedCheckout = () => {
    navigate('/checkout', {
      state: {
        couponCode: appliedCoupon?.code,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          {activeItems.length} {activeItems.length === 1 ? 'item' : 'items'} in your active bag
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-sm">
            {activeItems.map((item) => (
              <div key={`${item.product}_${item.variantSku || 'base'}`} className="p-4 sm:p-5 flex gap-4 items-start">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover bg-zinc-50 shrink-0 border border-zinc-100"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-600 uppercase">{item.brand}</span>
                      <Link to={`/products/${item.slug}`} className="block">
                        <h3 className="font-semibold text-xs text-zinc-900 hover:text-zinc-700 truncate max-w-md">
                          {item.name}
                        </h3>
                      </Link>
                      {item.variantTitle && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">Variant: {item.variantTitle}</div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm text-zinc-950">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                      {item.originalPrice > item.price && (
                        <div className="text-[11px] text-zinc-400 line-through">
                          ₹{(item.originalPrice * item.quantity).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product, item.variantSku, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-white rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-zinc-900">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.stock}
                        onClick={() => updateQuantity(item.product, item.variantSku, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs font-bold text-zinc-600 hover:bg-white rounded disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleSaveForLater(item.product, item.variantSku, true)}
                        className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save for later</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product, item.variantSku)}
                        className="text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Saved for Later ({savedItems.length})
              </h2>
              <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-sm">
                {savedItems.map((item) => (
                  <div key={`${item.product}_${item.variantSku || 'base'}`} className="p-4 flex gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-xs text-zinc-900">{item.name}</div>
                        <div className="text-[11px] text-zinc-500 font-medium">₹{item.price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleSaveForLater(item.product, item.variantSku, false)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-medium hover:bg-zinc-800"
                      >
                        Move to Bag
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product, item.variantSku)}
                        className="text-rose-600 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary & Coupon Panel */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Apply Promo Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">{appliedCoupon.code} Applied</div>
                  <div className="text-[11px] text-emerald-700">You saved ₹{appliedCoupon.discount.toLocaleString()}</div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code (e.g. FESTIVE20)"
                  className="flex-1 text-xs p-2.5 rounded-lg border border-zinc-200 uppercase font-mono focus:outline-none focus:border-zinc-950"
                />
                <button
                  type="button"
                  disabled={isValidatingCoupon || !couponCode.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2 bg-zinc-950 text-white text-xs font-semibold rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isValidatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}

            {/* Quick Available Coupons list */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="pt-2 border-t border-zinc-100 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-zinc-400">Available Coupons</div>
                {availableCoupons.slice(0, 2).map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleApplyCoupon(c.code)}
                    className="w-full text-left p-2 rounded bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-zinc-900">{c.code}</span>
                      <p className="text-[10px] text-zinc-500">{c.description}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">Apply</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-100">
              Order Pricing Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-zinc-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {cart && cart.productDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Product Catalog Discount</span>
                  <span>-₹{cart.productDiscount.toLocaleString()}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-600">
                <span>Estimated Delivery Fee</span>
                <span>{deliveryFee === 0 ? <span className="font-semibold text-emerald-700">FREE</span> : `₹${deliveryFee}`}</span>
              </div>

              <div className="flex justify-between text-zinc-600">
                <span>Standard GST Portion (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-950">Final Order Total</span>
                <span className="text-xl font-extrabold text-zinc-950">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={activeItems.length === 0}
              onClick={handleProceedCheckout}
              className="w-full py-3.5 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authoritative server-side price verification at checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
