import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { toastError } = useToast() as any;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      // Redirect to OTP verification page
      navigate(`/verify?email=${encodeURIComponent(email.trim())}`, {
        state: { otpCodeForTesting: res.otpCodeForTesting },
      });
    } catch {
      // toast shown in context
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
            N
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Create Account</h1>
          <p className="text-xs text-zinc-500">Sign up to access verified inventory and rapid checkout</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Mobile Phone</label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98123 45678"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Password (min 6 chars)</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>{isLoading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-zinc-950 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
