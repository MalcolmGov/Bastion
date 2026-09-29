'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Monitor
} from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
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
  const [utcTime, setUtcTime] = useState<string>('');
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [switcherSearch, setSwitcherSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSiteSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      setUtcTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
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

  const segments = pathname.split('/').filter(Boolean);
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
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0A0D14]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150">
      {/* Left: Context switcher & Breadcrumbs */}
      <div className="flex items-center space-x-3 text-xs min-w-0">
        {/* Workspace Switcher / Site Selector Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
            className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition shadow-xs group"
          >
            <div className={`w-2 h-2 rounded-full ${isClientPortal ? 'bg-amber-500 animate-pulse' : 'bg-bastion-blue'}`} />
            <span className="font-semibold text-slate-900 dark:text-white max-w-[140px] sm:max-w-[200px] truncate">
              {activeClient?.name || 'Bastion Group'}
            </span>
            {activeSite && (
              <>
                <span className="text-slate-400 dark:text-slate-600 hidden md:inline">/</span>
                <span className="text-slate-600 dark:text-slate-400 hidden md:inline max-w-[120px] truncate">
                  {activeSite.name}
                </span>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition" />
          </button>

          {/* Quick Context Switcher Dropdown */}
          {siteSwitcherOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search client websites..."
                    value={switcherSearch}
                    onChange={(e) => setSwitcherSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-bastion-blue"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto py-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Client Websites
                </div>
                {filteredClients.map((c) => {
                  const isActive = c.id === activeClient?.id;
                  return (
                    <div key={c.id} className="px-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveClientId(c.id);
                          setSiteSwitcherOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition ${
                          isActive
                            ? 'bg-slate-100 dark:bg-slate-800/80 text-bastion-blue dark:text-sky-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="truncate text-slate-900 dark:text-white font-medium">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize truncate">
                            {c.websites?.[0]?.name || c.industry.replace('_', ' ')}
                          </div>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-bastion-blue dark:text-sky-400 shrink-0" />}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1.5 px-2">
                <Link
                  href="/admin/clients"
                  onClick={() => setSiteSwitcherOpen(false)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                >
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>View All Clients Directory</span>
                </Link>
                <Link
                  href="/admin/create"
                  onClick={() => setSiteSwitcherOpen(false)}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-bastion-blue dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/40 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create New Client Website</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Breadcrumb path */}
        <div className="hidden md:flex items-center space-x-1.5 text-slate-400">
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
          <Link
            href="/admin"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            {isClientPortal ? `${activeClient?.name || 'Client'} CMS` : 'Agency Studio'}
          </Link>
          {segments.slice(1).map((seg) => (
            <React.Fragment key={seg}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
              <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                {seg.replace('-', ' ')}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Mode Switcher, Clocks, Theme Toggle & Live Site Preview */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Workspace Mode Indicator / Switcher Pill */}
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setPortalViewMode('agency')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              !isClientPortal
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            title="Bastion Agency multi-tenant operations"
          >
            Agency Workspace
          </button>
          <button
            type="button"
            onClick={() => setPortalViewMode('client')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-medium transition ${
              isClientPortal
                ? 'bg-amber-500 text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
            title="Calm client content editing experience"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isClientPortal ? 'bg-white animate-pulse' : 'bg-amber-500'}`} />
            <span>Client CMS</span>
          </button>
        </div>

        {/* Dual Timezone Clock */}
        <div className="hidden xl:flex items-center space-x-2.5 px-2.5 py-1 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">SAST</span>
            <span className="font-semibold text-slate-800 dark:text-sky-400">{sastTime || '--:--:--'}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">UTC</span>
            <span>{utcTime || '--:--:--'}</span>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition shadow-xs flex items-center space-x-1.5"
          title={`Currently ${theme === 'dark' ? 'Dark' : 'Light'} theme. Click to toggle.`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
              <span className="text-xs font-medium hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-medium hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* View Live Website Button */}
        <Link
          href={siteUrl}
          target="_blank"
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-bastion text-white hover:bg-bastion-navy dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-transparent dark:border-slate-700 transition shadow-xs"
        >
          <span className="hidden sm:inline">Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
        </Link>
      </div>
    </header>
  );
}
