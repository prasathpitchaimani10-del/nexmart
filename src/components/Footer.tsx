import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Truck, RefreshCw, Headphones, CreditCard, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 text-sm border-t border-zinc-800">
      {/* Value Badges */}
      <div className="border-b border-zinc-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                <Truck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 text-base">Express Ground & Air</h4>
                <p className="text-xs text-zinc-500 mt-1">Free delivery across all pin codes on eligible orders above ₹1,000.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                <Shield className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 text-base">100% Genuine Guaranteed</h4>
                <p className="text-xs text-zinc-500 mt-1">Directly sourced brand items with official manufacturer warranty.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                <RefreshCw className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 text-base">Hassle-Free 7-Day Returns</h4>
                <p className="text-xs text-zinc-500 mt-1">Instant reverse pickup and rapid refund processing to your account.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 rounded-xl text-zinc-100 border border-zinc-800">
                <Headphones className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-100 text-base">Dedicated Client Care</h4>
                <p className="text-xs text-zinc-500 mt-1">Live support available Monday through Saturday 9AM - 8PM IST.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white text-zinc-950 flex items-center justify-center font-bold text-base">
                N
              </div>
              <span className="text-lg font-bold text-white tracking-tight">NexMart Enterprise</span>
            </Link>
            <p className="text-xs text-zinc-500 mt-3 max-w-sm leading-relaxed">
              NexMart is a full-stack omnichannel commerce platform offering authenticated premium electronics, apparel,
              culinary cookware, and sports equipment with real-time stock control and secure payments.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-zinc-400">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>PCI-DSS Compliant 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-3">Shop Categories</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/electronics" className="hover:text-white transition-colors">Electronics & Audio</Link></li>
              <li><Link to="/category/fashion" className="hover:text-white transition-colors">Fashion & Footwear</Link></li>
              <li><Link to="/category/home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/category/sports-fitness" className="hover:text-white transition-colors">Sports & Fitness</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">All New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-3">Customer Service</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Compare Products</Link></li>
              <li><Link to="/addresses" className="hover:text-white transition-colors">Delivery Address Book</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Administration & Legal */}
          <div>
            <h5 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider mb-3">System & Access</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Client Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API Health Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} NexMart Technologies Inc. All rights reserved. Standard Indian GST Registered (29ABCDE1234F1Z5).
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Supported:
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">UPI</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">Visa / Mastercard</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">NetBanking</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-300">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
