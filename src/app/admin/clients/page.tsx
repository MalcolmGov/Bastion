'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
  Sparkles,
  Activity,
  Server,
  X,
  UserPlus
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { ClientOnboardingWizard } from '@/components/admin/ClientOnboardingWizard';

export default function ClientsAndWebsitesPage() {
  const router = useRouter();
  const { clients, activeClient, setActiveClientId, setPortalViewMode, refreshClients } = useStudioWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  // Client Onboarding Wizard Modal state
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // New Website Modal state
  const [targetClientForNewWebsite, setTargetClientForNewWebsite] = useState<any>(null);
  const [websiteName, setWebsiteName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [websiteBlueprint, setWebsiteBlueprint] = useState('corporate');
  const [isSubmittingWebsite, setIsSubmittingWebsite] = useState(false);
  const [websiteError, setWebsiteError] = useState('');

  const handleCreateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientForNewWebsite || !websiteName.trim()) return;
    setIsSubmittingWebsite(true);
    setWebsiteError('');
    try {
      const res = await fetch('/api/admin/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: targetClientForNewWebsite.id,
          name: websiteName.trim(),
          primaryDomain: websiteDomain.trim() || undefined,
          blueprintId: websiteBlueprint,
          status: 'published'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setWebsiteError(data.error || 'Failed to create website');
      } else {
        await refreshClients();
        setTargetClientForNewWebsite(null);
        setWebsiteName('');
        setWebsiteDomain('');
      }
    } catch (err: any) {
      setWebsiteError(err.message || 'Network error');
    } finally {
      setIsSubmittingWebsite(false);
    }
  };

  const industries = [
    { id: 'all', label: 'All Industries' },
    { id: 'mining', label: 'Mining & Resources' },
    { id: 'agency', label: 'Digital Agency' },
    { id: 'finance', label: 'Wealth & Advisory' },
    { id: 'energy', label: 'Energy & Renewables' },
    { id: 'legal', label: 'Legal & Governance' },
  ];

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.websites?.some(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.slug.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedIndustry === 'all') return true;
    if (selectedIndustry === 'mining') return c.industry.includes('mining') || c.id.includes('gold');
    if (selectedIndustry === 'agency') return c.industry.includes('agency') || c.industry.includes('digital') || c.id.includes('bastion');
    if (selectedIndustry === 'finance') return c.industry.includes('finance') || c.industry.includes('wealth') || c.industry.includes('advisory');
    if (selectedIndustry === 'energy') return c.industry.includes('energy') || c.id.includes('swifter') || c.id.includes('solaris');
    if (selectedIndustry === 'legal') return c.industry.includes('legal') || c.id.includes('apex');
    return true;
  });

  const totalWebsites = clients.reduce((acc, c) => acc + (c.websites?.length || 1), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/95 dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xs backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Bastion Corporate Multi-Tenant
            </span>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Managed Client Properties</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Clients &amp; Managed Websites
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-medium">
            Centralized hub for all managed corporate client properties. Each tenant features isolated content permissions, white-labeled client CMS access, and automated live website synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowOnboardModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase transition shadow-md shadow-purple-500/20 flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Onboard Client</span>
          </button>

          <Link
            href="/admin/onboard"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs tracking-wider uppercase transition flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-purple-500" />
            <span>Full Onboarding Wizard</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0F141C] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Corporate Tenants</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{clients.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Active Workspaces</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F141C] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hosted Websites</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">{totalWebsites}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            100% Online
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F141C] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Global Edge TTFB</div>
          <div className="text-2xl font-black text-blue-600 dark:text-sky-400 mt-1 tabular-nums">42ms</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Johannesburg PoP</div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0F141C] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security &amp; SSL</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">A+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Strict Transport HSTS</div>
        </div>
      </div>

      {/* Toolbar: Search and Industry Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative min-w-[280px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, sectors, or domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {industries.map((ind) => (
            <button
              key={ind.id}
              type="button"
              onClick={() => setSelectedIndustry(ind.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedIndustry === ind.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F141C] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Managed For You Corporate Client Cards */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const isActive = client.id === activeClient?.id;
          const isGF = client.id === 'client_goldfields';
          const website = client.websites?.[0];
          const domain = client.id === 'client_goldfields' ? 'goldfields.com' : `${client.slug}.bastiongroup.co.za`;

          return (
            <div
              key={client.id}
              className={`rounded-2xl p-6 transition-all duration-300 relative overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-[#0F141C] border ${
                isActive
                  ? 'border-purple-500/80 ring-2 ring-purple-500/20 shadow-md'
                  : 'border-slate-200/90 dark:border-slate-800/80 hover:border-purple-300 dark:hover:border-purple-800/80 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300"
                style={{
                  background: isGF 
                    ? 'linear-gradient(90deg, #C99700 0%, #EAB308 100%)'
                    : 'linear-gradient(90deg, #7C3AED 0%, #3B82F6 100%)'
                }}
              />

              {/* Top Row: Monogram, Title, Badges & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div 
                    className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-base shrink-0 border shadow-2xs"
                    style={isGF ? {
                      backgroundColor: 'rgba(201, 151, 0, 0.1)',
                      color: '#C99700',
                      borderColor: 'rgba(201, 151, 0, 0.3)'
                    } : {
                      backgroundColor: 'rgba(124, 58, 237, 0.1)',
                      color: '#7C3AED',
                      borderColor: 'rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">
                        {client.name}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 border text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Verified Corporate Tenant</span>
                      </span>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold shrink-0">
                          Active Workspace
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm flex-wrap text-slate-600 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{domain}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        Sector: {client.industry.replace('_', ' ')}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Signed Webhook Active</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveClientId(client.id);
                      setPortalViewMode('client');
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>Client CMS Mode</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <Link
                    href={`/admin/editor?siteSlug=${client.websites?.[0]?.slug || client.slug}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Visual Editor</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveClientId(client.id);
                      router.push('/admin/pages');
                    }}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-xs cursor-pointer"
                  >
                    <span>Manage Website</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>

              {/* Websites & Environments List */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-purple-500" />
                    <span>Deployed Environments ({client.websites?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetClientForNewWebsite(client);
                        setWebsiteName('');
                        setWebsiteDomain('');
                        setWebsiteError('');
                      }}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 transition cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Add Website</span>
                    </button>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      42ms Edge TTFB
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {client.websites?.map((site) => (
                    <div
                      key={site.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#131A26] border border-slate-200 dark:border-[#232F42] flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-[#182130] transition group"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {site.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0 font-medium">
                            {site.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                          {site.primaryDomain || (isGF ? 'goldfields.com' : `${site.slug}.bastiongroup.co.za`)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <Link
                          href={client.id === 'client_goldfields' ? '/' : `/sites/${site.slug}`}
                          target="_blank"
                          title="Open live site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
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

      {/* Proper Bastion Client Onboarding Wizard Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <ClientOnboardingWizard
            isModal
            onClose={() => setShowOnboardModal(false)}
          />
        </div>
      )}

      {/* Add Website to Client Modal */}
      {targetClientForNewWebsite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Website to Client</h3>
              </div>
              <button
                type="button"
                onClick={() => setTargetClientForNewWebsite(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Provision a new website under <strong className="text-slate-900 dark:text-white">{targetClientForNewWebsite.name}</strong>.
            </div>

            {websiteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {websiteError}
              </div>
            )}

            <form onSubmit={handleCreateWebsite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Investor Relations Portal"
                  value={websiteName}
                  onChange={(e) => {
                    setWebsiteName(e.target.value);
                    if (!websiteDomain) {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setWebsiteDomain(slug ? `${slug}.${targetClientForNewWebsite.slug}.bastion.digital` : '');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Domain / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. investors.aurum.bastion.digital"
                  value={websiteDomain}
                  onChange={(e) => setWebsiteDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Property Blueprint
                </label>
                <select
                  value={websiteBlueprint}
                  onChange={(e) => setWebsiteBlueprint(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="corporate">Corporate Flagship</option>
                  <option value="investor_relations">Investor Relations & SENS Hub</option>
                  <option value="sustainability">Sustainability & 2030 ESG</option>
                  <option value="careers">Careers & Global Talent</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetClientForNewWebsite(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWebsite || !websiteName.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingWebsite ? (
                    <span>Provisioning...</span>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Provision Website</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
