'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import { isAgencyUser } from '@/lib/auth/roles';
import { useStudioWorkspace } from './StudioWorkspaceProvider';
import { useTheme } from './ThemeProvider';
import {
  Sun,
  Moon,
  ChevronDown,
  Check,
  ExternalLink,
  Globe,
  Building,
  Sparkles,
  Search,
  PlusCircle,
  Bell,
  Sliders,
  SlidersHorizontal,
  ArrowRight,
  LogOut,
  User,
  ShieldCheck,
  Eye,
  CheckCircle2
} from 'lucide-react';

import { useDashboardCustomizer } from './DashboardCustomizerProvider';
import { BastionLogo } from './BastionLogo';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const { primaryColor, accentColor, openCustomizer } = useDashboardCustomizer();
  const {
    clients,
    activeClient,
    activeSite,
    clientWebsites,
    setActiveClientId,
    setActiveSiteId,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();

  const agency = isAgencyUser(user);
  const [sastTime, setSastTime] = useState<string>('');
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [perspectiveDropdownOpen, setPerspectiveDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const [attentionItems, setAttentionItems] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadAttention = async () => {
      try {
        const query = new URLSearchParams({
          ...(activeClient?.id ? { clientId: activeClient.id } : {}),
          ...(activeSite?.id ? { siteId: activeSite.id } : {}),
        }).toString();
        const res = await fetch(`/api/admin/workspace/attention?${query}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setAttentionItems(data.items || []);
        }
      } catch {
        // Ignore network errors on background check
      }
    };
    loadAttention();
    return () => {
      cancelled = true;
    };
  }, [activeClient?.id, activeSite?.id]);
  
  const siteDropdownRef = useRef<HTMLDivElement>(null);
  const perspectiveDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
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

  // Live SAST Clock
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

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'MG';

  return (
    <>
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0B0F19]/90 text-slate-800 dark:text-slate-200 backdrop-blur-xl flex items-center justify-between shadow-2xs transition-colors duration-200">
        {/* ─── ZONE 1: BREADCRUMBS & CONTEXT ARCHITECTURE ─── */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <Link 
              href="/admin" 
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition cursor-pointer"
            >
              <span className="text-sm font-semibold">&larr;</span>
              <span>Workspace</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="font-semibold text-slate-900 dark:text-white capitalize">
              {pathname === '/admin' ? 'Overview' : pathname.replace('/admin/', '').split('/')[0].replace('-', ' ')}
            </span>
          </div>

          {/* Workspace Perspective Switcher (Agency Operations Only) */}
          {!isClientPortal && agency && (
            <div ref={perspectiveDropdownRef} className="relative ml-2">
              <button
                type="button"
                onClick={() => setPerspectiveDropdownOpen(!perspectiveDropdownOpen)}
                className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-900/60 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs group cursor-pointer"
                title="Click to switch between Agency Workspace and Client CMS"
              >
                <span 
                  style={{ backgroundColor: primaryColor }}
                  className="w-2 h-2 rounded-full animate-pulse shrink-0" 
                />
                <span className="truncate max-w-[130px] sm:max-w-[170px]">
                  Bastion Studio
                </span>
                <ChevronDown 
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-transform duration-200 ${
                    perspectiveDropdownOpen ? 'rotate-180 text-white' : ''
                  }`} 
                />
              </button>

              {perspectiveDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-xl">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-2 flex items-center justify-between">
                    <span>Workspace Perspective</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  </div>
                  
                  {/* Agency Studio Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortalViewMode('agency');
                      setPerspectiveDropdownOpen(false);
                    }}
                    style={{
                      backgroundColor: `${primaryColor}18`,
                      borderColor: `${primaryColor}40`
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-white font-bold border shadow-xs"
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        borderColor: `${primaryColor}30`,
                        color: primaryColor
                      }}
                    >
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>Bastion Agency Studio</span>
                        <Check className="w-4 h-4" style={{ color: primaryColor }} />
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal truncate">
                        Multi-tenant websites, brand systems &amp; publishing
                      </div>
                    </div>
                  </button>

                  {/* Client CMS Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortalViewMode('client');
                      setPerspectiveDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-1 text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-bold text-white flex items-center justify-between">
                        <span>Client CMS Portal</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal truncate">
                        {activeClient?.name || 'Corporate'} &bull; Zero-code content editor
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Connected Client Website Selector (Universal across Agency & Client CMS) */}
          {activeClient && (
            <div ref={siteDropdownRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs group cursor-pointer"
                title="Active Corporate Web Property"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate max-w-[130px] font-semibold text-slate-800 dark:text-slate-200">
                  {activeSite?.name || activeClient.name}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeSite?.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {clientWebsites.length > 1 && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    {clientWebsites.length}
                  </span>
                )}
                <ChevronDown 
                  className={`w-3 h-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
                    siteSwitcherOpen ? 'rotate-180 text-blue-500' : ''
                  }`} 
                />
              </button>

              {siteSwitcherOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-xl">
                  <div className="px-2 pb-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {activeClient.name} Properties
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold">{clientWebsites.length} total</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1 space-y-1 scrollbar-thin">
                    {clientWebsites.map((siteItem) => {
                      const isSelected = siteItem.id === activeSite?.id;
                      return (
                        <button
                          key={siteItem.id}
                          type="button"
                          onClick={() => {
                            setActiveSiteId(siteItem.id);
                            setSiteSwitcherOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer group ${
                            isSelected
                              ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-xs'
                              : 'hover:bg-white/[0.06] text-slate-300 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs truncate">{siteItem.name}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                                siteItem.status === 'published'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                                  : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              }`}>
                                {siteItem.status === 'published' ? 'Live' : 'Draft'}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {siteItem.primaryDomain || `${siteItem.slug}.bastion.digital`}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {agency && (
                    <div className="border-t border-slate-800/80 pt-1.5 mt-1 px-1">
                      <Link
                        href="/admin/clients"
                        onClick={() => setSiteSwitcherOpen(false)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-purple-400 hover:bg-purple-950/30 transition"
                      >
                        <span>Switch Client Portfolio &rarr;</span>
                        <span className="text-[10px] text-slate-500 font-mono">{clients.length} tenants</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── ZONE 2: GLOBAL SEARCH BAR (CENTER) ─── */}
        <div className="flex-1 max-w-sm mx-4 hidden md:flex justify-center">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="w-full h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-100 hover:border-slate-300 text-xs text-slate-400 hover:text-slate-600 transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
            title="Global Search & Quick Actions (⌘K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="text-xs text-slate-400 font-normal">Search anything...</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-500">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* ─── ZONE 3: INTELLIGENCE & UTILITY DOCK (RIGHT) ─── */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all relative cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              title="Workspace Notifications & Activity"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4" />
              {attentionItems.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#0B0F19]" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80 mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Workspace Activity</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {attentionItems.length > 0 ? `${attentionItems.length} pending` : 'Up to date'}
                  </span>
                </div>
                <div className="space-y-2 text-xs max-h-60 overflow-y-auto">
                  {attentionItems.length > 0 ? (
                    attentionItems.slice(0, 5).map((item: any) => (
                      <Link
                        key={`${item.kind}:${item.id}`}
                        href={item.href || '/admin'}
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 transition"
                      >
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                          {item.kind?.replaceAll('_', ' ')} · {item.status?.replaceAll('_', ' ')}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500 mb-1.5" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">All clear</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">No pending items requiring attention in this workspace.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ask AI Pill Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-bastion-copilot'));
            }}
            className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-[#2563EB] border border-[#2563EB]/40 bg-white hover:bg-blue-50/70 shadow-2xs cursor-pointer"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Ask AI</span>
          </button>

          {/* Integrated Utility Dock (Agency Operations Only) */}
          {!isClientPortal && (
            <div className="flex items-center bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-full p-0.5 gap-0.5 shadow-2xs">
              {/* Customizer Trigger Button */}
              <button
                type="button"
                onClick={openCustomizer}
                className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer group"
                title="Customize Platform Theme & KPIs"
                aria-label="Customize dashboard"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 hover:text-slate-800" />
              </button>

              {/* Dark / Light Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="h-7 w-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer group"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme mode"
              >
                {theme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-purple-300" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
              </button>
              {/* Hairline Divider inside Dock */}
              <span className="hidden sm:inline-block h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

              {/* Live SAST Clock */}
              <div className="hidden xl:flex items-center gap-1.5 px-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none tabular-nums">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-sans">SAST</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{sastTime || '--:--:--'}</span>
              </div>

              {/* Live Site Preview Link */}
              <Link
                href={siteUrl}
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all group"
                title="Preview Live Production Website"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* User Profile Avatar with Online Badge & Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300/80 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-blue-500/30 transition cursor-pointer select-none"
              title={`Account: ${user?.name || 'Malcolm Govender'}`}
            >
              <span>{userInitials}</span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <div className="font-bold text-sm text-white">{user?.name || 'Malcolm Govender'}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email || 'malcolm@bastiongroup.co.za'}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Bastion Executive
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/admin/users"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manage Team &amp; Editors</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      openCustomizer();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customize Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      toggleTheme();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition cursor-pointer"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global ⌘K Quick Search Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0F141C] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
            <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
              <Search className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-800/80 text-white font-medium cursor-pointer"
              >
                <span>Agency Executive Overview</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/brand'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-800/80 text-white font-medium cursor-pointer"
              >
                <span>Brand DNA Extractor &amp; Design Systems</span>
                <ArrowRight className="w-4 h-4" style={{ color: primaryColor }} />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/create'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-800/80 text-white font-medium cursor-pointer"
              >
                <span>Create New Client Website</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/news'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-800/80 text-white font-medium cursor-pointer"
              >
                <span>SENS Announcements &amp; Regulatory Releases</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => { router.push('/admin/users'); setSearchModalOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-left hover:bg-slate-800/80 text-white font-medium cursor-pointer"
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
