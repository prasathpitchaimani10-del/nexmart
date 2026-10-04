import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await api.forgotPassword({ email: email.trim() });
      success(res.message || 'Password reset instructions have been generated.');
      if (res.resetTokenForTesting) {
        setSimulatedToken(res.resetTokenForTesting);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to request reset token.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Recover Password</h1>
          <p className="text-xs text-zinc-500">
            Enter your account email to generate a secure reset token.
          </p>
        </div>

        {simulatedToken && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-emerald-900">Reset Token Generated:</div>
            <div className="font-mono text-[11px] bg-white p-2 rounded border border-emerald-200 break-all select-all text-emerald-800">
              {simulatedToken}
            </div>
            <Link
              to={`/reset-password?token=${encodeURIComponent(simulatedToken)}`}
              className="inline-block mt-2 font-bold text-xs text-emerald-800 underline hover:text-emerald-950"
            >
              Click here to proceed with new password entry →
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Registered Email Address</label>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center text-xs">
          <Link to="/login" className="text-zinc-600 hover:text-zinc-950 font-semibold flex items-center justify-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
