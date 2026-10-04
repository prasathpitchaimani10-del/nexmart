import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle2, Truck, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { Modal } from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.adminGetOrders({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setOrders(res || []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await api.adminUpdateOrderStatus(selectedOrder._id, newStatus, statusNote);
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o._id === res.order._id ? res.order : o)));
      success(`Order #${res.order.orderNumber} updated to ${newStatus}.`);
      setStatusNote('');
    } catch (err: any) {
      toastError(err.message || 'Status update failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReturnAction = async (action: 'approve' | 'reject') => {
    if (!selectedOrder) return;
    try {
      const res = await api.adminHandleReturn(selectedOrder._id, action);
      setSelectedOrder(res.order);
      setOrders((prev) => prev.map((o) => (o._id === res.order._id ? res.order : o)));
      success(`Return request ${action}d.`);
    } catch (err: any) {
      toastError(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Order Fulfillment & Returns</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Track shipment milestones, manage reverse logistics, and update order statuses.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number or client..."
            className="w-full text-xs p-2.5 pl-9 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-zinc-950"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 font-semibold uppercase">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-zinc-200 bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="return_requested">Return Requested</option>
            <option value="refund_initiated">Refund Initiated</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400">
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-zinc-900">{ord.orderNumber}</div>
                      <div className="text-[11px] text-zinc-400">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-zinc-900">{ord.customer?.name}</div>
                      <div className="text-[11px] text-zinc-400">{ord.customer?.email}</div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-zinc-800">{ord.items.length} Products</span>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                        {ord.items[0]?.productName}
                      </div>
                    </td>

                    <td className="p-4 font-bold text-zinc-950">₹{ord.pricing.total.toLocaleString()}</td>

                    <td className="p-4">
                      <span className="font-semibold uppercase text-zinc-800">{ord.paymentMethod}</span>
                      <div className="text-[10px] text-emerald-700 font-semibold capitalize">
                        {ord.paymentStatus}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.orderStatus);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold text-xs hover:bg-zinc-800 shadow-xs"
                      >
                        Inspect & Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Update Order Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.orderNumber}`}
          maxWidth="xl"
        >
          <div className="space-y-6 text-xs text-zinc-800">
            {/* Status Modification Panel */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900">Update Shipment Stage</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Status Transition</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing & Packed</option>
                    <option value="shipped">In Transit (Shipped)</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Optional Milestone Note</label>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Dispatched via Air AWB 8912"
                    className="w-full p-2 rounded-lg border border-zinc-200 bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={isUpdatingStatus || newStatus === selectedOrder.orderStatus}
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50"
              >
                {isUpdatingStatus ? 'Updating...' : 'Save New Status'}
              </button>
            </div>

            {/* Return Request Action if present */}
            {selectedOrder.orderStatus === 'return_requested' && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Customer Requested Return</span>
                </div>
                <div className="text-zinc-700">Reason: {selectedOrder.returnDetails?.reason}</div>
                <div className="text-zinc-600 italic">"{selectedOrder.returnDetails?.description}"</div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReturnAction('approve')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                  >
                    Approve Return & Initiate Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReturnAction('reject')}
                    className="px-3 py-1.5 rounded-lg bg-zinc-200 text-zinc-800 font-semibold hover:bg-zinc-300"
                  >
                    Reject Return Request
                  </button>
                </div>
              </div>
            )}

            {/* Items Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Products in this Order</h4>
              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.productImage} alt={it.productName} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-zinc-900">{it.productName}</div>
                        <div className="text-[11px] text-zinc-500">Qty: {it.quantity} · Edition: {it.variantTitle || 'Standard'}</div>
                      </div>
                    </div>
                    <div className="font-bold text-zinc-950">₹{it.itemTotal.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Delivery Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Customer & Address</span>
                <div>{selectedOrder.address.name} ({selectedOrder.address.phone})</div>
                <div>{selectedOrder.address.houseFlat}, {selectedOrder.address.street}</div>
                <div>{selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}</div>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <span className="font-bold uppercase text-[10px] text-zinc-400 block mb-1">Financials</span>
                <div>Subtotal: ₹{selectedOrder.pricing.subtotal.toLocaleString()}</div>
                <div>Coupon: -₹{selectedOrder.pricing.couponDiscount.toLocaleString()}</div>
                <div>Delivery Fee: ₹{selectedOrder.pricing.deliveryFee}</div>
                <div className="font-bold text-zinc-950 mt-1">Total: ₹{selectedOrder.pricing.total.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
