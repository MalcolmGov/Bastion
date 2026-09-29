'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    role: 'platform_admin',
    name: 'Malcolm Govender',
    title: 'Moove Digital Lead & Platform Admin',
    email: 'malcolm@movedigital.africa',
    desc: 'Full platform administration & Moove Digital portal management'
  },
  {
    role: 'platform_admin',
    name: 'Sarah Jenkins',
    title: 'Platform Administrator',
    email: 'admin@goldfields.com',
    desc: 'Full global system administration & user permissions'
  },
  {
    role: 'content_editor',
    name: 'Kofi Mensah',
    title: 'Senior Content Editor',
    email: 'editor@goldfields.com',
    desc: 'Draft creation & content updates (West Africa scope)'
  },
  {
    role: 'reviewer',
    name: 'Elena Rostova',
    title: 'Compliance Reviewer',
    email: 'reviewer@goldfields.com',
    desc: 'Legal, ESG & factual compliance sign-off'
  },
  {
    role: 'publisher',
    name: 'Marcus Vance',
    title: 'Corporate Publisher',
    email: 'publisher@goldfields.com',
    desc: 'Final release publishing & two-person financial sign-off'
  },
  {
    role: 'analyst',
    name: 'Thabo Mokoena',
    title: 'IR Analyst',
    email: 'analyst@goldfields.com',
    desc: 'Analytics, report downloads & performance audits'
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
    <div className="min-h-screen bg-[#070b11] text-white flex flex-col justify-between selection:bg-[#C99700] selection:text-black">
      {/* Top Banner */}
      <div className="border-b border-[#1E293B]/60 bg-[#0B111A]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-[#C99700] flex items-center justify-center font-bold text-black text-sm tracking-wider">
            GF
          </div>
          <div>
            <span className="font-semibold text-sm tracking-wide text-white">GOLD FIELDS</span>
            <span className="text-[#C99700] font-mono text-xs ml-2 uppercase px-1.5 py-0.5 rounded bg-[#C99700]/10 border border-[#C99700]/30">
              Studio OS
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-400 flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#C99700]" />
          <span>Internal Corporate Access Only</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="max-w-5xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Login Form */}
          <div className="lg:col-span-6 bg-[#0E1522] border border-[#1E293B] rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#C99700] font-semibold">
                  Gold Fields Content Operations
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Sign in to Studio</h1>
              <p className="text-sm text-gray-400 mb-6">
                Enterprise Content Management, Regulatory Disclosures &amp; Site Orchestration.
              </p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@goldfields.com"
                      required
                      className="w-full bg-[#080C14] border border-[#2A374A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700] focus:ring-1 focus:ring-[#C99700] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-[#080C14] border border-[#2A374A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700] focus:ring-1 focus:ring-[#C99700] transition"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Demo credentials pre-filled: <code className="text-gray-300 font-mono">GoldFields2026!</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold rounded-xl py-3 text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-[#C99700]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center space-x-2">
                      <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Session...</span>
                    </span>
                  ) : (
                    <>
                      <span>Sign In to Studio</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1E293B]/80 text-xs text-gray-500 flex items-center justify-between">
              <span>Gold Fields IT Security Protocol 2026</span>
              <span className="font-mono text-[10px] text-gray-400">v2.4.0-prod</span>
            </div>
          </div>

          {/* Right: Demo Role Quick Switcher */}
          <div className="lg:col-span-6 bg-[#0E1522]/60 border border-[#1E293B]/80 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#C99700]" />
                  <span>One-Click Role Demonstration</span>
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  5 Active Personas
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Click any persona below to immediately log in and preview Gold Fields Studio under that role&apos;s specific RBAC permissions and publishing authority:
              </p>

              <div className="space-y-3">
                {DEMO_PERSONAS.map((persona) => (
                  <button
                    key={persona.email}
                    onClick={() => selectPersona(persona.email)}
                    disabled={isLoading}
                    className="w-full text-left p-3.5 rounded-xl border border-[#223147] bg-[#0A101A] hover:bg-[#121B2B] hover:border-[#C99700]/50 transition group flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-white group-hover:text-[#D4AF37] transition">
                          {persona.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1B273A] text-gray-300 border border-gray-700">
                          {persona.role}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{persona.title}</div>
                      <div className="text-[11px] text-gray-500 mt-1">{persona.desc}</div>
                    </div>
                    <div className="shrink-0 mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition text-[#C99700]">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E293B]/60 text-[11px] text-gray-500">
              Note: Two-person sign-off is strictly enforced on H1/FY financial disclosures.
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1E293B]/40 py-4 px-6 text-center text-xs text-gray-500">
        © 2026 Gold Fields Limited • Internal Operations Platform • Engineered for Zero-Downtime Governance
      </div>
    </div>
  );
}
