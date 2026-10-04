import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const VerifyOtp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const emailParam = searchParams.get('email') || '';
  const otpFromState = (location.state as any)?.otpCodeForTesting;

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState(otpFromState || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) return;
    setIsVerifying(true);
    try {
      await api.verifyOtp({ email: email.trim(), code: code.trim() });
      await refreshProfile();
      success('Account verified successfully!');
      navigate('/');
    } catch (err: any) {
      toastError(err.message || 'OTP verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const res = await api.resendOtp({ email: email.trim() });
      if (res.otpCodeForTesting) {
        setCode(res.otpCodeForTesting);
      }
      success('Fresh verification code sent to your email.');
    } catch (err: any) {
      toastError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-zinc-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Verify Your Account</h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Please enter the 6-digit verification code sent to your email address.
          </p>
        </div>

        {otpFromState && (
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center text-xs">
            <span className="font-semibold text-zinc-600">Simulated Testing Code: </span>
            <strong className="font-mono font-bold text-zinc-950 text-sm">{otpFromState}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">6-Digit Verification Code</label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="w-full p-3 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950 font-mono text-center text-lg tracking-widest font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying || code.length < 6}
            className="w-full py-3 rounded-xl bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span>{isVerifying ? 'Verifying...' : 'Verify & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="font-bold text-zinc-950 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Resend Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};
