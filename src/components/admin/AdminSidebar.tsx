'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Palette,
  Layers,
  Edit3,
  FileText,
  Image as ImageIcon,
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
  ShieldCheck,
  Globe2,
  FolderOpen,
  ArrowRightLeft
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
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

  return (
    <aside className="w-64 bg-white dark:bg-[#0A0D14] border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 selection:bg-bastion-blue selection:text-white shrink-0 z-20 transition-colors duration-150">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5 min-w-0">
            {isClientPortal ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-xs shrink-0 shadow-xs">
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
              <>
                <div className="w-8 h-8 rounded-lg bg-bastion dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border border-slate-700/30 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs">
                  <span className="text-amber-400">B</span>
                </div>
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight flex items-center space-x-1.5">
                    <span>BASTION</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-blue-50 dark:bg-sky-950 text-bastion-blue dark:text-sky-400 border border-blue-200 dark:border-sky-800 font-semibold">
                      AGENCY
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Website Management Platform
                  </div>
                </div>
              </>
            )}
          </Link>

          <Link
            href={siteUrl}
            target="_blank"
            title="Open Live Website"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Client & Website Context Switcher */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 relative">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1 flex items-center justify-between">
            <span>Active Client Workspace</span>
            <span className="text-[10px] text-bastion-blue dark:text-sky-400 font-semibold font-mono">
              {clients.length} Sites
            </span>
          </div>
          <button
            type="button"
            onClick={() => setClientMenuOpen(!clientMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#131A26] hover:bg-slate-100 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-[#232F42] text-left transition shadow-2xs"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Building className="w-3.5 h-3.5 text-bastion-blue dark:text-sky-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {activeClient?.name || 'Select Client'}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {activeSite?.name || 'All Websites'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Client Switcher Popup */}
          {clientMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-[#131A26] border border-slate-200 dark:border-[#2A374A] rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[9px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-[#232F42]">
                Switch Client Tenant
              </div>
              {clients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveClientId(c.id);
                    setClientMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                    c.id === activeClient?.id
                      ? 'bg-blue-50 dark:bg-sky-950/60 text-bastion-blue dark:text-sky-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2838]'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{c.industry.replace('_', ' ')}</div>
                  </div>
                  {c.id === activeClient?.id && <Check className="w-3.5 h-3.5 text-bastion-blue dark:text-sky-400 shrink-0" />}
                </button>
              ))}

              <div className="border-t border-slate-100 dark:border-[#232F42] p-1.5">
                <Link
                  href="/admin/create"
                  onClick={() => setClientMenuOpen(false)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-bastion-blue dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/50 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Client</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Primary Navigation Sections */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-235px)] scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {isClientPortal ? (
            /* ======================================================== */
            /* CLIENT CMS WORKSPACE NAVIGATION (FOCUSED, NO CODE)      */
            /* ======================================================== */
            <>
              {/* Core Content Navigation */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>{activeClient?.name || 'Website'} Content</span>
                  <span className="text-[8px] bg-amber-50 dark:bg-amber-950/80 px-1 py-0.2 rounded text-amber-700 dark:text-amber-300 font-mono border border-amber-200 dark:border-amber-800/60">
                    Live
                  </span>
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin'
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-500" />
                    <span>Executive Overview</span>
                  </Link>

                  <Link
                    href="/admin/pages"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin/pages'
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Pages & Navigation</span>
                  </Link>

                  {/* Gold Fields Specific Collections or Universal Collections */}
                  {isGoldFields ? (
                    <>
                      <Link
                        href="/admin/operations"
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          pathname.startsWith('/admin/operations')
                            ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                        }`}
                      >
                        <Compass className="w-4 h-4 text-amber-500" />
                        <span>Mining Operations (10)</span>
                      </Link>
                      <Link
                        href="/admin/reports"
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          pathname.startsWith('/admin/reports')
                            ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                        <span>Reports & Results (11)</span>
                      </Link>
                      <Link
                        href="/admin/news"
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          pathname.startsWith('/admin/news')
                            ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                        }`}
                      >
                        <Newspaper className="w-4 h-4 text-amber-500" />
                        <span>SENS Announcements</span>
                      </Link>
                      <Link
                        href="/admin/sustainability"
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          pathname.startsWith('/admin/sustainability')
                            ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                        }`}
                      >
                        <Leaf className="w-4 h-4 text-emerald-500" />
                        <span>2030 ESG Targets</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/admin/news"
                      className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                        pathname.startsWith('/admin/news')
                          ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                      }`}
                    >
                      <Newspaper className="w-4 h-4 text-amber-500" />
                      <span>News & Articles</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Authoring & Media Tools */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Authoring & Assets
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/editor"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/editor')
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-emerald-500" />
                    <span>Visual Page Editor</span>
                  </Link>

                  <Link
                    href="/admin/media"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/media')
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Media & Downloads</span>
                  </Link>

                  <Link
                    href="/admin/tasks"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/tasks')
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Send className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Approvals & Publishing</span>
                  </Link>
                </div>
              </div>

              {/* Team & Support */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Team & Support
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/users"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/users')
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-amber-500" />
                    <span>Authorized Editors</span>
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/settings')
                        ? 'bg-amber-500/10 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Site Preferences</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* BASTION AGENCY WORKSPACE NAVIGATION                      */
            /* ======================================================== */
            <>
              {/* Agency Operations */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Agency Operations
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin'
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-bastion-blue dark:text-sky-400" />
                    <span>Overview</span>
                  </Link>

                  <Link
                    href="/admin/clients"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/clients')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Clients & Websites</span>
                  </Link>

                  <Link
                    href="/admin/create"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/create')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      <span>Create Website</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      New
                    </span>
                  </Link>

                  <Link
                    href="/admin/billing"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/billing')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Commercial & Billing</span>
                  </Link>
                </div>
              </div>

              {/* Design & Systems */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Design & Systems
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/brand"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/brand')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span>Brand Systems</span>
                  </Link>

                  <Link
                    href="/admin/blueprints"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/blueprints')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-violet-500" />
                    <span>Templates & Blueprints</span>
                  </Link>

                  <Link
                    href="/admin/editor"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/editor')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-emerald-500" />
                    <span>Visual Website Editor</span>
                  </Link>
                </div>
              </div>

              {/* Governance & Publishing */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Governance & Publishing
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/pages"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin/pages'
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Pages & Compositions</span>
                  </Link>

                  <Link
                    href="/admin/media"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/media')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Media Library</span>
                  </Link>

                  <Link
                    href="/admin/tasks"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/tasks')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Send className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Reviews & Publishing</span>
                  </Link>

                  <Link
                    href="/admin/users"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/users')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 text-bastion-blue dark:text-sky-400" />
                    <span>Team & Access Control</span>
                  </Link>
                </div>
              </div>

              {/* Infrastructure & Intelligence */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Infrastructure & Intelligence
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/health"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/health')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <span>Website Health</span>
                  </Link>

                  <Link
                    href="/admin/analytics"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/analytics')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-bastion-blue dark:text-sky-400" />
                    <span>Analytics</span>
                  </Link>

                  <Link
                    href="/admin/sandbox"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/sandbox')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    <div className="flex items-center justify-between flex-1">
                      <span>API Sandbox</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Live
                      </span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/settings')
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-navy dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141C2A]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Headless API & Webhooks</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Footer & Mode Quick-Toggle */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070B10]">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isClientPortal
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400'
                : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-bastion-navy dark:text-sky-400'
            }`}>
              {user?.name ? user.name[0].toUpperCase() : 'B'}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-slate-900 dark:text-white truncate">
                {user?.name || (isClientPortal ? `${activeClient?.name || 'Client'} Editor` : 'Bastion Admin')}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {isClientPortal ? 'Client Workspace' : 'Bastion Agency'}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Button */}
        <button
          type="button"
          onClick={() => setPortalViewMode(portalViewMode === 'client' ? 'agency' : 'client')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${
            portalViewMode === 'client'
              ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-950/60 border-amber-300 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
              : 'bg-white dark:bg-[#141C2A] hover:bg-slate-100 dark:hover:bg-[#1A2536] border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 shadow-2xs'
          }`}
        >
          <span className="flex items-center space-x-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${portalViewMode === 'client' ? 'bg-amber-500 animate-pulse' : 'bg-bastion-blue'}`} />
            <span className="truncate">
              {portalViewMode === 'client' ? 'Switch to Agency View' : 'Switch to Client View'}
            </span>
          </span>
          <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
        </button>
      </div>
    </aside>
  );
}
