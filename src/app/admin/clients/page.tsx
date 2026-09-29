'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  Globe,
  PlusCircle,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  Layers,
  Palette,
  Search,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function ClientsAndWebsitesPage() {
  const { clients, activeClient, setActiveClientId, setPortalViewMode } = useStudioWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const industries = [
    { id: 'all', label: 'All Industries' },
    { id: 'mining', label: 'Mining' },
    { id: 'agency', label: 'Digital Agency' },
    { id: 'finance', label: 'Wealth & Advisory' },
    { id: 'energy', label: 'Energy' },
  ];

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.websites?.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedIndustry === 'all') return true;
    if (selectedIndustry === 'mining') return c.industry.includes('mining') || c.id.includes('gold');
    if (selectedIndustry === 'agency') return c.industry.includes('agency') || c.industry.includes('digital') || c.id.includes('moove');
    if (selectedIndustry === 'finance') return c.industry.includes('finance') || c.industry.includes('wealth') || c.industry.includes('advisory');
    if (selectedIndustry === 'energy') return c.industry.includes('energy') || c.id.includes('swifter') || c.id.includes('solaris');
    return true;
  });

  const totalWebsites = clients.reduce((acc, c) => acc + (c.websites?.length || 1), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-bastion-blue dark:text-sky-400">
              Bastion Platform
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Multi-Tenant Client Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Clients &amp; Managed Websites
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Each corporate tenant has isolated content permissions, white-labeled client CMS access, and automated live website synchronization.
          </p>
        </div>

        <Link
          href="/admin/create"
          className="px-4 py-2.5 rounded-xl bg-bastion hover:bg-bastion-navy dark:bg-sky-500 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-xs tracking-wider uppercase transition shadow-sm flex items-center space-x-2 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Client Website</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corporate Clients</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{clients.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active Tenants</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hosted Websites</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">{totalWebsites}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">100% Online</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Edge Latency</div>
          <div className="text-2xl font-bold text-bastion-blue dark:text-sky-400 mt-1 tabular-nums">42ms</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Johannesburg CDN</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security &amp; SSL</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">A+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strict Transport</div>
        </div>
      </div>

      {/* Toolbar: Search and Industry Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, sectors, or websites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-bastion-blue"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {industries.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSelectedIndustry(ind.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedIndustry === ind.id
                  ? 'bg-bastion text-white dark:bg-slate-800 dark:text-white font-semibold shadow-2xs'
                  : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredClients.map((client) => {
          const isActive = client.id === activeClient?.id;
          const isGF = client.id === 'client_goldfields';

          return (
            <div
              key={client.id}
              className={`p-6 rounded-2xl border transition ${
                isActive
                  ? 'bg-white dark:bg-[#111726] border-bastion-blue dark:border-sky-500/80 ring-2 ring-bastion-blue/20 dark:ring-sky-500/20 shadow-md'
                  : 'bg-white dark:bg-[#0D121B] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                    isGF
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-bastion-blue dark:text-sky-400'
                  }`}>
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {client.name}
                      </h2>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950 text-bastion-blue dark:text-sky-300 border border-blue-200 dark:border-sky-800 font-semibold shrink-0">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono capitalize mt-0.5">
                      Sector: {client.industry.replace('_', ' ')} &bull; Slug: <span className="text-slate-700 dark:text-slate-300 font-semibold">/{client.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveClientId(client.id);
                      setPortalViewMode('client');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <span>Open in Client CMS</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/admin/editor?siteSlug=${client.websites?.[0]?.slug || client.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Visual Editor</span>
                  </Link>
                </div>
              </div>

              {/* Websites for this Client */}
              <div className="pt-4 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Websites &amp; Environments ({client.websites?.length || 0})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.websites?.map((site) => (
                    <div
                      key={site.id}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-[#131A26] border border-slate-200 dark:border-[#232F42] flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-[#182130] transition"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{site.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0 font-medium">
                            {site.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          Domain: {site.primaryDomain || (isGF ? 'goldfields.com' : `${site.slug}.bastion.digital`)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <Link
                          href={client.id === 'client_goldfields' ? '/' : `/sites/${site.slug}`}
                          target="_blank"
                          title="Open live site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
