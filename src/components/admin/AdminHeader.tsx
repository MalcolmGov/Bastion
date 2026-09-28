'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { Clock, ExternalLink, ShieldCheck, ChevronRight, Bell, RefreshCw } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [sastTime, setSastTime] = useState<string>('');
  const [utcTime, setUtcTime] = useState<string>('');
  const [workerRunning, setWorkerRunning] = useState(false);
  const [workerMessage, setWorkerMessage] = useState<string | null>(null);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      // SAST is UTC+2
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

  const triggerWorker = async () => {
    setWorkerRunning(true);
    setWorkerMessage(null);
    try {
      const res = await fetch('/api/admin/worker/run', { method: 'POST' });
      const data = await res.json();
      setWorkerMessage(`Worker run complete: ${data.message || 'All checks passed'}`);
      setTimeout(() => setWorkerMessage(null), 4000);
    } catch (err: any) {
      setWorkerMessage('Worker trigger failed');
      setTimeout(() => setWorkerMessage(null), 4000);
    } finally {
      setWorkerRunning(false);
    }
  };

  // Derive breadcrumb from pathname
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#080D14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs">
        <Link href="/admin" className="text-gray-400 hover:text-white transition font-medium">
          Studio
        </Link>
        {segments.slice(1).map((seg, idx) => (
          <React.Fragment key={seg}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="capitalize font-semibold text-[#E6C657]">
              {seg.replace('-', ' ')}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: Operational Monitors & Dual Timezone */}
      <div className="flex items-center space-x-4">
        {/* Worker Notice Toast */}
        {workerMessage && (
          <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 animate-fadeIn">
            {workerMessage}
          </span>
        )}

        {/* Dual Timezone Clock */}
        <div className="hidden md:flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-[#0D1420] border border-[#1E293B] text-xs font-mono">
          <div className="flex items-center space-x-1.5 text-gray-300">
            <span className="text-[10px] text-gray-500 font-sans uppercase font-bold">SAST</span>
            <span className="text-[#D4AF37] font-semibold">{sastTime || '--:--:--'}</span>
          </div>
          <span className="text-gray-700">|</span>
          <div className="flex items-center space-x-1.5 text-gray-300">
            <span className="text-[10px] text-gray-500 font-sans uppercase font-bold">UTC</span>
            <span>{utcTime || '--:--:--'}</span>
          </div>
        </div>

        {/* Worker Trigger */}
        <button
          onClick={triggerWorker}
          disabled={workerRunning}
          title="Run background scheduler & link check"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#141E2D] hover:bg-[#1C2A3E] border border-[#23334A] text-xs text-gray-300 hover:text-white transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C99700] ${workerRunning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Run Worker</span>
        </button>

        {/* Live Site Preview Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C99700]/20 to-[#E6C657]/10 border border-[#C99700]/30 text-xs text-[#E6C657] hover:brightness-110 transition"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </header>
  );
}
