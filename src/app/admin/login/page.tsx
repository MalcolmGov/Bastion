'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-[#05070B] text-white flex flex-col justify-between relative overflow-hidden selection:bg-sky-500 selection:text-white font-sans antialiased">
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
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors duration-150 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50"
          >
            <span>Gold Fields Corporate</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-lg">
          {/* Signature Card Container with Glowing Motion Border & Ambient Back Glow */}
          <div className="relative group">
            {/* 1. Ambient Diffused Back Shadow / Glow Card */}
            <div 
              className="absolute -inset-1.5 sm:-inset-2 rounded-[36px] blur-2xl opacity-75 dark:opacity-60 transition-all duration-700 pointer-events-none animate-pulse-slow"
              style={{
                background: 'radial-gradient(ellipse at 20% 50%, rgba(2, 132, 199, 0.5) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.45) 0%, transparent 60%), linear-gradient(135deg, rgba(2, 132, 199, 0.35) 0%, rgba(59, 130, 246, 0.3) 30%, rgba(6, 182, 212, 0.25) 60%, rgba(139, 92, 246, 0.35) 100%)'
              }}
            />

            {/* 2. Glowing Popping Gradient Motion Border Frame */}
            <div 
              className="relative p-[2px] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                background: 'linear-gradient(115deg, #0284C7, #3B82F6, #06B6D4, #10B981, #F59E0B, #EC4899, #0284C7)'
              }}
            >
              {/* Continuous Motion Layer for the Gradient Border */}
              <div 
                className="absolute inset-0 animate-gradient-border pointer-events-none"
                style={{
                  background: 'linear-gradient(115deg, #0284C7, #3B82F6, #06B6D4, #10B981, #F59E0B, #EC4899, #0284C7)',
                  backgroundSize: '300% 300%'
                }}
              />

              {/* Rotating Conic Light Sheen Traveling Around the Border Perimeter */}
              <div className="absolute inset-[-150%] pointer-events-none opacity-60 mix-blend-overlay">
                <div 
                  className="w-full h-full animate-border-spin"
                  style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, rgba(255, 255, 255, 0.95) 315deg, transparent 360deg)'
                  }}
                />
              </div>

              {/* 3. Card Content Surface */}
              <div className="relative rounded-[30px] p-8 sm:p-10 overflow-hidden backdrop-blur-2xl bg-[#090D17]/95 border border-white/5 transition-all duration-300">
                {/* Animated Aurora Glow Orbs */}
                <div 
                  className="absolute -top-28 -right-28 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
                  style={{
                    background: 'radial-gradient(circle, rgba(2, 132, 199, 0.25) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)'
                  }}
                />
                <div 
                  className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-pulse-slow-reverse"
                  style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(6, 182, 212, 0.12) 50%, transparent 70%)'
                  }}
                />

                {/* Animated Shimmer Top Border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-75"
                  style={{
                    background: 'linear-gradient(90deg, #0284C7 0%, #A855F7 50%, #4F46E5 100%)'
                  }}
                >
                  <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-shimmer-sweep" />
                </div>

                {/* Card Header & Brand Pill */}
                <div className="text-center space-y-3 mb-8 relative z-10">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-300 text-xs font-semibold tracking-wider uppercase shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Bastion Enterprise Identity</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                    Sign in to Bastion Studio
                  </h1>

                  <p className="text-sm text-slate-300/90 leading-relaxed max-w-sm mx-auto font-normal">
                    Autonomous Multi-Tenant Orchestration, Headless Dynamic Zones &amp; Fleet Governance.
                  </p>
                </div>

                {/* Error Alert Banner */}
                {error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-1 relative z-10">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed font-medium">{error}</span>
                  </div>
                )}

                {/* Sign In Form */}
                <form onSubmit={handleLogin} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} className="space-y-5 relative z-10">
                  {/* Corporate Email Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Corporate Email
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium font-mono">Required</span>
                    </div>

                    <div className="relative group/input">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-400 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@movedigital.africa"
                        required
                        autoComplete="email"
                        className="w-full bg-[#070A12]/90 border border-slate-700/80 hover:border-slate-600 focus:border-sky-400 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 transition-all font-medium selection:bg-sky-500"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                        Password
                      </label>
                      <span className="text-[11px] text-slate-400 font-medium font-mono">Required</span>
                    </div>

                    <div className="relative group/input">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within/input:text-sky-400 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        autoComplete="current-password"
                        className="w-full bg-[#070A12]/90 border border-slate-700/80 hover:border-slate-600 focus:border-sky-400 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-sky-400/30 transition-all font-medium selection:bg-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition cursor-pointer p-0.5"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Caps Lock Warning */}
                    {isCapsLockOn && (
                      <div className="text-xs text-amber-400 flex items-center space-x-1.5 animate-in fade-in font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Caps Lock is ON</span>
                      </div>
                    )}
                  </div>

                  {/* Remember Session & Clearance Help */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#080B12] border border-slate-700 text-sky-500 focus:ring-sky-500/30 focus:ring-offset-0 cursor-pointer accent-sky-500"
                      />
                      <span className="text-xs font-medium">Remember session</span>
                    </label>

                    <a
                      href="mailto:security@movedigital.africa?subject=Bastion%20Access%20Clearance"
                      className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors underline-offset-2 hover:underline"
                    >
                      Need security clearance?
                    </a>
                  </div>

                  {/* Submit Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl py-3.5 text-sm tracking-wide flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {isLoading ? (
                      <span className="flex items-center space-x-2 font-medium">
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
                <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 font-medium relative z-10">
                  <span className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300">SOC-2 Certified</span>
                  </span>
                  <span className="text-slate-700">&bull;</span>
                  <span className="flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-300">256-Bit HSM Encrypted</span>
                  </span>
                  <span className="text-slate-700">&bull;</span>
                  <span className="flex items-center space-x-1.5">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-slate-300">Zero-Trust RBAC</span>
                  </span>
                </div>
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
