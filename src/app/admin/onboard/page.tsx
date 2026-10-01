'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { ClientOnboardingWizard } from '@/components/admin/ClientOnboardingWizard';

export default function AdminOnboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/admin" className="hover:text-purple-600 transition">
            Agency Operations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/admin/clients" className="hover:text-purple-600 transition">
            Clients &amp; Websites
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-900 dark:text-white">
            Onboard Corporate Client
          </span>
        </div>

        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Fleet</span>
        </Link>
      </div>

      {/* Full Multi-Step Onboarding Wizard */}
      <ClientOnboardingWizard />
    </div>
  );
}
