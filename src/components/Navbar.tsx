import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  Bell,
  SlidersHorizontal,
  ChevronDown,
  Package,
  MapPin,
  LogOut,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { api } from '../services/api';
import { INotification } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete suggestions debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getSearchSuggestions(searchQuery.trim());
        setSuggestions(res.suggestions || []);
        setShowSuggestions(true);
      } catch {
        // ignore
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSuggestions(false);
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch {
      // ignore
    }
  };

  const handleOpenNotif = () => {
    setIsNotifDropdownOpen(!isNotifDropdownOpen);
    if (!isNotifDropdownOpen) {
      loadNotifications();
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
      {/* Top Banner */}
      <div className="bg-zinc-950 text-zinc-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Grand Season Sale: Flat 20% off with coupon
              FESTIVE20
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-zinc-400 text-xs">
            <span>Official 2-Year Warranty</span>
            <span>·</span>
            <span>Free Express Delivery over ₹1,000</span>
            <span>·</span>
            <Link to="/compare" className="hover:text-white transition-colors">
              Compare Products
            </Link>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Category Nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-lg tracking-wider shadow-sm group-hover:bg-zinc-800 transition-colors">
                N
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-zinc-950">NexMart</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-zinc-600 ml-1.5 tracking-wider">
                  Enterprise
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-zinc-600">
              <Link to="/products" className="hover:text-zinc-950 transition-colors">
                All Products
              </Link>
              <Link to="/category/electronics" className="hover:text-zinc-950 transition-colors">
                Electronics
              </Link>
              <Link to="/category/fashion" className="hover:text-zinc-950 transition-colors">
                Fashion
              </Link>
              <Link to="/category/home-kitchen" className="hover:text-zinc-950 transition-colors">
                Home & Kitchen
              </Link>
              <Link to="/category/sports-fitness" className="hover:text-zinc-950 transition-colors">
                Sports & Fitness
              </Link>
            </nav>
          </div>

          {/* Search Box */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search over 1,000+ curated products, brands..."
                  className="w-full bg-zinc-100/80 hover:bg-zinc-100 focus:bg-white text-zinc-900 text-sm rounded-lg pl-10 pr-10 py-2 border border-zinc-200 focus:border-zinc-900 focus:outline-none transition-all placeholder:text-zinc-600"
                />
                <Search className="w-4 h-4 text-zinc-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Suggestions Flyout */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in">
                <div className="p-2 border-b border-zinc-100 text-xs font-semibold text-zinc-600">
                  Live Suggestions
                </div>
                <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        if (item.type === 'category') {
                          navigate(`/category/${item.slug}`);
                        } else {
                          navigate(`/products/${item.slug}`);
                        }
                      }}
                      className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors"
                    >
                      {item.type === 'product' && item.image ? (
                        <img src={item.image} alt={item.title} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-zinc-100 flex items-center justify-center text-zinc-500">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900 truncate">{item.title}</div>
                        <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                          <span>{item.type === 'category' ? 'Category' : item.category}</span>
                          {item.price && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-zinc-800">₹{item.price.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Notifications */}
            <div ref={notifDropdownRef} className="relative">
              <button
                type="button"
                onClick={handleOpenNotif}
                className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {isNotifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in">
                  <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                      Notifications ({notifications.length})
                    </span>
                    <button
                      onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
                      className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-zinc-500">No new notifications</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`p-3 text-left hover:bg-zinc-50 transition-colors ${
                            !notif.isRead ? 'bg-zinc-50/70 font-medium' : ''
                          }`}
                        >
                          <div className="text-xs font-semibold text-zinc-900">{notif.title}</div>
                          <div className="text-xs text-zinc-600 mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-zinc-600 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg relative transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg relative transition-colors flex items-center gap-1.5"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-zinc-950 text-white text-[11px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile Dropdown */}
            <div ref={profileDropdownRef} className="relative ml-1">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-left"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 text-zinc-700 font-semibold text-xs flex items-center justify-center">
                      {user?.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden md:inline-block text-xs font-semibold text-zinc-800 max-w-[100px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden md:inline-block" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-medium bg-zinc-950 text-white px-3.5 py-1.5 rounded-md hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Authenticated Dropdown Menu */}
              {isProfileDropdownOpen && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in">
                  <div className="px-4 py-2.5 border-b border-zinc-100">
                    <div className="text-xs font-semibold text-zinc-900 truncate">{user?.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{user?.email}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-600 mt-1">
                      Role: {user?.role}
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin Control Center
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                  >
                    <Package className="w-4 h-4 text-zinc-400" />
                    My Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    My Profile
                  </Link>

                  <Link
                    to="/addresses"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    Delivery Addresses
                  </Link>

                  <div className="border-t border-zinc-100 my-1"></div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-700 hover:bg-zinc-100 rounded-lg ml-1"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full bg-zinc-100 text-zinc-900 text-sm rounded-lg pl-9 pr-4 py-2 border border-zinc-200 focus:outline-none"
              />
              <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-3 animate-in fade-in">
          <div className="font-semibold text-xs text-zinc-600 uppercase tracking-wider">Categories</div>
          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              All Catalog
            </Link>
            <Link
              to="/category/electronics"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              Electronics
            </Link>
            <Link
              to="/category/fashion"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              Fashion
            </Link>
            <Link
              to="/category/home-kitchen"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              Home & Kitchen
            </Link>
            <Link
              to="/category/sports-fitness"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              Sports & Fitness
            </Link>
            <Link
              to="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-900"
            >
              Compare
            </Link>
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-zinc-100">
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 text-emerald-900 text-sm font-semibold"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
