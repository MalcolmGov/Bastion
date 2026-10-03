'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { isAgencyUser } from '@/lib/auth/roles';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';
import { BastionLogo } from './BastionLogo';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Palette,
  Layers,
  Edit3,
  FileText,
  Send,
  BarChart3,
  Activity,
  Settings,
  Compass,
  FileSpreadsheet,
  Table,
  Newspaper,
  Leaf,
  ExternalLink,
  Building,
  Check,
  CreditCard,
  Terminal,
  UserPlus,
  Bot,
  ArrowRightLeft,
  Globe,
  Globe2,
  SlidersHorizontal,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  CalendarCheck,
  ShieldAlert,
  ShieldCheck,
  Key,
  Briefcase,
  Scale,
  BookOpen,
  ChevronDown,
  ChevronsLeft,
  CheckCircle,
  Home,
  Plus,
  X
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const {
    clients,
    activeClient,
    activeSite,
    clientWebsites,
    setActiveClientId,
    setActiveSiteId,
    createWebsite,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [newWebsiteName, setNewWebsiteName] = useState('');
  const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
  const [newWebsiteBlueprint, setNewWebsiteBlueprint] = useState('corporate');
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [createWebsiteError, setCreateWebsiteError] = useState('');
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // Close workspace dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(event.target as Node)) {
        setWorkspaceDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize and persist collapsed state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bastion_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      } else if (window.location.pathname.startsWith('/admin/editor')) {
        // Auto-collapse on visual editor by default for maximum workspace canvas
        setIsCollapsed(true);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, []);

  // Listen to keyboard shortcut (Cmd+B / Ctrl+B) and external events
  useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed(prev => {
        const next = !prev;
        try { localStorage.setItem('bastion_sidebar_collapsed', String(next)); } catch {}
        return next;
      });
    };

    const handleSet = (e: any) => {
      const next = Boolean(e.detail?.collapsed);
      setIsCollapsed(next);
      try { localStorage.setItem('bastion_sidebar_collapsed', String(next)); } catch {}
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggle();
      }
    };

    window.addEventListener('toggle-admin-sidebar', handleToggle);
    window.addEventListener('set-admin-sidebar-collapsed', handleSet as any);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('toggle-admin-sidebar', handleToggle);
      window.removeEventListener('set-admin-sidebar-collapsed', handleSet as any);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try { localStorage.setItem('bastion_sidebar_collapsed', String(next)); } catch {}
  };

  const agency = isAgencyUser(user);
  const isClientPortal = !agency || portalViewMode === 'client';
  const isGoldFields = activeClient?.id === 'client_goldfields';

  const siteUrl = isGoldFields
    ? '/'
    : activeSite
      ? `/sites/${activeSite.slug}`
      : '/';

  const getNavItemProps = (isActive: boolean) => ({
    className: `group flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative cursor-pointer select-none ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white font-semibold shadow-md shadow-blue-600/30 ring-1 ring-white/20'
        : 'text-slate-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12]'
    }`
  });

  // Reusable Nav Item renderer for both collapsed and expanded states
  const renderItem = (
    href: string,
    label: string,
    Icon: any,
    isActive: boolean,
    badge?: string,
    badgeClass?: string,
    isExternal = false
  ) => {
    if (isCollapsed) {
      const iconButton = (
        <div
          title={`${label}${badge ? ` [${badge}]` : ''}`}
          className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all duration-200 relative cursor-pointer group ${
            isActive
              ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
          {badge && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#0D1522]" />
          )}
        </div>
      );

      return isExternal ? (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer">
          {iconButton}
        </a>
      ) : (
        <Link key={href} href={href}>
          {iconButton}
        </Link>
      );
    }

    // Expanded view
    const expandedButton = (
      <div {...getNavItemProps(isActive)}>
        <div className="flex items-center space-x-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:scale-105'}`} />
          <span className="truncate tracking-[-0.01em]">{label}</span>
        </div>
        {badge ? (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${badgeClass || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')}`}>
            {badge}
          </span>
        ) : isActive ? (
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] shrink-0" />
        ) : null}
      </div>
    );

    return isExternal ? (
      <a key={href} href={href} target="_blank" rel="noopener noreferrer">
        {expandedButton}
      </a>
    ) : (
      <Link key={href} href={href}>
        {expandedButton}
      </Link>
    );
  };

  const resultsSection = (
    <div>
      {!isCollapsed && (
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90 flex items-center justify-between">
          <span>AI & Results</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">New</span>
        </div>
      )}
      <div className="space-y-1">
        {renderItem(
          '/admin/editor?openIngest=true',
          'AI Ingest Report',
          Sparkles,
          false
        )}
        {renderItem(
          '/admin/results',
          'PDF to HTML',
          Table,
          pathname.startsWith('/admin/results')
        )}
      </div>
    </div>
  );

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-[#0D1522] text-slate-300 border-r border-slate-800/90 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 overflow-x-hidden transition-all duration-300 ease-in-out`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className={`p-3.5 border-b border-slate-800/80 ${isCollapsed ? 'flex flex-col items-center gap-2.5' : 'space-y-3'}`}>
          {isCollapsed ? (
            <>
              <Link href="/admin" title="Bastion Platform" className="shrink-0">
                <BastionLogo variant="monogram" size="sm" />
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand Sidebar (⌘B)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {/* Wordmark Header */}
              <div className="flex items-center justify-between pb-0.5">
                <Link href="/admin" className="inline-flex items-center gap-2 group">
                  <div className="border border-slate-700/80 bg-slate-900/60 rounded-lg px-2.5 py-1 inline-flex items-center gap-1.5 shadow-xs group-hover:border-slate-600 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                    <span className="font-serif font-bold text-sm tracking-tight text-white">Bastion</span>
                  </div>
                </Link>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60">
                  CMS
                </span>
              </div>

              {/* Workspace Switcher Card with Multi-Site Dropdown */}
              <div ref={workspaceDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 ring-1 ring-white/20">
                      {activeClient?.name ? activeClient.name.substring(0, 2).toUpperCase() : 'AU'}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="font-bold text-xs text-white truncate leading-tight group-hover:text-blue-300 transition-colors" title={activeClient?.name || 'Aurum Energy & Resources'}>
                        {activeClient?.name || 'Aurum Energy & Resources'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                        <span className="truncate text-slate-300 font-semibold max-w-[95px]" title={activeSite?.name || 'Flagship Portal'}>
                          {activeSite?.name || 'Flagship Portal'}
                        </span>
                        {clientWebsites.length > 1 && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                            {clientWebsites.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 shrink-0 ml-1 ${workspaceDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {/* Dropdown Popover */}
                {workspaceDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-200 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80 mb-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Globe className="w-3 h-3 text-blue-400" />
                        <span>Corporate Websites ({clientWebsites.length})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setWorkspaceDropdownOpen(false);
                          setShowAddWebsiteModal(true);
                        }}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Websites list */}
                    <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
                      {clientWebsites.map((site) => {
                        const isCurrent = site.id === activeSite?.id;
                        return (
                          <button
                            key={site.id}
                            type="button"
                            onClick={() => {
                              setActiveSiteId(site.id);
                              setWorkspaceDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer group ${
                              isCurrent
                                ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-xs'
                                : 'hover:bg-white/[0.06] text-slate-300 hover:text-white border border-transparent'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs truncate">{site.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                                  site.status === 'published'
                                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                    : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                                }`}>
                                  {site.status === 'published' ? 'Live' : 'Draft'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                {site.primaryDomain || `${site.slug}.bastion.digital`}
                              </div>
                            </div>
                            {isCurrent && (
                              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Agency Client Switcher Section */}
                    {isAgencyUser(user) && (
                      <div className="pt-2 mt-2 border-t border-slate-800/80">
                        <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Corporate Clients ({clients.length})
                        </div>
                        <div className="space-y-0.5 max-h-36 overflow-y-auto scrollbar-thin">
                          {clients.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setActiveClientId(c.id);
                                setWorkspaceDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                                c.id === activeClient?.id
                                  ? 'bg-purple-600/20 text-purple-300 font-bold'
                                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                              }`}
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{c.websites?.length || 1} sites</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Primary Navigation Sections */}
        <div className={`flex-1 ${isCollapsed ? 'p-2 space-y-3' : 'p-3 space-y-4'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800`}>
          {isClientPortal ? (
            /* CLIENT CMS WORKSPACE NAVIGATION */
            <>
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90">
                    {activeClient?.name ? `${activeClient.name.toUpperCase()} CONTENT` : 'WORKSPACE CONTENT'}
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin', 'Executive Overview', Home, pathname === '/admin')}
                  {renderItem('/admin/pages', 'Pages & Navigation', FileText, pathname === '/admin/pages')}
                  {isGoldFields ? (
                    <>
                      {renderItem('/admin/operations', 'Mining Operations', Compass, pathname.startsWith('/admin/operations'))}
                      {renderItem('/admin/reports', 'Financial Results', FileSpreadsheet, pathname.startsWith('/admin/reports'))}
                      {renderItem('/admin/sustainability', '2030 ESG Targets', Leaf, pathname.startsWith('/admin/sustainability'))}
                    </>
                  ) : (
                    <>
                      {renderItem('/admin/news', 'News & Articles', Newspaper, pathname.startsWith('/admin/news'))}
                    </>
                  )}
                  {!agency && renderItem('/admin/results', 'Financial publications', Table, pathname.startsWith('/admin/results'))}
                  {renderItem('/admin/calendar', 'IR & Financial Calendar', Calendar, pathname.startsWith('/admin/calendar'))}
                  {renderItem('/admin/learn', 'Platform Learning Hub', BookOpen, pathname.startsWith('/admin/learn'))}
                </div>
              </div>

              <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mx-2" />

              {/* Authoring & Media Tools */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90">
                    AUTHORING &amp; ASSETS
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/editor', 'Visual Page Editor', Edit3, pathname.startsWith('/admin/editor'))}
                  {renderItem('/admin/analytics', 'Audience & Analytics', BarChart3, pathname.startsWith('/admin/analytics'))}
                  {renderItem('/admin/media', 'Media Library', FolderOpen, pathname.startsWith('/admin/media'))}
                </div>
              </div>

              <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mx-2" />

              {/* Publishing & Governance */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90">
                    GOVERNANCE &amp; RELEASES
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/releases', 'Content Releases', Send, pathname.startsWith('/admin/releases'))}
                  {renderItem('/admin/governance', 'King IV & POPIA Audit', ShieldCheck, pathname.startsWith('/admin/governance'))}
                  {renderItem('/admin/tasks', 'Approvals & Sign-Off', CheckCircle, pathname.startsWith('/admin/tasks'))}
                  {renderItem('/admin/users', 'Authorized Editors', Users, pathname.startsWith('/admin/users'))}
                </div>
              </div>
            </>
          ) : (
            /* BASTION AGENCY WORKSPACE NAVIGATION */
            <>
              {/* Agency Operations */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Agency Operations
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin', 'Overview', LayoutDashboard, pathname === '/admin')}
                  {renderItem('/admin/clients', 'Clients & Websites', Users, pathname.startsWith('/admin/clients'))}
                  {renderItem('/admin/onboard', 'Onboard Client', UserPlus, pathname.startsWith('/admin/onboard'))}
                  {renderItem('/admin/billing', 'Commercial & Billing', CreditCard, pathname.startsWith('/admin/billing'))}
                  {renderItem('/admin/sens', 'JSE SENS & IR Command', Newspaper, pathname.startsWith('/admin/sens'))}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {resultsSection}

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Design & Systems */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Design &amp; Systems
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/brand', 'Brand DNA & Kits', Palette, pathname.startsWith('/admin/brand'))}
                  {renderItem('/admin/editor', 'Visual Page Editor', Edit3, pathname.startsWith('/admin/editor'))}
                  {renderItem('/admin/create', 'Canvas Site Builder', Sparkles, pathname.startsWith('/admin/create'))}
                  {renderItem('/admin/blueprints', 'Blueprints & Templates', Layers, pathname.startsWith('/admin/blueprints'))}
                  {renderItem('/admin/design-system', 'Tokens & Tokens CSS', SlidersHorizontal, pathname.startsWith('/admin/design-system'))}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Governance & Access */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Governance &amp; Releases
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/releases', 'Content Releases', CalendarCheck, pathname.startsWith('/admin/releases'))}
                  {renderItem('/admin/governance', 'King IV & POPIA Audit', ShieldCheck, pathname.startsWith('/admin/governance'))}
                  {renderItem('/admin/tasks', 'Reviews & Publishing', Send, pathname.startsWith('/admin/tasks'))}
                  {renderItem('/admin/users', 'Team & Access Control', UserPlus, pathname.startsWith('/admin/users'))}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Intelligence & Infrastructure */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Intelligence &amp; Infrastructure
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/incidents', 'Incidents & SRE Audit', ShieldAlert, pathname.startsWith('/admin/incidents'))}
                  {renderItem('/admin/health', 'Website Health', Activity, pathname.startsWith('/admin/health'))}
                  {renderItem('/admin/api-keys', 'AI API Keys', Key, pathname.startsWith('/admin/api-keys'))}
                  {renderItem('/admin/analytics', 'Analytics', BarChart3, pathname.startsWith('/admin/analytics'))}
                  {renderItem('/admin/sandbox', 'API Sandbox', Terminal, pathname.startsWith('/admin/sandbox'))}
                  {renderItem('/api/mcp', 'MCP Server Hub', Bot, false, undefined, undefined, true)}
                  {renderItem('/admin/settings', 'Headless & Webhooks', Settings, pathname.startsWith('/admin/settings'))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* View Switcher Footer — agency staff only */}
        {agency && (isCollapsed ? (
          <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-center">
            <button
              type="button"
              onClick={() => setPortalViewMode(portalViewMode === 'client' ? 'agency' : 'client')}
              title={portalViewMode === 'client' ? 'Switch to Agency View' : 'Switch to Client View'}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070B10]">
            <button
              type="button"
              onClick={() => setPortalViewMode(portalViewMode === 'client' ? 'agency' : 'client')}
              title={portalViewMode === 'client' ? 'Switch to Bastion Agency Studio' : 'Launch Client Experience Sandbox'}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                portalViewMode === 'client'
                  ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border-amber-300 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
                  : 'bg-white dark:bg-[#141C2A] hover:bg-slate-50 dark:hover:bg-[#1A2536] border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 shadow-2xs'
              }`}
            >
              <span className="flex items-center space-x-2 truncate">
                <span 
                  style={{ backgroundColor: portalViewMode === 'client' ? '#F59E0B' : primaryColor }}
                  className={`w-2 h-2 rounded-full ${portalViewMode === 'client' ? 'animate-pulse' : ''}`} 
                />
                <span className="truncate">
                  {portalViewMode === 'client' ? 'Exit to Agency Studio' : 'Client Experience Sandbox'}
                </span>
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          </div>
        ))}

        {/* Footer Collapse Toggle Control */}
        <div className="p-2 border-t border-slate-800/80">
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand Sidebar (⌘B)"
              className="w-full h-8 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition text-xs font-medium cursor-pointer"
            >
              <ChevronsLeft className="w-4 h-4 text-slate-400" />
              <span>Collapse Sidebar</span>
            </button>
          )}
        </div>

        {/* User Profile Chip */}
        {!isCollapsed && (
          <div className="p-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-white text-slate-900 font-bold text-xs flex items-center justify-center shadow-xs ring-1 ring-white/40">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AE'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0D1522]" />
                </div>
                <div className="truncate text-left">
                  <div className="font-semibold text-xs text-white truncate leading-tight group-hover:text-blue-300 transition-colors">
                    {user?.name || 'Aurum Energy Editor'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">
                    {user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Corporate Editor'} &bull; Online
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors shrink-0 ml-1" />
            </div>
          </div>
        )}
      </div>
      {/* Add Website Modal */}
      {showAddWebsiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F141C] border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-white">Add Web Property</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddWebsiteModal(false);
                  setCreateWebsiteError('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Provision a new website under <strong className="text-white">{activeClient?.name}</strong>.
            </div>

            {createWebsiteError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs">
                {createWebsiteError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newWebsiteName.trim()) return;
                setIsCreatingWebsite(true);
                setCreateWebsiteError('');
                const res = await createWebsite({
                  name: newWebsiteName.trim(),
                  primaryDomain: newWebsiteDomain.trim() || undefined,
                  blueprintId: newWebsiteBlueprint,
                  status: 'published'
                });
                setIsCreatingWebsite(false);
                if (res.success) {
                  setShowAddWebsiteModal(false);
                  setNewWebsiteName('');
                  setNewWebsiteDomain('');
                } else {
                  setCreateWebsiteError(res.error || 'Failed to create website');
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Investor Relations Hub"
                  value={newWebsiteName}
                  onChange={(e) => {
                    setNewWebsiteName(e.target.value);
                    if (!newWebsiteDomain) {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setNewWebsiteDomain(slug ? `${slug}.${activeClient?.slug || 'aurum'}.bastion.digital` : '');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Domain / URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. investors.aurum.bastion.digital"
                  value={newWebsiteDomain}
                  onChange={(e) => setNewWebsiteDomain(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Property Blueprint
                </label>
                <select
                  value={newWebsiteBlueprint}
                  onChange={(e) => setNewWebsiteBlueprint(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  onClick={() => {
                    setShowAddWebsiteModal(false);
                    setCreateWebsiteError('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingWebsite || !newWebsiteName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingWebsite ? (
                    <span>Provisioning...</span>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Provision Website</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
