'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  ChevronDown,
  Check,
  ExternalLink,
  ChevronRight,
  Globe,
  Building,
  Sparkles,
  Layers,
  ShieldCheck,
  Search,
  PlusCircle,
  Bell,
  Command,
  Sliders,
  SlidersHorizontal,
  Users,
  Compass,
  ArrowRight
} from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    clients,
    activeClient,
    activeSite,
    setActiveClientId,
    setActiveSiteId,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();

  const [sastTime, setSastTime] = useState<string>('');
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [perspectiveDropdownOpen, setPerspectiveDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  
  const siteDropdownRef = useRef<HTMLDivElement>(null);
  const perspectiveDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(event.target as Node)) {
        setSiteSwitcherOpen(false);
      }
      if (perspectiveDropdownRef.current && !perspectiveDropdownRef.current.contains(event.target as Node)) {
        setPerspectiveDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener for ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setSastTime(
        now.toLocaleTimeString('en-ZA', {
          timeZone: 'Africa/Johannesburg',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const isClientPortal = portalViewMode === 'client';
  const siteUrl = activeClient?.id === 'client_goldfields'
    ? '/'
    : activeSite
      ? `/sites/${activeSite.slug}`
      : '/';

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(switcherSearch.toLowerCase()) ||
    c.industry.toLowerCase().includes(switcherSearch.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-[68px] px-4 sm:px-6 lg:px-8 border-b border-slate-800/90 bg-[#0B0F19]/95 text-slate-200 backdrop-blur-xl flex items-center justify-between shadow-md transition-colors">
        {/* Left Section: Logo & Workspace Perspective Dropdown */}
        <div className="flex items-center gap-3">
          {/* Dynamic Brand Logo & Wordmark (Zara CareerOS style) */}
          <Link href="/admin" className="flex items-center gap-2.5 select-none group">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/15 shadow-md shadow-purple-500/20 flex-shrink-0 bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-black text-lg transition-transform group-hover:scale-105">
              <span>B</span>
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-extrabold text-base sm:text-xl text-white">
                BASTION
              </span>
              <span className="font-bold text-base sm:text-xl bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-400 bg-clip-text text-transparent ml-1">
                CMS
              </span>
            </div>
          </Link>

          <span className="hidden sm:inline text-slate-700 font-light text-base select-none">/</span>

          {/* Connected Workspace Perspective Dropdown */}
          <div ref={perspectiveDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setPerspectiveDropdownOpen(!perspectiveDropdownOpen)}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all shadow-2xs group"
              title="Click to switch between Agency Workspace and Client CMS"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse" />
              <span>
                {isClientPortal ? `${activeClient?.name || 'Client'} CMS` : 'Agency Studio'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </button>

            {perspectiveDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-[#0F141C] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in text-slate-200">
                <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1.5">
                  Select Perspective
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPortalViewMode('agency');
                    setPerspectiveDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    !isClientPortal
                      ? 'bg-[#7C3AED]/20 text-white font-bold border border-[#7C3AED]/30 shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Sliders className="w-4.5 h-4.5 flex-shrink-0 text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Bastion Agency Studio</div>
                    <div className="text-xs text-slate-400 font-normal">Clients, multi-tenant templates, brand systems &amp; publishing</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPortalViewMode('client');
                    setPerspectiveDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    isClientPortal
                      ? 'bg-[#7C3AED]/20 text-white font-bold border border-[#7C3AED]/30 shadow-xs'
                      : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Building className="w-4.5 h-4.5 flex-shrink-0 text-amber-400" />
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Client CMS Portal</div>
                    <div className="text-xs text-slate-400 font-normal">
                      {activeClient?.name || 'Gold Fields Limited'} &bull; Calm zero-code content editor
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Client Website Quick Switcher */}
          <div ref={siteDropdownRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-[130px] font-semibold text-slate-200">
                {activeClient?.name || 'Bastion Group'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {siteSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0F141C] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in text-slate-200">
                <div className="px-2 pb-2 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search client properties..."
                      value={switcherSearch}
                      onChange={(e) => setSwitcherSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                  {filteredClients.map((c) => {
                    const isActive = c.id === activeClient?.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveClientId(c.id);
                          setSiteSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition ${
                          isActive
                            ? 'bg-[#7C3AED]/20 text-purple-300 font-semibold border border-[#7C3AED]/30'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-white truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize truncate">
                            {c.websites?.[0]?.name || c.industry.replace('_', ' ')}
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800 pt-1.5 px-1">
                  <Link
                    href="/admin/create"
                    onClick={() => setSiteSwitcherOpen(false)}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-400 hover:bg-purple-950/40 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Client Website</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: ⌘K Search Pill, Copilot Button, Notifications, Theme, Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Command / Global Search Shortcut */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="hidden md:flex items-center gap-2.5 h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 hover:bg-slate-800 text-sm text-slate-300 hover:text-white transition-all shadow-xs group"
            title="Search all websites, pages and collections (⌘K)"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium text-slate-200">Search CMS...</span>
            <kbd className="text-xs px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-slate-300 group-hover:text-white transition-colors">
              ⌘K
            </kbd>
          </button>

          {/* Contextual Copilot Trigger (Zara CareerOS Signature) */}
          <button
            type="button"
            onClick={() => {
              // Trigger Copilot drawer / assistant
              window.dispatchEvent(new CustomEvent('open-bastion-copilot'));
            }}
            className="h-10 px-4 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-md bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white shadow-purple-500/25 border border-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
            title="Open Bastion AI Copilot"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">Bastion Copilot</span>
            <span className="sm:hidden">Copilot</span>
          </button>

          {/* Notifications Trigger */}
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center relative transition-all shadow-xs"
              title="Communications &amp; Notification Center"
              aria-label="Open notifications menu"
            >
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#7C3AED] ring-2 ring-[#0B0F19]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F141C] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in text-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Publishing Alerts</span>
                  <span className="text-[10px] text-purple-400 font-semibold">2 pending</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="font-semibold text-white">SENS Announcement Drafted</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Gold Fields Q3 Production Update is awaiting Bastion sign-off.</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                    <div className="font-semibold text-white">Edge Cache Invalidation</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Global edge purge completed in 42ms across 28 nodes.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customize Dashboard & Theme Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-dashboard-customize'))}
            className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
            title="Customize Dashboard, Cards, KPIs &amp; Colors"
            aria-label="Customize dashboard"
          >
            <SlidersHorizontal className="w-4.5 h-4.5 text-purple-400 hover:text-purple-300 transition-colors" />
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-all shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle light and dark mode"
          >
            {theme === 'dark' ? (
              <Moon className="w-4.5 h-4.5 text-purple-300 hover:text-white transition-colors" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-400 hover:text-amber-300 transition-colors" />
            )}
          </button>

          {/* Dual SAST Time Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-300">
            <span className="text-[10px] text-slate-500 font-sans font-bold">SAST</span>
            <span className="font-semibold text-purple-300">{sastTime || '--:--:--'}</span>
          </div>

          {/* Live Website Preview Pill Button */}
          <Link
            href={siteUrl}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-xs font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition shadow-xs"
            title="Open Live Website in New Window"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </Link>

          {/* User Profile Avatar with Online Badge */}
          <div
            className="flex items-center gap-2 select-none cursor-pointer pl-1"
            title={`Signed in as ${user?.name || 'Malcolm Govender'}`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center text-xs font-extrabold text-white shadow-xs">
                <span>{user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'MG'}</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0B0F19]" />
            </div>
          </div>
        </div>
      </header>

      {/* Global ⌘K Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-[#0F141C] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-4 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-purple-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search websites, pages, brand kits, SENS..."
                value={switcherSearch}
                onChange={(e) => setSwitcherSearch(e.target.value)}
                className="w-full bg-transparent text-base font-medium text-white placeholder:text-slate-500 focus:outline-none"
              />
              <kbd
                onClick={() => setSearchModalOpen(false)}
                className="px-2 py-1 text-xs font-mono bg-slate-800 text-slate-400 rounded-md border border-slate-700 cursor-pointer hover:text-white"
              >
                ESC
              </kbd>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Quick Navigation
              </div>
              <button
                type="button"
                onClick={() => { router.push('/admin'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-800/80 text-white font-medium"
              >
                <span>Agency Executive Overview</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/brand'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-800/80 text-white font-medium"
              >
                <span>Brand DNA Extractor &amp; Design Systems</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/create'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-800/80 text-white font-medium"
              >
                <span>Create New Client Website</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/news'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-800/80 text-white font-medium"
              >
                <span>SENS Announcements &amp; Regulatory Releases</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/users'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left hover:bg-slate-800/80 text-white font-medium"
              >
                <span>Platform Users &amp; Authorized Editors</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
