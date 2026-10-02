'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Lock,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Building2,
  UserCheck,
  Loader2
} from 'lucide-react';
import { BastionLogo } from '@/components/admin/BastionLogo';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invitedUser, setInvitedUser] = useState<{
    name: string;
    email: string;
    role: string;
    clientName: string;
    clientId: string | null;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setError('No invitation token found in the URL. Please verify your link.');
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(`/api/admin/auth/accept-invite?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.valid && data.user) {
          setTokenValid(true);
          setInvitedUser(data.user);
        } else {
          setTokenValid(false);
          setError(data.error || 'This invitation link is invalid or has expired.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setError('Network error verifying invitation. Please try again.');
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to activate account.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error activating account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLength = password.length >= 12;
  const hasMixed = /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password);

  return (
    <div className="min-h-screen bg-[#05070B] text-white flex flex-col justify-between relative overflow-hidden selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-sky-500/15 via-indigo-600/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '3.5rem 3.5rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/60 bg-[#070A10]/75 backdrop-blur-xl px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <BastionLogo variant="full" size="md" showCmsBadge={true} color="white" />
        </div>
        <Link
          href="/admin/login"
          className="text-xs font-medium text-slate-400 hover:text-white transition flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
        >
          <span>Existing Account? Sign In</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[480px]">
          {isValidating ? (
            <div className="bg-[#0C1017]/90 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-xl text-center shadow-2xl space-y-4">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                Verifying your corporate invitation...
              </div>
            </div>
          ) : !tokenValid ? (
            <div className="bg-[#0C1017]/90 border border-rose-900/40 rounded-2xl p-8 backdrop-blur-xl text-center shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-white">Invitation Link Unavailable</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  {error || 'This invitation has either expired, already been accepted, or is invalid.'}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition border border-slate-700"
                >
                  <span>Go to Login Screen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="bg-[#0C1017]/90 border border-emerald-900/40 rounded-2xl p-8 backdrop-blur-xl text-center shadow-2xl space-y-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Corporate Access Activated!</h2>
                <p className="text-xs text-slate-400">
                  Welcome to {invitedUser?.clientName || 'Bastion'}. Logging you in now...
                </p>
              </div>
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mx-auto pt-2" />
            </div>
          ) : (
            <div className="bg-[#0C1017]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Workspace Badge & Title */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{invitedUser?.clientName || 'Bastion Corporate Client'}</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Set Your Corporate Password
                </h1>
                <p className="text-xs text-slate-400">
                  Welcome, <strong className="text-slate-200">{invitedUser?.name}</strong> ({invitedUser?.email}). Set a secure password to activate your access.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    New Corporate Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 12 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Confirm Corporate Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-mono"
                  />
                </div>

                {/* Password strength checks */}
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>At least 12 characters in length</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasMixed ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Includes uppercase, lowercase, and numbers</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !hasLength}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating Access...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Activate Account &amp; Enter CMS</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/40 bg-[#070A10]/60 backdrop-blur-md px-6 py-4 text-center text-slate-500 text-xs">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Protected by Bastion Multi-Tenant Edge Security &bull; End-to-End Encrypted Session</span>
        </div>
      </footer>
    </div>
  );
}

export default function AdminInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05070B] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
