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
  Eye
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
    setActiveClientId,
    portalViewMode,
    setPortalViewMode
  } = useStudioWorkspace();

  const [sastTime, setSastTime] = useState<string>('');
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [perspectiveDropdownOpen, setPerspectiveDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  
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
      <header className="sticky top-0 z-30 h-16 sm:h-[68px] px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#0B0F19]/90 text-slate-200 backdrop-blur-xl flex items-center justify-between shadow-xs transition-colors duration-200">
        {/* Subtle Ambient Top Border Highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1.5px] opacity-70 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 0%, ${primaryColor}80 30%, ${accentColor}80 70%, transparent 100%)`
          }}
        />

        {/* ─── ZONE 1: BRAND IDENTITY & CONTEXT ARCHITECTURE ─── */}
        <div className="flex items-center gap-3 lg:gap-4 shrink-0">
          {/* Authentic Bastion Group SVG Logo */}
          <Link 
            href="/admin" 
            className="flex items-center gap-2 select-none group focus:outline-none transition-transform active:scale-95"
            title="Bastion Group CMS"
          >
            <BastionLogo 
              height={26}
              color="white"
              showCmsBadge={true}
              className="hover:opacity-95"
            />
          </Link>

          {/* Hairline Divider */}
          <span className="hidden sm:inline-block h-5 w-px bg-slate-800/80 select-none" />

          {/* Workspace Perspective Switcher (Agency Studio vs Client CMS) */}
          <div ref={perspectiveDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setPerspectiveDropdownOpen(!perspectiveDropdownOpen)}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700/80 text-slate-200 hover:text-white transition-all shadow-2xs group cursor-pointer"
              title="Click to switch between Agency Workspace and Client CMS"
            >
              <span 
                style={{ backgroundColor: primaryColor }}
                className="w-2 h-2 rounded-full animate-pulse shrink-0" 
              />
              <span className="truncate max-w-[130px] sm:max-w-[170px]">
                {isClientPortal ? `${activeClient?.name || 'Client'} CMS` : 'Bastion Studio'}
              </span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
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
                  style={!isClientPortal ? {
                    backgroundColor: `${primaryColor}18`,
                    borderColor: `${primaryColor}40`
                  } : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    !isClientPortal
                      ? 'text-white font-bold border shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
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
                      {!isClientPortal && <Check className="w-4 h-4" style={{ color: primaryColor }} />}
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
                  style={isClientPortal ? {
                    backgroundColor: `${primaryColor}18`,
                    borderColor: `${primaryColor}40`
                  } : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer mt-1 ${
                    isClientPortal
                      ? 'text-white font-bold border shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>Client CMS Portal</span>
                      {isClientPortal && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal truncate">
                      {activeClient?.name || 'Corporate'} &bull; Zero-code content editor
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Toggle: Client Experience Sandbox */}
          {!isClientPortal ? (
            <button
              type="button"
              onClick={() => setPortalViewMode('client')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition shadow-2xs cursor-pointer group"
              title="Experience the zero-code CMS interface seen by corporate clients"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Client Sandbox</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setPortalViewMode('agency')}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition shadow-2xs cursor-pointer group"
              title="Return to Bastion Agency Studio Operations"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Agency Studio</span>
            </button>
          )}

          {/* Connected Client Website Selector */}
          <div ref={siteDropdownRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-2xs group cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              <span className="truncate max-w-[130px] font-semibold text-slate-200">
                {activeClient?.name || 'Bastion Group'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Production Site Live" />
              <ChevronDown 
                className={`w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-transform duration-200 ${
                  siteSwitcherOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {siteSwitcherOpen && (
              <div className="absolute left-0 mt-2 w-72 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-xl">
                <div className="px-2 pb-2 border-b border-slate-800/80">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter corporate clients..."
                      value={switcherSearch}
                      onChange={(e) => setSwitcherSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                        style={isActive ? {
                          backgroundColor: `${primaryColor}18`,
                          borderColor: `${primaryColor}40`,
                          color: '#ffffff'
                        } : undefined}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                          isActive
                            ? 'font-bold border shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold text-white truncate">{c.name}</div>
                          <div className="text-[10px] text-slate-400 capitalize truncate">
                            {c.websites?.[0]?.name || c.industry.replace('_', ' ')}
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />}
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800/80 pt-1.5 px-1">
                  <Link
                    href="/admin/create"
                    onClick={() => setSiteSwitcherOpen(false)}
                    style={{ color: primaryColor }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-85 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Client Website</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── ZONE 2: FLOATING COMMAND CENTER (CENTER) ─── */}
        <div className="flex-1 max-w-sm mx-4 hidden md:flex justify-center">
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="w-full h-9 px-3.5 rounded-full border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/90 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all duration-300 shadow-2xs hover:shadow-lg flex items-center justify-between group cursor-pointer"
            title="Global Search & Quick Actions (⌘K)"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search 
                className="w-3.5 h-3.5 transition-colors duration-200 group-hover:scale-110" 
                style={{ color: primaryColor }} 
              />
              <span className="text-xs text-slate-300 font-medium">Quick search or type ⌘K...</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80 font-mono text-slate-400 group-hover:text-white group-hover:border-slate-600 transition-colors shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* ─── ZONE 3: INTELLIGENCE & UTILITY DOCK (RIGHT) ─── */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Luminous Bastion AI Copilot Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-bastion-copilot'));
            }}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              boxShadow: `0 4px 16px ${primaryColor}35`
            }}
            className="h-9 px-3.5 sm:px-4 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-200 text-white border border-white/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group shadow-sm relative overflow-hidden"
            title="Open Bastion AI Copilot Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
            <span className="hidden sm:inline tracking-wide font-extrabold">Bastion Copilot</span>
            <span className="sm:hidden font-extrabold">Copilot</span>
          </button>

          {/* Integrated Glass Utility Dock */}
          <div className="flex items-center bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-full p-0.5 sm:p-1 gap-0.5 shadow-2xs">
            {/* Notification Bell */}
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all relative cursor-pointer"
                title="Publishing Notifications & Alerts"
                aria-label="Open notifications"
              >
                <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span 
                  style={{ backgroundColor: primaryColor }}
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#0B0F19] animate-pulse" 
                />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0F141C] border border-slate-800/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 text-slate-200 backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Publishing Alerts</span>
                    <span className="text-[10px] font-semibold" style={{ color: accentColor }}>2 pending</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="font-semibold text-white">SENS Announcement Drafted</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Gold Fields Q3 Production Update is awaiting executive sign-off.</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <div className="font-semibold text-white">Edge Purge Complete</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">CDN cache invalidated in 38ms across 28 global nodes.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customizer Trigger Button */}
            <button
              type="button"
              onClick={openCustomizer}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer group"
              title="Customize Platform Theme & KPIs"
              aria-label="Customize dashboard"
            >
              <SlidersHorizontal className="w-4 h-4 transition-transform group-hover:rotate-45" style={{ color: accentColor }} />
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all cursor-pointer group"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-purple-300 group-hover:rotate-12 transition-transform" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              )}
            </button>

            {/* Hairline Divider inside Dock */}
            <span className="hidden sm:inline-block h-4 w-px bg-slate-800/80 mx-0.5" />

            {/* Live SAST Clock */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 text-[11px] font-mono text-slate-400 select-none tabular-nums">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-sans">SAST</span>
              <span className="font-semibold text-slate-200">{sastTime || '--:--:--'}</span>
            </div>

            {/* Live Site Preview Link */}
            <Link
              href={siteUrl}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white rounded-full hover:bg-slate-800/70 transition-all group"
              title="Preview Live Production Website"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* User Profile Avatar with Online Badge & Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer select-none group focus:outline-none"
              title={`Account: ${user?.name || 'Malcolm Govender'}`}
            >
              <div className="relative">
                <div 
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}40, #1E293B)`
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-700/80 flex items-center justify-center text-xs font-bold font-sans text-white shadow-xs group-hover:scale-105 transition-transform"
                >
                  <span>{userInitials}</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-[#0B0F19]" />
              </div>
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
