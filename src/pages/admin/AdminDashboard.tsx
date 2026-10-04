import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await api.getAdminStats();
        setStats(data);
      } catch (err: any) {
        toastError(err.message || 'Failed to load administrative stats.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-zinc-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-zinc-200" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Revenue</div>
          <div className="text-xl font-extrabold text-zinc-950">₹{stats.revenue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Direct settlement
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Orders</div>
          <div className="text-xl font-extrabold text-zinc-950">{stats.totalOrders}</div>
          <div className="text-[11px] text-zinc-500">All registered orders</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Pending Fulfillment</div>
          <div className="text-xl font-extrabold text-amber-600">{stats.pendingOrders}</div>
          <div className="text-[11px] text-zinc-500">In packing & transit</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Delivered Orders</div>
          <div className="text-xl font-extrabold text-emerald-600">{stats.deliveredOrders}</div>
          <div className="text-[11px] text-zinc-500">Delivered successfully</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Live Products</div>
          <div className="text-xl font-extrabold text-zinc-950">{stats.totalProducts}</div>
          <div className="text-[11px] text-zinc-500">Active catalog items</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Customer Accounts</div>
          <div className="text-xl font-extrabold text-zinc-950">{stats.totalCustomers}</div>
          <div className="text-[11px] text-zinc-500">Verified shoppers</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-100">
            {stats.recentOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400">No orders placed yet.</div>
            ) : (
              stats.recentOrders.map((ord: any) => (
                <div key={ord._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-mono font-bold text-zinc-900">{ord.orderNumber}</span>
                    <div className="text-zinc-500 text-[11px]">{ord.customer?.name} ({ord.customer?.email})</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-zinc-950">₹{ord.pricing?.total?.toLocaleString()}</div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500">{ord.orderStatus.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 text-amber-600 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Stock Alerts ({stats.lowStockCount})</span>
          </div>

          <div className="space-y-2.5">
            {stats.lowStockProducts.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-400">All catalog items have healthy inventory.</div>
            ) : (
              stats.lowStockProducts.slice(0, 6).map((item: any) => (
                <div key={item.id} className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-zinc-900 truncate max-w-[170px]">{item.name}</div>
                    <div className="text-[10px] font-mono text-zinc-400">SKU: {item.sku}</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                    {item.stock} left
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            to="/admin/products"
            className="block text-center text-xs font-semibold text-zinc-900 hover:underline pt-2"
          >
            Manage Catalog & Restock Inventory →
          </Link>
        </div>
      </div>
    </div>
  );
};
