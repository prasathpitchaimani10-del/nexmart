import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  Printer,
  FileText,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { IOrder } from '../types';
import { OrderTimeline } from '../components/OrderTimeline';
import { Modal } from '../components/Modal';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../context/ToastContext';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Return request modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Product damaged in transit');
  const [returnDescription, setReturnDescription] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found a better price');
  const [isCancelling, setIsCancelling] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await api.getOrderById(id);
      setOrder(res.order);
    } catch (err: any) {
      toastError(err.message || 'Could not load order details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleFetchInvoice = async () => {
    if (!id) return;
    try {
      const res = await api.getInvoice(id);
      setInvoice(res.invoice);
      setIsInvoiceModalOpen(true);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch invoice.');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !returnDescription.trim()) {
      toastError('Please provide a description of the issue.');
      return;
    }
    setIsSubmittingReturn(true);
    try {
      await api.requestReturn(id, returnReason, returnDescription.trim());
      success('Return request registered. Our support team will review within 24 hours.');
      setIsReturnModalOpen(false);
      await fetchOrder();
    } catch (err: any) {
      toastError(err.message || 'Return request failed.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(id, cancelReason);
      success('Order cancelled successfully.');
      setIsCancelModalOpen(false);
      await fetchOrder();
    } catch (err: any) {
      toastError(err.message || 'Cancellation failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-pulse">
        <div className="h-6 bg-zinc-200 rounded w-1/4" />
        <div className="h-64 bg-zinc-100 rounded-2xl" />
      </div>
    );
  }

  const isCancelable = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);
  const isDelivered = order.orderStatus === 'delivered';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <Link to="/orders" className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight font-mono">
            Order #{order.orderNumber}
          </h1>
          <div className="text-xs text-zinc-500">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFetchInvoice}
            className="px-4 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-800 flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-zinc-500" />
            <span>Tax Invoice</span>
          </button>

          {isCancelable && (
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              Cancel Order
            </button>
          )}

          {isDelivered && (
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-zinc-950 text-white hover:bg-zinc-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return / Replace</span>
            </button>
          )}
        </div>
      </div>

      {/* Return Request Notification Banner */}
      {order.orderStatus === 'return_requested' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Return Request Under Merchant Review</div>
            <div className="mt-0.5 text-amber-800">
              Reason: {order.returnDetails?.reason}. Our logistics team is arranging reverse inspection.
            </div>
          </div>
        </div>
      )}

      {/* Live Order Timeline */}
      <OrderTimeline currentStatus={order.orderStatus} history={order.trackingHistory} />

      {/* Delivery & Items Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Delivery Address</h4>
          <div className="text-xs text-zinc-700 leading-relaxed">
            <strong className="text-zinc-950 block">{order.address.name}</strong>
            {order.address.houseFlat}, {order.address.street}
            <br />
            {order.address.city}, {order.address.state} - {order.address.pincode}
            <div className="mt-2 text-zinc-500 font-medium">Contact: {order.address.phone}</div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Payment Breakdown</h4>
          <div className="text-xs space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>Method:</span>
              <strong className="text-zinc-900 uppercase">{order.paymentMethod}</strong>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-emerald-700 capitalize">{order.paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-zinc-900">₹{order.pricing.subtotal.toLocaleString()}</span>
            </div>
            {order.pricing.couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Coupon ({order.couponApplied?.code}):</span>
                <span>-₹{order.pricing.couponDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Charge:</span>
              <span>{order.pricing.deliveryFee === 0 ? 'FREE' : `₹${order.pricing.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-100 font-bold text-sm text-zinc-950">
              <span>Total Paid:</span>
              <span>₹{order.pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Fulfillment Method */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Fulfillment Method</h4>
          <div className="text-xs text-zinc-700 space-y-1">
            <div className="font-semibold text-zinc-900">{order.deliveryMethod?.title || 'Standard Delivery'}</div>
            <div className="text-zinc-500">Estimated duration: {order.deliveryMethod?.estimatedDays || 3} days</div>
            <div className="pt-2 flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Transit Insurance Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Items</h3>
        <div className="divide-y divide-zinc-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover bg-zinc-50 border border-zinc-100"
                />
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">{item.productName}</h4>
                  {item.variantTitle && (
                    <div className="text-[11px] text-zinc-500">Variant: {item.variantTitle}</div>
                  )}
                  <div className="text-xs text-zinc-400 mt-1">
                    Qty: {item.quantity} · ₹{item.price.toLocaleString()} each
                  </div>
                </div>
              </div>
              <div className="font-extrabold text-sm text-zinc-950">
                ₹{item.itemTotal.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Official Tax Invoice"
        maxWidth="xl"
      >
        {invoice ? (
          <div className="space-y-6 text-xs text-zinc-800 p-2">
            <div className="flex justify-between items-start pb-4 border-b border-zinc-200">
              <div>
                <h3 className="font-extrabold text-base text-zinc-950">{invoice.seller.name}</h3>
                <p className="text-zinc-500 text-[11px] max-w-xs">{invoice.seller.address}</p>
                <div className="text-[11px] font-semibold text-zinc-700 mt-1">GSTIN: {invoice.seller.gstin}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-zinc-900">INVOICE #{invoice.invoiceNumber}</div>
                <div className="text-zinc-500 text-[11px]">{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100">
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Billed To</span>
                <strong className="text-zinc-950">{invoice.customer.name}</strong>
                <div>{invoice.customer.email}</div>
                <div>{invoice.customer.phone}</div>
              </div>
              <div>
                <span className="font-bold text-[11px] uppercase tracking-wider text-zinc-400 block mb-1">Shipped To</span>
                <div>{invoice.shippingAddress.name}</div>
                <div>{invoice.shippingAddress.houseFlat}, {invoice.shippingAddress.street}</div>
                <div>{invoice.shippingAddress.city}, {invoice.shippingAddress.state} - {invoice.shippingAddress.pincode}</div>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-200 text-[11px] uppercase text-zinc-400">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {invoice.items.map((it: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2.5 font-medium text-zinc-900">{it.productName}</td>
                    <td className="py-2.5 text-center">{it.quantity}</td>
                    <td className="py-2.5 text-right">₹{it.price.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-bold">₹{it.itemTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-4 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span>₹{invoice.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>GST Portion (18%):</span>
                  <span>₹{invoice.pricing.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Delivery Charges:</span>
                  <span>₹{invoice.pricing.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Total Amount Paid:</span>
                  <span>₹{invoice.pricing.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-zinc-800"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Return/Replacement Request Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Request Return / Replacement"
      >
        <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Reason for Return</label>
            <select
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            >
              <option value="Product damaged in transit">Product damaged in transit</option>
              <option value="Defective or malfunctioning item">Defective or malfunctioning item</option>
              <option value="Wrong size or color delivered">Wrong size or color delivered</option>
              <option value="Item not matching description">Item not matching description</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              required
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
              placeholder="Describe the defect or reason for return in detail..."
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingReturn}
              className="px-5 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isCancelModalOpen}
        title="Confirm Order Cancellation"
        message="Are you sure you want to cancel this order? Items will be restocked and payment refunded."
        confirmText="Yes, Cancel Order"
        isDestructive
        onConfirm={handleCancelOrder}
        onCancel={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};
