'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Building2, CheckCircle2, Sparkles, Layers, Globe } from 'lucide-react';
import { BastionLogo } from '@/components/admin/BastionLogo';

const DEMO_PERSONAS = [
  {
    role: 'platform_admin',
    name: 'Malcolm Govender',
    title: 'Bastion Group Executive & Platform Architect',
    email: 'malcolm@bastiongroup.co.za',
    desc: 'Full agency administration, multi-tenant fleet governance & client onboarding',
    isPrimary: true
  },
  {
    role: 'client_admin',
    name: 'Sarah Jenkins',
    title: 'Corporate Client Lead (Gold Fields Flagship)',
    email: 'admin@goldfields.com',
    desc: 'Managed client workspace, brand kit governance & publishing sign-offs',
    isPrimary: false
  },
  {
    role: 'content_editor',
    name: 'Kofi Mensah',
    title: 'Senior Content Editor (West Africa Operations)',
    email: 'editor@goldfields.com',
    desc: 'Dynamic zones modular composition, drafts & AI agent reframing',
    isPrimary: false
  },
  {
    role: 'reviewer',
    name: 'Elena Rostova',
    title: 'Legal & SENS Compliance Officer',
    email: 'reviewer@goldfields.com',
    desc: 'Automated JSE/SAMREC audits, factual verification & disclaimer sign-offs',
    isPrimary: false
  },
  {
    role: 'publisher',
    name: 'Marcus Vance',
    title: 'Corporate Publishing Director',
    email: 'publisher@goldfields.com',
    desc: 'Instant edge cache purging (<500ms), multi-channel releases & webhooks',
    isPrimary: false
  },
  {
    role: 'analyst',
    name: 'Thabo Mokoena',
    title: 'IR & Website Vitals Analyst',
    email: 'analyst@goldfields.com',
    desc: 'Edge TTFB latencies, fleet telemetry & visitor conversion tracking',
    isPrimary: false
  }
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('GoldFields2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const submitEmail = customEmail || email;

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: submitEmail, password: 'GoldFields2026!' })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectPersona = (pEmail: string) => {
    setEmail(pEmail);
    setPassword('GoldFields2026!');
    handleLogin(undefined, pEmail);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#1A2234] bg-[#0A0D15]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <BastionLogo variant="full" size="md" showCmsBadge={true} color="white" />
          <span className="hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
            Platform Studio OS &bull; v3.2.0
          </span>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline font-medium">Enterprise Sovereign Cloud &bull; SOC2 / JSE Compliant</span>
          <span className="sm:hidden font-medium">Sovereign Vault</span>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Sign In Form */}
          <div className="lg:col-span-5 bg-[#0E131F] border border-[#1E293B] rounded-2xl p-7 sm:p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            {/* Subtle luxury glow effect */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-sky-500/10 to-indigo-500/0 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="flex items-center space-x-2 mb-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] uppercase tracking-widest text-sky-400 font-bold">
                  Bastion Platform Intelligence
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                Sign in to Bastion
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                Multi-Tenant Headless Content Lake, Dynamic Zones &amp; Autonomous Corporate Site Orchestration.
              </p>

              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start space-x-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="malcolm@bastiongroup.co.za"
                      required
                      className="w-full bg-[#080B12] border border-[#232F42] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#080B12] border border-[#232F42] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
                    <span>Demo credentials pre-filled:</span>
                    <code className="text-sky-300 font-mono font-bold bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-800/40">GoldFields2026!</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-sky-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl py-3 text-xs sm:text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-sky-600/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Session...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Bastion Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-5 border-t border-[#1C2538] text-[11px] text-slate-500 flex items-center justify-between">
              <span>Bastion Security Protocol 2026</span>
              <span className="font-mono text-[10px] text-slate-400">v3.2.0-enterprise</span>
            </div>
          </div>

          {/* Right Column: Demo Persona Quick Switcher */}
          <div className="lg:col-span-7 bg-[#0E131F]/70 border border-[#1E293B] rounded-2xl p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>One-Click Role Demonstration</span>
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold uppercase tracking-wider">
                  6 Active Personas
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Select any corporate persona below to test Bastion Studio across agency governance, client brand management, regulatory sign-offs, and multi-tenant dynamic zones:
              </p>

              <div className="space-y-2.5">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.email}
                    type="button"
                    onClick={() => selectPersona(persona.email)}
                    disabled={isLoading}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-150 group flex items-start justify-between ${
                      persona.isPrimary
                        ? 'border-sky-500/50 bg-[#121A2C] hover:bg-[#16223A] ring-1 ring-sky-500/30'
                        : 'border-[#1C2638] bg-[#0A0E18] hover:bg-[#111726] hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`font-bold text-xs sm:text-sm transition ${persona.isPrimary ? 'text-sky-300 group-hover:text-white' : 'text-white group-hover:text-sky-300'}`}>
                          {persona.name}
                        </span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#172033] text-slate-300 border border-slate-700 font-semibold">
                          {persona.role}
                        </span>
                        {persona.isPrimary && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            Bastion Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium">{persona.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-tight truncate max-w-md">{persona.desc}</div>
                    </div>
                    <div className="shrink-0 mt-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition text-sky-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2538] text-[11px] text-slate-500 flex items-center justify-between">
              <span>Tenant boundaries &amp; signed webhooks enforced per client workspace.</span>
              <span className="text-slate-400 font-mono text-[10px]">Multi-Tenant RBAC</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A2234] py-4 px-6 text-center text-xs text-slate-500">
        &copy; 2026 Bastion Group. All rights reserved. &bull; Bastion Enterprise CMS &amp; Digital Experience Platform &bull; Engineered for Multi-Tenant Sovereign Governance
      </footer>
    </div>
  );
}
