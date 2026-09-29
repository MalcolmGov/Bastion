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
    <aside className="w-64 bg-white dark:bg-[#0A0D14] border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 selection:bg-[#7C3AED] selection:text-white shrink-0 z-20 transition-colors duration-150">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5 min-w-0">
            {isClientPortal ? (
              <>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-xs shrink-0 shadow-xs">
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-500/20 ring-1 ring-white/15">
                  <span>B</span>
                </div>
                <div className="truncate">
                  <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight flex items-center space-x-1.5">
                    <span>BASTION</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
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
        <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 relative">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-1 flex items-center justify-between">
            <span>Active Client Workspace</span>
            <span className="text-[10px] text-[#7C3AED] dark:text-purple-400 font-semibold font-mono">
              {clients.length} Sites
            </span>
          </div>
          <button
            type="button"
            onClick={() => setClientMenuOpen(!clientMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#131A26] hover:bg-slate-100 dark:hover:bg-[#1A2333] border border-slate-200 dark:border-[#232F42] text-left transition shadow-2xs"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Building className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400 shrink-0" />
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
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-[#7C3AED] dark:text-purple-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E2838]'
                  }`}
                >
                  <div className="truncate">
                    <div className="truncate font-medium">{c.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{c.industry.replace('_', ' ')}</div>
                  </div>
                  {c.id === activeClient?.id && <Check className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400 shrink-0" />}
                </button>
              ))}

              <div className="border-t border-slate-100 dark:border-[#232F42] p-1.5">
                <Link
                  href="/admin/create"
                  onClick={() => setClientMenuOpen(false)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#7C3AED] dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Client</span>
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
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
                  <span>{activeClient?.name || 'Website'} Content</span>
                  <span className="text-[9px] bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded-full text-amber-700 dark:text-amber-300 font-bold uppercase border border-amber-200 dark:border-amber-800/60">
                    Live
                  </span>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/admin"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname === '/admin'
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Executive Overview</span>
                    </div>
                    {pathname === '/admin' && (
                      <span className="w-1.5 h-4 rounded-r-full bg-[#F59E0B] absolute left-0" />
                    )}
                  </Link>

                  <Link
                    href="/admin/pages"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname === '/admin/pages'
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Pages &amp; Navigation</span>
                    </div>
                  </Link>

                  {/* Gold Fields Collections */}
                  {isGoldFields ? (
                    <>
                      <Link
                        href="/admin/operations"
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                          pathname.startsWith('/admin/operations')
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Compass className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>Mining Operations</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                          10
                        </span>
                      </Link>

                      <Link
                        href="/admin/reports"
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                          pathname.startsWith('/admin/reports')
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <FileSpreadsheet className="w-4 h-4 shrink-0 text-purple-500" />
                          <span>Financial Results</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200">
                          11
                        </span>
                      </Link>

                      <Link
                        href="/admin/news"
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                          pathname.startsWith('/admin/news')
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Newspaper className="w-4 h-4 shrink-0 text-amber-500" />
                          <span>SENS Releases</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                          SENS
                        </span>
                      </Link>

                      <Link
                        href="/admin/sustainability"
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                          pathname.startsWith('/admin/sustainability')
                            ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                        }`}
                      >
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
                    <Link
                      href="/admin/news"
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                        pathname.startsWith('/admin/news')
                          ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Newspaper className="w-4 h-4 shrink-0 text-purple-500" />
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
                  <Link
                    href="/admin/editor"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/editor')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Edit3 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Visual Page Editor</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      Studio
                    </span>
                  </Link>

                  <Link
                    href="/admin/media"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/media')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FolderOpen className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Media Library</span>
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
                  <Link
                    href="/admin"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname === '/admin'
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Overview</span>
                    </div>
                    {pathname === '/admin' && (
                      <span className="w-1.5 h-4 rounded-r-full bg-[#F59E0B] absolute left-0" />
                    )}
                  </Link>

                  <Link
                    href="/admin/clients"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/clients')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Users className="w-4 h-4 shrink-0 text-blue-500" />
                      <span>Clients &amp; Websites</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/create"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/create')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4 shrink-0 text-purple-500" />
                      <span>Create Website</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200">
                      Wizard
                    </span>
                  </Link>

                  <Link
                    href="/admin/billing"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/billing')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
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
                  <Link
                    href="/admin/brand"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/brand')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Palette className="w-4 h-4 shrink-0 text-[#7C3AED]" />
                      <span>Brand DNA &amp; Kits</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200">
                      DNA
                    </span>
                  </Link>

                  <Link
                    href="/admin/blueprints"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/blueprints')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Layers className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>Blueprints &amp; Templates</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/design-system"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/design-system')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <SlidersHorizontal className="w-4 h-4 shrink-0 text-amber-500" />
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
                  <Link
                    href="/admin/tasks"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/tasks')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Send className="w-4 h-4 shrink-0 text-purple-500" />
                      <span>Reviews &amp; Publishing</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200">
                      2
                    </span>
                  </Link>

                  <Link
                    href="/admin/users"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/users')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <UserPlus className="w-4 h-4 shrink-0 text-[#7C3AED]" />
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
                  <Link
                    href="/admin/health"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/health')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Activity className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Website Health</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200">
                      100%
                    </span>
                  </Link>

                  <Link
                    href="/admin/analytics"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/analytics')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <BarChart3 className="w-4 h-4 shrink-0 text-purple-500" />
                      <span>Analytics</span>
                    </div>
                  </Link>

                  <Link
                    href="/admin/sandbox"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/sandbox')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Terminal className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>API Sandbox</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200">
                      Live
                    </span>
                  </Link>

                  <Link
                    href="/admin/settings"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition relative ${
                      pathname.startsWith('/admin/settings')
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-md shadow-purple-500/25 border border-[#7C3AED]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/80 dark:hover:bg-slate-800/80 hover:text-[#7C3AED] dark:hover:text-white border border-transparent'
                    }`}
                  >
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
          <div className="p-3 rounded-xl space-y-2 border shadow-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#7C3AED]/15 text-[#7C3AED]">
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
              className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:opacity-95 shadow-xs transition"
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition ${
              portalViewMode === 'client'
                ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border-amber-300 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
                : 'bg-white dark:bg-[#141C2A] hover:bg-purple-50 dark:hover:bg-[#1A2536] border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-300 shadow-2xs'
            }`}
          >
            <span className="flex items-center space-x-2 truncate">
              <span className={`w-2 h-2 rounded-full ${portalViewMode === 'client' ? 'bg-amber-500 animate-pulse' : 'bg-[#7C3AED]'}`} />
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
