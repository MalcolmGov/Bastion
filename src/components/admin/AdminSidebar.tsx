'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import {
  LayoutDashboard,
  FileText,
  Compass,
  FileSpreadsheet,
  Newspaper,
  Leaf,
  Briefcase,
  Truck,
  Image as ImageIcon,
  Palette,
  Clock,
  Activity,
  BarChart3,
  Bot,
  History,
  CheckSquare,
  LogOut,
  ExternalLink,
  Shield,
  MapPin
} from 'lucide-react';

interface NavSection {
  title: string;
  items: {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
    perm?: string;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      { label: 'Review Queue', href: '/admin/tasks', icon: CheckSquare, badge: '2' },
      { label: 'Audit Trail', href: '/admin/audit', icon: History }
    ]
  },
  {
    title: 'Content Collections',
    items: [
      { label: 'Flagship Pages', href: '/admin/pages', icon: FileText },
      { label: 'Operations (10)', href: '/admin/operations', icon: Compass },
      { label: 'Reports & Results', href: '/admin/reports', icon: FileSpreadsheet },
      { label: 'News & Releases', href: '/admin/news', icon: Newspaper },
      { label: 'Sustainability & ESG', href: '/admin/sustainability', icon: Leaf },
      { label: 'Careers (6)', href: '/admin/jobs', icon: Briefcase },
      { label: 'Suppliers (4)', href: '/admin/suppliers', icon: Truck }
    ]
  },
  {
    title: 'Brand & Design',
    items: [
      { label: 'Design System & UI', href: '/admin/design-system', icon: Palette, badge: 'Tokens' },
      { label: 'Media Library', href: '/admin/media', icon: ImageIcon }
    ]
  },
  {
    title: 'Operations & Intelligence',
    items: [
      { label: 'Scheduled Worker', href: '/admin/scheduled', icon: Clock },
      { label: 'Site Health', href: '/admin/health', icon: Activity, badge: 'OK' },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      { label: 'AI Assistant Governance', href: '/admin/ai-knowledge', icon: Bot }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, hasPerm } = useAdminAuth();

  return (
    <aside className="w-64 bg-[#0A0F17] border-r border-[#1E293B] flex flex-col justify-between h-screen sticky top-0 selection:bg-[#C99700] selection:text-black shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#996515] flex items-center justify-center font-bold text-black text-xs shadow-md">
              GF
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white leading-tight">
                GOLD FIELDS
              </div>
              <div className="text-[10px] text-[#C99700] uppercase tracking-wider font-semibold">
                Studio Operations
              </div>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            title="Open Live Website"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E293B] transition"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin scrollbar-thumb-gray-800">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-[#C99700]/15 text-[#E6C657] border border-[#C99700]/30 shadow-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-[#141C2A]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : 'text-gray-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            item.badge === 'OK'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer / RBAC status */}
      <div className="p-3 border-t border-[#1E293B] bg-[#080D14]">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="flex items-center space-x-1.5 text-[10px] text-[#C99700] mt-0.5">
                  <Shield className="w-3 h-3" />
                  <span className="capitalize">{user.role.replace('_', ' ')}</span>
                </div>
                {user.region_scope && user.region_scope !== 'All' && (
                  <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-0.5">
                    <MapPin className="w-2.5 h-2.5 text-gray-500" />
                    <span>{user.region_scope}</span>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                title="Sign out of Studio"
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-1.5 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] text-gray-500">
              <span>LibSQL Local DB</span>
              <span className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Connected</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Checking credentials...</div>
        )}
      </div>
    </aside>
  );
}
