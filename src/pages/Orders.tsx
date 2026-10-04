import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowRight, RotateCcw, AlertTriangle, FileText } from 'lucide-react';
import { api } from '../services/api';
import { IOrder } from '../types';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Found a better alternative');
  const [isCancelling, setIsCancelling] = useState(false);

  const { success, error: toastError } = useToast();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.getMyOrders();
      setOrders(res || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelModalOrderId) return;
    setIsCancelling(true);
    try {
      await api.cancelOrder(cancelModalOrderId, cancelReason);
      success('Order cancelled successfully.');
      setCancelModalOrderId(null);
      await fetchOrders();
    } catch (err: any) {
      toastError(err.message || 'Order could not be cancelled.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const res = await api.reorder(orderId);
      await refreshCart();
      success(`${res.reorderedCount} items added to your cart for reorder!`);
      navigate('/cart');
    } catch (err: any) {
      toastError(err.message || 'Could not reorder items.');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Payment Pending' },
      confirmed: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'Confirmed' },
      processing: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', label: 'Packing & Processing' },
      shipped: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'In Transit' },
      out_for_delivery: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Out for Delivery' },
      delivered: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Delivered' },
      cancelled: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Cancelled' },
      return_requested: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Return Under Review' },
      refund_initiated: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Refund Processing' },
      refunded: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Refund Completed' },
    };
    const s = map[status] || { bg: 'bg-zinc-100 border-zinc-200', text: 'text-zinc-800', label: status };

    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-200 rounded w-1/4" />
        <div className="h-40 bg-zinc-100 rounded-2xl" />
        <div className="h-40 bg-zinc-100 rounded-2xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="No Orders Placed Yet"
          description="You haven't made any purchases with us yet. Browse our high-fidelity product catalog."
          actionText="Discover Products"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">My Order History</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage historical purchases, download tax invoices, and track live transit.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const isCancelable = ['pending', 'confirmed', 'processing'].includes(order.orderStatus);

          return (
            <div key={order._id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
              {/* Order Card Header */}
              <div className="p-4 sm:p-5 bg-zinc-50/70 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Order Number</span>
                    <div className="font-mono font-bold text-zinc-900">{order.orderNumber}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Date Placed</span>
                    <div className="font-semibold text-zinc-800">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Order Total</span>
                    <div className="font-bold text-zinc-950">₹{order.pricing.total.toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.orderStatus)}
                </div>
              </div>

              {/* Items Summary */}
              <div className="p-4 sm:p-5 divide-y divide-zinc-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-14 h-14 rounded-xl object-cover bg-zinc-50 border border-zinc-100 shrink-0"
                      />
                      <div>
                        <Link to={`/products`} className="font-semibold text-xs text-zinc-900 hover:text-zinc-700">
                          {item.productName}
                        </Link>
                        {item.variantTitle && (
                          <div className="text-[11px] text-zinc-500">Edition: {item.variantTitle}</div>
                        )}
                        <div className="text-[11px] text-zinc-400">Qty: {item.quantity} · ₹{item.price.toLocaleString()} each</div>
                      </div>
                    </div>

                    <div className="text-right text-xs font-bold text-zinc-900">
                      ₹{item.itemTotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-5 py-3.5 bg-white border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Delivery to {order.address.name}, {order.address.city} ({order.address.pincode})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isCancelable && (
                    <button
                      type="button"
                      onClick={() => setCancelModalOrderId(order._id)}
                      className="text-rose-600 hover:text-rose-700 font-semibold"
                    >
                      Cancel Order
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleReorder(order._id)}
                    className="text-zinc-700 hover:text-zinc-950 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  <Link
                    to={`/orders/${order._id}`}
                    className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                  >
                    <span>View Details & Tracking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={Boolean(cancelModalOrderId)}
        title="Cancel This Order?"
        message="Your items will be restocked to catalog inventory, and any online payment will be refunded to your original payment method within 3 business days."
        confirmText="Confirm Cancellation"
        isDestructive
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOrderId(null)}
      />
    </div>
  );
};
