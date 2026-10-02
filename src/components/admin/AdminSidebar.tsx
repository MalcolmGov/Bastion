'use client';

import React, { useState, useEffect } from 'react';
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
  Home
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const {
    clients,
    activeClient,
    activeSite,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400/90">
          Results
        </div>
      )}
      <div className="space-y-1">
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

              {/* Workspace Switcher Card */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 ring-1 ring-white/20">
                    {activeClient?.name ? activeClient.name.substring(0, 2).toUpperCase() : 'AU'}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="font-bold text-xs text-white truncate leading-tight group-hover:text-blue-300 transition-colors" title={activeClient?.name || 'Aurum Energy & Resources'}>
                      {activeClient?.name || 'Aurum Energy & Resources'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Corporate CMS</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 group-hover:translate-y-0.5 transition-all shrink-0 ml-1" />
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
                    {activeClient?.name ? `${activeClient.name.toUpperCase()} CONTENT` : 'AURUM ENERGY & RESOURCES CONTENT'}
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin', 'Executive Overview', Home, pathname === '/admin')}
                  {renderItem('/admin/pages', 'Pages & Navigation', FileText, pathname === '/admin/pages', '24')}
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
                  {renderItem('/admin/calendar', 'IR & Financial Calendar', Calendar, pathname.startsWith('/admin/calendar'))}
                  {renderItem('/admin/learn', 'Platform Learning Hub', BookOpen, pathname.startsWith('/admin/learn'))}
                </div>
              </div>

              <div className="my-3.5 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mx-2" />

              {resultsSection}

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
                  {renderItem('/admin/releases', 'Content Releases', Send, pathname.startsWith('/admin/releases'), 'Oct 06')}
                  {renderItem('/admin/governance', 'King IV & POPIA Audit', ShieldCheck, pathname.startsWith('/admin/governance'))}
                  {renderItem('/admin/tasks', 'Approvals & Sign-Off', CheckCircle, pathname.startsWith('/admin/tasks'), '3')}
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
    </aside>
  );
}
