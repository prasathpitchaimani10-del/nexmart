import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword({ token: token.trim(), newPassword });
      success('Password reset successfully! Please sign in with your new credentials.');
      navigate('/login');
    } catch (err: any) {
      toastError(err.message || 'Reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Set New Password</h1>
          <p className="text-xs text-zinc-500">Provide your valid reset token and choose a secure password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Reset Security Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste security token"
              className="w-full p-2.5 rounded-lg border border-zinc-200 font-mono focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">New Password (min 6 chars)</label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pl-9 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Confirm New Password</label>
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
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Updating Password...' : 'Save New Password'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center text-xs">
          <Link to="/login" className="text-zinc-600 hover:text-zinc-950 font-semibold">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
