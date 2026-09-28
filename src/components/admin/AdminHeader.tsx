'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import { Clock, ExternalLink, ChevronRight, Globe, CheckCircle2 } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { activeClient, activeSite } = useStudioWorkspace();
  const [sastTime, setSastTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setSastTime(
        now.toLocaleTimeString('en-ZA', {
          timeZone: 'Africa/Johannesburg',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
      setUtcTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const segments = pathname.split('/').filter(Boolean);
  const isGoldFields = activeClient?.id === 'client_goldfields';
  const siteUrl = isGoldFields ? '/' : activeSite ? `/sites/${activeSite.slug}` : '/';

  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#0A0D14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs & Client Pill */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141C2A] border border-[#232F42] text-slate-300 font-medium">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-white">{activeClient?.name || 'Move Studio'}</span>
          {activeSite && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{activeSite.name}</span>
            </>
          )}
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

        <div className="flex items-center space-x-1.5">
          <Link href="/admin" className="text-slate-400 hover:text-white transition font-medium">
            Studio
          </Link>
          {segments.slice(1).map((seg) => (
            <React.Fragment key={seg}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="capitalize font-semibold text-sky-400">
                {seg.replace('-', ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Operational Status, Dual Timezone & Live Website Link */}
      <div className="flex items-center space-x-4">
        {/* Dual Timezone Clock */}
        <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-[#0D1420] border border-[#1E293B] text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">SAST</span>
            <span className="text-sky-400 font-semibold">{sastTime || '--:--:--'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">UTC</span>
            <span>{utcTime || '--:--:--'}</span>
          </div>
        </div>

        {/* View Website Link */}
        <Link
          href={siteUrl}
          target="_blank"
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 text-sky-300 text-xs font-semibold transition shadow-xs"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
        </Link>
      </div>
    </header>
  );
}
