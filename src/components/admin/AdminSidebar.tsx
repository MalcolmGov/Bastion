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
  Sliders,
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
  Terminal
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const { clients, activeClient, activeSite, setActiveClientId, portalViewMode, setPortalViewMode } = useStudioWorkspace();
  const [clientMenuOpen, setClientMenuOpen] = useState(false);

  const isGoldFields = activeClient?.id === 'client_goldfields';
  const isGoldFieldsPortal = isGoldFields && portalViewMode === 'client';

  return (
    <aside className="w-64 bg-[#0A0D14] border-r border-[#1E293B] flex flex-col justify-between h-screen sticky top-0 selection:bg-sky-500 selection:text-white shrink-0 z-20">
      <div>
        {/* Brand Header — Fully White-Label */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5">
            {isGoldFields ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-xs shadow-md shadow-amber-500/20">
                  GF
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide text-white leading-tight flex items-center space-x-1.5">
                    <span>GOLD FIELDS</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-950 text-amber-400 border border-amber-800">
                      CMS
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 tracking-wider font-medium">
                    Operated by Bastion Group
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-indigo-500 to-sky-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-amber-500/20">
                  B
                </div>
                <div>
                  <div className="font-bold text-sm tracking-wide text-white leading-tight flex items-center space-x-1.5">
                    <span>BASTION</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-sky-950 text-sky-400 border border-sky-800">
                      CMS
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 tracking-wider font-medium">
                    Corporate Content Platform
                  </div>
                </div>
              </>
            )}
          </Link>

          <Link
            href={isGoldFields ? '/' : activeSite ? `/sites/${activeSite.slug}` : '/'}
            target="_blank"
            title="Open Live Website"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B] transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Client & Website Switcher Dropdown */}
        <div className="p-3 border-b border-[#1E293B] relative">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
            Active Client & Site
          </div>
          <button
            type="button"
            onClick={() => setClientMenuOpen(!clientMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#131A26] hover:bg-[#1A2333] border border-[#232F42] text-left transition shadow-xs"
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Building className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">
                  {activeClient?.name || 'Select Client'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {activeSite?.name || 'All Websites'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          </button>

          {/* Client Switcher Popup */}
          {clientMenuOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-[#131A26] border border-[#2A374A] rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="px-3 py-1.5 text-[9px] font-bold uppercase text-slate-400 border-b border-[#232F42]">
                Switch Client Project
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
                      ? 'bg-sky-950/60 text-sky-300 font-semibold'
                      : 'text-slate-300 hover:bg-[#1E2838]'
                  }`}
                >
                  <div className="truncate">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{c.industry.replace('_', ' ')}</div>
                  </div>
                  {c.id === activeClient?.id && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </button>
              ))}

              <div className="border-t border-[#232F42] p-1.5">
                <Link
                  href="/admin/create"
                  onClick={() => setClientMenuOpen(false)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-sky-400 hover:bg-sky-950/50 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Client</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Primary Navigation Sections */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-230px)] scrollbar-thin scrollbar-thumb-slate-800">
          {isGoldFieldsPortal ? (
            /* GOLD FIELDS CORPORATE CMS NAVIGATION */
            <>
              {/* Corporate Disclosures */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>Corporate Disclosures</span>
                  <span className="text-[8px] bg-amber-950/80 px-1 py-0.2 rounded text-amber-300 font-mono border border-amber-800/60">
                    Live
                  </span>
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-400" />
                    <span>Executive Dashboard</span>
                  </Link>
                  <Link
                    href="/admin/operations"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/operations')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Mining Operations (10)</span>
                  </Link>
                  <Link
                    href="/admin/reports"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/reports')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span>Reports & Results (11)</span>
                  </Link>
                  <Link
                    href="/admin/news"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/news')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Newspaper className="w-4 h-4 text-amber-400" />
                    <span>SENS Announcements</span>
                  </Link>
                  <Link
                    href="/admin/sustainability"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/sustainability')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>2030 ESG Targets</span>
                  </Link>
                </div>
              </div>

              {/* Content & Layouts */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Content & Layouts
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/pages"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin/pages'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Pages & Navigation</span>
                  </Link>
                  <Link
                    href="/admin/media"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/media')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Media Library</span>
                  </Link>
                  <Link
                    href="/admin/editor"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/editor')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Visual Page Editor</span>
                  </Link>
                  <Link
                    href="/admin/tasks"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/tasks')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Send className="w-4 h-4 text-slate-400" />
                    <span>Reviews & JSE Sign-Off</span>
                  </Link>
                </div>
              </div>

              {/* Bastion Website Integration */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bastion Platform Sync
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/settings"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/settings')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Website Sync & Webhooks</span>
                  </Link>
                  <Link
                    href="/admin/sandbox"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/sandbox')
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <div className="flex items-center justify-between flex-1">
                      <span>API Sandbox</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-amber-950 text-amber-300 border border-amber-800">
                        Live
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            /* AGENCY MULTI-TENANT WORKSPACE NAVIGATION */
            <>
              {/* Workspace */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agency Workspace
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin'
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-sky-400" />
                    <span>Overview</span>
                  </Link>
                  <Link
                    href="/admin/clients"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/clients')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Clients & Websites</span>
                  </Link>
                  <Link
                    href="/admin/create"
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/create')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Website Import & Wizard</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                      New
                    </span>
                  </Link>
                  <Link
                    href="/admin/billing"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/billing')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Commercial & Billing</span>
                  </Link>
                </div>
              </div>

              {/* Design & Assembly */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Design & Assembly
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/brand"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/brand')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Palette className="w-4 h-4 text-amber-400" />
                    <span>Brand Library</span>
                  </Link>
                  <Link
                    href="/admin/blueprints"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/blueprints')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-violet-400" />
                    <span>Blueprints (3)</span>
                  </Link>
                  <Link
                    href="/admin/editor"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/editor')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Visual Website Editor</span>
                  </Link>
                </div>
              </div>

              {/* Content & Management */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Content & Publishing
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/pages"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname === '/admin/pages'
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>Pages & Layouts</span>
                  </Link>
                  <Link
                    href="/admin/media"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/media')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                    <span>Media Library</span>
                  </Link>
                  <Link
                    href="/admin/tasks"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/tasks')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Send className="w-4 h-4 text-slate-400" />
                    <span>Reviews & Publishing</span>
                  </Link>
                </div>
              </div>

              {/* Operations & Settings */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Operations & Systems
                </div>
                <div className="space-y-0.5">
                  <Link
                    href="/admin/health"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/health')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Website Health</span>
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/analytics')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/admin/sandbox"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/sandbox')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    <div className="flex items-center justify-between flex-1">
                      <span>API Sandbox</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                        Live
                      </span>
                    </div>
                  </Link>
                  <Link
                    href="/admin/settings"
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      pathname.startsWith('/admin/settings')
                        ? 'bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#141C2A]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Headless API & Webhooks</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-[#1E293B] bg-[#070B10]">
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
              isGoldFieldsPortal
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                : 'bg-slate-800 border border-slate-700 text-sky-400'
            }`}>
              {user?.name ? user.name[0] : (isGoldFieldsPortal ? 'G' : 'M')}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-white truncate">
                {user?.name || (isGoldFieldsPortal ? 'Gold Fields Editor' : 'Move Studio Admin')}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {isGoldFieldsPortal ? 'Corporate Portal • Bastion' : 'Agency Workspace'}
              </div>
            </div>
          </div>
        </div>

        {/* View Switcher Toggle Button */}
        {isGoldFields && (
          <button
            type="button"
            onClick={() => setPortalViewMode(portalViewMode === 'client' ? 'agency' : 'client')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition ${
              portalViewMode === 'client'
                ? 'bg-amber-950/40 hover:bg-amber-950/60 border-amber-800/50 text-amber-300'
                : 'bg-[#141C2A] hover:bg-[#1A2536] border-[#232F42] text-slate-300'
            }`}
          >
            <span className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${portalViewMode === 'client' ? 'bg-amber-400 animate-pulse' : 'bg-sky-400'}`} />
              <span className="truncate">
                {portalViewMode === 'client' ? 'Client Portal Mode' : 'Agency Studio Mode'}
              </span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono hover:text-white shrink-0 ml-1">
              Switch ⇄
            </span>
          </button>
        )}
      </div>
    </aside>
  );
}
