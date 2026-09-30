'use client';

import React, { useState } from 'react';
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
  FolderOpen
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

  return (
    <aside className="w-64 bg-white dark:bg-[#0A0D14] border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 transition-colors duration-150">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
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

          <Link
            href={siteUrl}
            target="_blank"
            title="Open Live Website"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Client & Website Context Switcher */}
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

        {/* Primary Navigation Sections */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {isClientPortal ? (
            /* CLIENT CMS WORKSPACE NAVIGATION */
            <>
              <div>
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
                <div className="space-y-1">
                  <Link href="/admin" {...getNavItemProps(pathname === '/admin')}>
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Executive Overview</span>
                    </div>
                    {pathname === '/admin' && (
                      <span className="w-1.5 h-4 rounded-r-full absolute left-0" style={{ backgroundColor: accentColor }} />
                    )}
                  </Link>

                  <Link href="/admin/pages" {...getNavItemProps(pathname === '/admin/pages')}>
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Pages &amp; Navigation</span>
                    </div>
                  </Link>

                  {/* Gold Fields Collections */}
                  {isGoldFields ? (
                    <>
                      <Link href="/admin/operations" {...getNavItemProps(pathname.startsWith('/admin/operations'))}>
                        <div className="flex items-center space-x-2.5">
                          <Compass className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                          <span>Mining Operations</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                          10
                        </span>
                      </Link>

                      <Link href="/admin/reports" {...getNavItemProps(pathname.startsWith('/admin/reports'))}>
                        <div className="flex items-center space-x-2.5">
                          <FileSpreadsheet className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                          <span>Financial Results</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200">
                          11
                        </span>
                      </Link>

                      <Link href="/admin/news" {...getNavItemProps(pathname.startsWith('/admin/news'))}>
                        <div className="flex items-center space-x-2.5">
                          <Newspaper className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                          <span>SENS Releases</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                          SENS
                        </span>
                      </Link>

                      <Link href="/admin/sustainability" {...getNavItemProps(pathname.startsWith('/admin/sustainability'))}>
                        <div className="flex items-center space-x-2.5">
                          <Leaf className="w-4 h-4 shrink-0 text-emerald-500" />
                          <span>2030 ESG Targets</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                          ESG
                        </span>
                      </Link>
                    </>
                  ) : (
                    <Link href="/admin/news" {...getNavItemProps(pathname.startsWith('/admin/news'))}>
                      <div className="flex items-center space-x-2.5">
                        <Newspaper className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                        <span>News &amp; Articles</span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>

              {/* Authoring & Media Tools */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Authoring &amp; Assets
                </div>
                <div className="space-y-1">
                  <Link href="/admin/editor" {...getNavItemProps(pathname.startsWith('/admin/editor'))}>
                    <div className="flex items-center space-x-2.5">
                      <Edit3 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Visual Page Editor</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      Studio
                    </span>
                  </Link>

                  <Link href="/admin/media" {...getNavItemProps(pathname.startsWith('/admin/media'))}>
                    <div className="flex items-center space-x-2.5">
                      <FolderOpen className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Media Library</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Publishing & Team */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Governance
                </div>
                <div className="space-y-1">
                  <Link href="/admin/tasks" {...getNavItemProps(pathname.startsWith('/admin/tasks'))}>
                    <div className="flex items-center space-x-2.5">
                      <Send className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                      <span>Approvals &amp; Sign-Off</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                      Queue
                    </span>
                  </Link>

                  <Link href="/admin/users" {...getNavItemProps(pathname.startsWith('/admin/users'))}>
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                      <span>Authorized Editors</span>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* BASTION AGENCY WORKSPACE NAVIGATION */
            <>
              {/* Agency Operations */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Agency Operations
                </div>
                <div className="space-y-1">
                  <Link href="/admin" {...getNavItemProps(pathname === '/admin')}>
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Overview</span>
                    </div>
                    {pathname === '/admin' && (
                      <span className="w-1.5 h-4 rounded-r-full absolute left-0" style={{ backgroundColor: accentColor }} />
                    )}
                  </Link>

                  <Link href="/admin/clients" {...getNavItemProps(pathname.startsWith('/admin/clients'))}>
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Clients &amp; Websites</span>
                    </div>
                  </Link>

                  <Link href="/admin/create" {...getNavItemProps(pathname.startsWith('/admin/create'))}>
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                      <span>Create Website</span>
                    </div>
                    <span 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border"
                    >
                      Wizard
                    </span>
                  </Link>

                  <Link href="/admin/billing" {...getNavItemProps(pathname.startsWith('/admin/billing'))}>
                    <div className="flex items-center space-x-2.5">
                      <CreditCard className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Commercial &amp; Billing</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Design & Systems */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Design &amp; Systems
                </div>
                <div className="space-y-1">
                  <Link href="/admin/brand" {...getNavItemProps(pathname.startsWith('/admin/brand'))}>
                    <div className="flex items-center space-x-2.5">
                      <Palette className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                      <span>Brand DNA &amp; Kits</span>
                    </div>
                    <span 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border"
                    >
                      DNA
                    </span>
                  </Link>

                  <Link href="/admin/editor" {...getNavItemProps(pathname.startsWith('/admin/editor'))}>
                    <div className="flex items-center space-x-2.5">
                      <Edit3 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Visual Page Editor</span>
                    </div>
                    <span 
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                        borderColor: `${primaryColor}30`
                      }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border"
                    >
                      Zones
                    </span>
                  </Link>

                  <Link href="/admin/blueprints" {...getNavItemProps(pathname.startsWith('/admin/blueprints'))}>
                    <div className="flex items-center space-x-2.5">
                      <Layers className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>Blueprints &amp; Templates</span>
                    </div>
                  </Link>

                  <Link href="/admin/design-system" {...getNavItemProps(pathname.startsWith('/admin/design-system'))}>
                    <div className="flex items-center space-x-2.5">
                      <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                      <span>Tokens &amp; Tokens CSS</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Governance & Access */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Governance &amp; Access
                </div>
                <div className="space-y-1">
                  <Link href="/admin/tasks" {...getNavItemProps(pathname.startsWith('/admin/tasks'))}>
                    <div className="flex items-center space-x-2.5">
                      <Send className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
                      <span>Reviews &amp; Publishing</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                      2
                    </span>
                  </Link>

                  <Link href="/admin/users" {...getNavItemProps(pathname.startsWith('/admin/users'))}>
                    <div className="flex items-center space-x-2.5">
                      <UserPlus className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                      <span>Team &amp; Access Control</span>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Intelligence & Infrastructure */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Intelligence &amp; Infrastructure
                </div>
                <div className="space-y-1">
                  <Link href="/admin/health" {...getNavItemProps(pathname.startsWith('/admin/health'))}>
                    <div className="flex items-center space-x-2.5">
                      <Activity className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Website Health</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      100%
                    </span>
                  </Link>

                  <Link href="/admin/analytics" {...getNavItemProps(pathname.startsWith('/admin/analytics'))}>
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                      <span>Analytics</span>
                    </div>
                  </Link>

                  <Link href="/admin/sandbox" {...getNavItemProps(pathname.startsWith('/admin/sandbox'))}>
                    <div className="flex items-center space-x-2.5">
                      <Terminal className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>API Sandbox</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                      Live
                    </span>
                  </Link>

                  <a href="/api/mcp" target="_blank" {...getNavItemProps(false)}>
                    <div className="flex items-center space-x-2.5">
                      <Bot className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>MCP Server Hub</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                      MCP
                    </span>
                  </a>

                  <Link href="/admin/settings" {...getNavItemProps(pathname.startsWith('/admin/settings'))}>
                    <div className="flex items-center space-x-2.5">
                      <Settings className="w-4 h-4 shrink-0 text-slate-400" />
                      <span>Headless &amp; Webhooks</span>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Distinct Compact AI Agent Status Module (Zara CareerOS Signature) */}
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

        {/* User Account / Mode Switcher Footer */}
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
      </div>
    </aside>
  );
}
