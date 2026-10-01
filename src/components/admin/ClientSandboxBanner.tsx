'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRightLeft,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Building2,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import { useAdminAuth } from './AdminAuthProvider';
import { isAgencyUser } from '@/lib/auth/roles';

export function ClientSandboxBanner() {
  const { user } = useAdminAuth();
  const agency = isAgencyUser(user);

  const {
    portalViewMode,
    setPortalViewMode,
    clients,
    activeClient,
    setActiveClientId,
    activeSite,
    setActiveSiteId
  } = useStudioWorkspace();

  // Strictly agency-only: provisioned client accounts must never see the sandbox banner or switch clients
  if (!agency || portalViewMode !== 'client') {
    return null;
  }

  const isGoldFields = activeClient?.id === 'client_goldfields';
  const siteUrl = isGoldFields
    ? '/'
    : activeSite
      ? `/sites/${activeSite.slug}`
      : '/';

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setActiveClientId(selectedId);
    const targetClient = clients.find(c => c.id === selectedId);
    if (targetClient && targetClient.websites && targetClient.websites.length > 0) {
      setActiveSiteId(targetClient.websites[0].id);
    }
  };

  return (
    <div className="sticky top-16 sm:top-[68px] z-20 bg-gradient-to-r from-[#171206] via-[#101522] to-[#171206] border-b border-amber-500/35 text-slate-100 shadow-md backdrop-blur-xl px-3 sm:px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left Side: Simulation Status & Client Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
          {/* Glowing Beacon & Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Client Experience Sandbox</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-200/90 font-medium">
            <span>Simulating Portal:</span>
          </div>

          {/* Inline Client Switcher Dropdown */}
          <div className="relative inline-flex items-center">
            <select
              value={activeClient?.id || ''}
              onChange={handleClientChange}
              className="appearance-none pl-3 pr-8 py-1 rounded-lg text-xs font-bold bg-[#1C2333] hover:bg-[#252F45] border border-amber-500/30 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 transition cursor-pointer shadow-inner"
              title="Switch client to simulate different corporate portals"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#101522] text-white">
                  {c.name} ({c.industry.replace('_', ' ')})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Subtitle description */}
          <span className="text-[11px] text-slate-400 hidden xl:inline truncate max-w-md">
            Zero-code, distraction-free CMS delivered to corporate client teams.
          </span>
        </div>

        {/* Right Side: Role & Exit Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-auto">
          {/* Simulated Role */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-900/80 border border-slate-700/70 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Role: Corporate Content Editor</span>
          </div>

          {/* Live Website Link */}
          <Link
            href={siteUrl}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 transition"
            title="Preview live public website in new tab"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Exit Simulation / Switch to Bastion Studio */}
          <button
            type="button"
            onClick={() => setPortalViewMode('agency')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all transform active:scale-95 cursor-pointer"
            title="Return to full Bastion Agency Operations"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-950" />
            <span>Switch to Bastion Agency Studio &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
