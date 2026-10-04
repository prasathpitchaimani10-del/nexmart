import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectUrl = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login({ email: email.trim(), password });
      navigate(redirectUrl);
    } catch {
      // toast shown in context
    }
  };

  const handleFillDemoCustomer = () => {
    setEmail('customer@example.com');
    setPassword('Customer@12345');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@nexmart.com');
    setPassword('Admin@12345');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Sign In to NexMart</h1>
          <p className="text-xs text-zinc-500">Access your orders, saved addresses, and profile</p>
        </div>

        {/* Demo Fast-Login Helpers */}
        <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
          <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider text-center">
            One-Click Portfolio Testing Roles
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={handleFillDemoCustomer}
              className="p-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-900 font-semibold text-zinc-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Customer Demo</span>
            </button>
            <button
              type="button"
              onClick={handleFillDemoAdmin}
              className="p-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-900 font-semibold text-zinc-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700">Password</label>
              <Link to="/forgot-password" className="text-zinc-500 hover:text-zinc-900 font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-zinc-950 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
