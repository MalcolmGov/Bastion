'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Server
} from 'lucide-react';
import { BastionLogo } from '@/components/admin/BastionLogo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monitor Caps Lock key state for enhanced user experience
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setIsCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-white flex flex-col justify-between relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Dynamic Background Atmosphere Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ambient Top Glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-sky-500/15 via-indigo-600/10 to-transparent rounded-full blur-[140px] animate-pulse duration-10000" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 -right-48 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />

        {/* High-Precision High-Tech Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '3.5rem 3.5rem',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%)'
          }}
        />
      </div>

      {/* Top Executive Header Bar */}
      <header className="relative z-10 border-b border-slate-800/60 bg-[#070A10]/75 backdrop-blur-xl px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <BastionLogo variant="full" size="md" showCmsBadge={true} color="white" />
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/80 shadow-xs">
            Platform Studio OS &bull; v3.2.0
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">Sovereign Vault Protocol</span>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline text-[11px] font-medium text-slate-300">
              SOC-2 Type II Certified
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          {/* Glowing Animated Outer Border Card */}
          <div className="relative group">
            {/* Animated Gradient Motion Halo */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/30 via-indigo-500/25 to-purple-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

            {/* Inner Glassmorphic Surface */}
            <div className="relative bg-[#0B0F19]/90 border border-slate-800/90 rounded-3xl p-8 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
              {/* Card Header & Brand Pill */}
              <div className="text-center space-y-3 mb-8">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-[10px] font-bold uppercase tracking-widest shadow-xs">
                  <Shield className="w-3 h-3 text-sky-400" />
                  <span>Bastion Enterprise Identity</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Sign in to Bastion Studio
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Autonomous Multi-Tenant Orchestration, Headless Dynamic Zones &amp; Fleet Governance.
                </p>
              </div>

              {/* Error Alert Banner */}
              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleLogin} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} className="space-y-5">
                {/* Corporate Email Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Corporate Email
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Required</span>
                  </div>

                  <div className="relative group/input">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within/input:text-sky-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@movedigital.africa"
                      required
                      autoComplete="email"
                      className="w-full bg-[#080B12] border border-[#232F42] hover:border-slate-700 focus:border-sky-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 transition font-medium"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">Required</span>
                  </div>

                  <div className="relative group/input">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within/input:text-sky-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full bg-[#080B12] border border-[#232F42] hover:border-slate-700 focus:border-sky-500 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 transition font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Caps Lock Warning */}
                  {isCapsLockOn && (
                    <div className="text-[11px] text-amber-400 flex items-center space-x-1.5 animate-in fade-in">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Caps Lock is ON</span>
                    </div>
                  )}
                </div>

                {/* Remember Session & Clearance Help */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-[#080B12] border border-[#232F42] text-sky-500 focus:ring-sky-500/30 focus:ring-offset-0 cursor-pointer accent-sky-500"
                    />
                    <span className="text-[11px]">Remember session</span>
                  </label>

                  <a
                    href="mailto:security@movedigital.africa?subject=Bastion%20Access%20Clearance"
                    className="text-[11px] text-sky-400 hover:text-sky-300 transition underline-offset-2 hover:underline"
                  >
                    Need security clearance?
                  </a>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold rounded-xl py-3.5 text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Identity...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Bastion Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Institutional Trust Badges */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>SOC-2 Certified</span>
                </span>
                <span className="text-slate-700">&bull;</span>
                <span className="flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-sky-400" />
                  <span>256-Bit HSM Encrypted</span>
                </span>
                <span className="text-slate-700">&bull;</span>
                <span className="flex items-center space-x-1">
                  <Server className="w-3 h-3 text-purple-400" />
                  <span>Zero-Trust RBAC</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        &copy; 2026 Bastion Group. All rights reserved. &bull; Bastion Enterprise Digital Experience Platform &bull; Engineered for Multi-Tenant Sovereign Governance
      </footer>
    </div>
  );
}
