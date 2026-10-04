import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Download, Truck } from 'lucide-react';
import { IOrder } from '../types';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = (location.state as any)?.order as IOrder | undefined;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-8 animate-in fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">Order Confirmed!</h1>
        <p className="text-sm text-zinc-600">
          Thank you for choosing NexMart. Your order has been registered and is being prepared for fulfillment.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Order Number</div>
            <div className="text-sm font-extrabold text-zinc-900 font-mono">{order.orderNumber}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Payment Status</div>
            <div className="text-xs font-semibold text-emerald-700 capitalize">
              {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Amount</div>
            <div className="text-base font-extrabold text-zinc-950">₹{order.pricing.total.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-600 py-1">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Shipping via <strong className="text-zinc-900">{order.deliveryMethod?.title || 'Ground Dispatch'}</strong> to{' '}
            {order.address.city}, {order.address.state} ({order.address.pincode})
          </span>
        </div>

        <div className="divide-y divide-zinc-100 pt-2 border-t border-zinc-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={item.productImage} alt={item.productName} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <div className="font-semibold text-zinc-900">{item.productName}</div>
                  <div className="text-[11px] text-zinc-400">Qty: {item.quantity}</div>
                </div>
              </div>
              <div className="font-bold text-zinc-900">₹{item.itemTotal.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <Link
          to={`/orders/${order._id}`}
          className="px-6 py-3 rounded-xl bg-zinc-950 text-white font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors shadow-md flex items-center gap-2"
        >
          <Package className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl bg-zinc-100 text-zinc-800 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
