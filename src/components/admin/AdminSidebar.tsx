'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
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
  Newspaper,
  Leaf,
  ChevronDown,
  ExternalLink,
  PlusCircle,
  Building,
  Check,
  CreditCard,
  Terminal,
  UserPlus,
  Bot,
  ArrowRight,
  ArrowRightLeft,
  Globe2,
  SlidersHorizontal,
  FolderOpen,
  PanelLeftClose,
  PanelLeftOpen,
  CalendarCheck
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const {
    clients,
    activeClient,
    activeSite,
    setActiveClientId,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();
  const [clientMenuOpen, setClientMenuOpen] = useState(false);
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

  const isClientPortal = portalViewMode === 'client';
  const isGoldFields = activeClient?.id === 'client_goldfields';

  const siteUrl = isGoldFields
    ? '/'
    : activeSite
      ? `/sites/${activeSite.slug}`
      : '/';

  const getNavItemProps = (isActive: boolean) => ({
    style: isActive ? {
      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
      borderColor: primaryColor,
      boxShadow: `0 4px 14px ${primaryColor}35`
    } : undefined,
    className: `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative cursor-pointer ${
      isActive
        ? 'text-white border shadow-md font-bold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
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
          className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition relative cursor-pointer group ${
            isActive
              ? 'text-white border shadow-md font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'
          }`}
          style={isActive ? {
            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            borderColor: primaryColor,
            boxShadow: `0 4px 14px ${primaryColor}35`
          } : undefined}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {badge && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-white dark:ring-[#0A0D14]" />
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
        <div className="flex items-center space-x-2.5 truncate">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${badgeClass || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {badge}
          </span>
        )}
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

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white dark:bg-[#0A0D14] border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 overflow-x-hidden transition-all duration-300 ease-in-out`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className={`p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center ${isCollapsed ? 'justify-center flex-col gap-2.5' : 'justify-between'}`}>
          {isCollapsed ? (
            <>
              <Link href="/admin" title="Bastion Platform" className="shrink-0">
                <BastionLogo variant="monogram" size="sm" />
              </Link>
              <button
                type="button"
                onClick={toggleCollapse}
                title="Expand Sidebar (⌘B)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/admin" className="flex items-center space-x-2.5 min-w-0">
                {isClientPortal ? (
                  <>
                    <div 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}35`
                      }}
                      className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
                    >
                      {activeClient?.name ? activeClient.name.substring(0, 2).toUpperCase() : 'CC'}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight flex items-center space-x-1.5 truncate">
                        <span className="truncate">{activeClient?.name || 'Client Workspace'}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Corporate CMS &bull; Bastion
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <BastionLogo 
                      size="sm"
                      showCmsBadge={false} 
                      showGroupBadge={false}
                      className="text-slate-900 dark:text-white"
                    />
                    <span 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border shrink-0"
                    >
                      AGENCY
                    </span>
                  </div>
                )}
              </Link>

              <div className="flex items-center space-x-1 shrink-0">
                <Link
                  href={siteUrl}
                  target="_blank"
                  title="Open Live Website"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={toggleCollapse}
                  title="Collapse Sidebar (⌘B)"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Client & Website Context Switcher */}
        {isCollapsed ? (
          <div className="p-2.5 border-b border-slate-200/80 dark:border-slate-800/80 flex justify-center relative">
            <button
              type="button"
              onClick={() => setClientMenuOpen(!clientMenuOpen)}
              title={`Client Workspace: ${activeClient?.name || 'Bastion'}`}
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}30`
              }}
              className="w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 hover:scale-105 transition cursor-pointer"
            >
              {activeClient?.name ? activeClient.name.substring(0, 1).toUpperCase() : 'B'}
            </button>

            {clientMenuOpen && (
              <div className="fixed left-18 top-16 w-60 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Corporate Client
                </div>
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveClientId(c.id);
                      setClientMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-medium transition cursor-pointer ${
                      c.id === activeClient?.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.websites?.length || 1} website(s)</div>
                    </div>
                    {c.id === activeClient?.id && (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 relative">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1 flex items-center justify-between">
              <span>Active Client Workspace</span>
              <span className="text-[10px] font-semibold font-mono" style={{ color: primaryColor }}>
                {clients.length} Sites
              </span>
            </div>
            <button
              type="button"
              onClick={() => setClientMenuOpen(!clientMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 text-left transition cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div 
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    borderColor: `${primaryColor}30`
                  }}
                  className="w-6 h-6 rounded-lg border flex items-center justify-center font-bold text-[10px] shrink-0"
                >
                  {activeClient?.name ? activeClient.name.substring(0, 1) : 'G'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeClient?.name || 'Gold Fields Limited'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {activeSite?.name || 'Flagship Portal'}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Client Selection Popover */}
            {clientMenuOpen && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1 max-h-64 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Corporate Client
                </div>
                {clients.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveClientId(c.id);
                      setClientMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs font-medium transition cursor-pointer ${
                      c.id === activeClient?.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.websites?.length || 1} website(s)</div>
                    </div>
                    {c.id === activeClient?.id && (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                    )}
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/admin/create"
                    onClick={() => setClientMenuOpen(false)}
                    style={{ color: primaryColor }}
                    className="w-full flex items-center space-x-1.5 p-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Client Website</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Navigation Sections */}
        <div className={`flex-1 ${isCollapsed ? 'p-2 space-y-3' : 'p-3 space-y-4'} overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800`}>
          {isClientPortal ? (
            /* CLIENT CMS WORKSPACE NAVIGATION */
            <>
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: accentColor }}>
                    <span>{activeClient?.name || 'Website'} Content</span>
                    <span 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`
                      }}
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase border"
                    >
                      Live
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin', 'Executive Overview', LayoutDashboard, pathname === '/admin')}
                  {renderItem('/admin/pages', 'Pages & Navigation', FileText, pathname === '/admin/pages')}
                  {isGoldFields ? (
                    <>
                      {renderItem('/admin/operations', 'Mining Operations', Compass, pathname.startsWith('/admin/operations'), '10', 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200')}
                      {renderItem('/admin/reports', 'Financial Results', FileSpreadsheet, pathname.startsWith('/admin/reports'), '11', 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200')}
                      {renderItem('/admin/news', 'SENS Releases', Newspaper, pathname.startsWith('/admin/news'), 'SENS', 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200')}
                      {renderItem('/admin/sustainability', '2030 ESG Targets', Leaf, pathname.startsWith('/admin/sustainability'), 'ESG', 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200')}
                    </>
                  ) : (
                    renderItem('/admin/news', 'News & Articles', Newspaper, pathname.startsWith('/admin/news'))
                  )}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Authoring & Media Tools */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Authoring &amp; Assets
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/editor', 'Visual Page Editor', Edit3, pathname.startsWith('/admin/editor'), 'Studio', 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200')}
                  {renderItem('/admin/media', 'Media Library', FolderOpen, pathname.startsWith('/admin/media'))}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Publishing & Governance */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Governance &amp; Releases
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/releases', 'Content Releases', CalendarCheck, pathname.startsWith('/admin/releases'), 'Drops', 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800')}
                  {renderItem('/admin/tasks', 'Approvals & Sign-Off', Send, pathname.startsWith('/admin/tasks'), 'Queue', 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200')}
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
                  {renderItem('/admin/clients', 'Clients & Websites', Users, pathname.startsWith('/admin/clients'), String(clients.length))}
                  {renderItem('/admin/create', 'Create Website', Sparkles, pathname.startsWith('/admin/create'), 'Wizard', 'bg-blue-100 dark:bg-sky-950 text-bastion-blue dark:text-sky-300 border border-blue-200 dark:border-sky-800')}
                  {renderItem('/admin/billing', 'Commercial & Billing', CreditCard, pathname.startsWith('/admin/billing'))}
                </div>
              </div>

              {isCollapsed ? <div className="my-2 border-t border-slate-200/80 dark:border-slate-800/80 mx-2" /> : null}

              {/* Design & Systems */}
              <div>
                {!isCollapsed && (
                  <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Design &amp; Systems
                  </div>
                )}
                <div className="space-y-1">
                  {renderItem('/admin/brand', 'Brand DNA & Kits', Palette, pathname.startsWith('/admin/brand'), 'DNA', 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800')}
                  {renderItem('/admin/editor', 'Visual Page Editor', Edit3, pathname.startsWith('/admin/editor'), 'Zones', 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800')}
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
                  {renderItem('/admin/releases', 'Content Releases', CalendarCheck, pathname.startsWith('/admin/releases'), 'Drops', 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800')}
                  {renderItem('/admin/tasks', 'Reviews & Publishing', Send, pathname.startsWith('/admin/tasks'), '2', 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200')}
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
                  {renderItem('/admin/health', 'Website Health', Activity, pathname.startsWith('/admin/health'), '100%', 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200')}
                  {renderItem('/admin/analytics', 'Analytics', BarChart3, pathname.startsWith('/admin/analytics'))}
                  {renderItem('/admin/sandbox', 'API Sandbox', Terminal, pathname.startsWith('/admin/sandbox'), 'Live', 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200')}
                  {renderItem('/api/mcp', 'MCP Server Hub', Bot, false, 'MCP', 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200', true)}
                  {renderItem('/admin/settings', 'Headless & Webhooks', Settings, pathname.startsWith('/admin/settings'))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* AI Agent Status Module */}
        {isCollapsed ? (
          <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 flex justify-center">
            <Link
              href="/admin/tasks"
              title="Bastion AI Agent: Active (2/5 Pipeline)"
              className="w-10 h-10 rounded-xl flex items-center justify-center relative bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-sky-500 transition group"
            >
              <Bot className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0A0D14] animate-pulse" />
            </Link>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
            <div 
              style={{ borderColor: `${primaryColor}30` }}
              className="p-3 rounded-xl space-y-2 border shadow-xs bg-slate-50 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-white">AI Publishing Agent</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active &bull; 2/5</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Signed webhooks &bull; Edge cache purge &bull; SENS guardrails
              </p>

              <Link
                href="/admin/tasks"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  boxShadow: `0 4px 12px ${primaryColor}30`
                }}
                className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-bold text-white hover:opacity-95 shadow-xs transition cursor-pointer"
              >
                <span>Manage Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* View Switcher Footer */}
        {isCollapsed ? (
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
                  {portalViewMode === 'client' ? 'Switch to Agency View' : 'Switch to Client View'}
                </span>
              </span>
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          </div>
        )}

        {/* Footer Collapse Toggle Control */}
        <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/40 dark:bg-[#06090F]">
          {isCollapsed ? (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Expand Sidebar (⌘B)"
              className="w-full h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleCollapse}
              className="w-full h-8 flex items-center justify-between px-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-[11px] font-medium cursor-pointer"
            >
              <span className="flex items-center space-x-2">
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">⌘B</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
