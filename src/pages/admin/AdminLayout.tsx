import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  MessageSquare,
  Star,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
    { to: '/admin/products', label: 'Products & Variants', icon: <Package className="w-4 h-4" /> },
    { to: '/admin/orders', label: 'Orders & Returns', icon: <ShoppingBag className="w-4 h-4" /> },
    { to: '/admin/customers', label: 'Customer Accounts', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/coupons', label: 'Promotions & Coupons', icon: <Tag className="w-4 h-4" /> },
    { to: '/admin/questions', label: 'Product Q&A', icon: <MessageSquare className="w-4 h-4" /> },
    { to: '/admin/reviews', label: 'Review Moderation', icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      {/* Admin Top Header */}
      <div className="bg-zinc-950 text-white border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
              </Link>
              <span className="text-zinc-700">|</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  NexMart Administrative Control Center
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Admin: <strong className="text-white">{user?.name}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Subnav Tabs */}
      <div className="bg-white border-b border-zinc-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                  }`
                }
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
