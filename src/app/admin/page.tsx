'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, hasPerm } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading Gold Fields Studio telemetry...</span>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalPublished = data?.statusCounts?.find((s: any) => s.status === 'published')?.count || 0;
  const inReviewCount = data?.statusCounts?.find((s: any) => s.status === 'in_review')?.count || 0;
  const draftCount = data?.statusCounts?.find((s: any) => s.status === 'draft')?.count || 0;
  const activeIncidents = data?.incidents?.length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0E1624] via-[#10192A] to-[#152238] border border-[#1E2E44] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase tracking-wider font-semibold mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational Studio Environment • JSE / NYSE Regulated</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.name || 'Operator'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Role: <span className="text-gray-200 capitalize font-medium">{user?.role.replace('_', ' ')}</span> • Scope: <span className="text-gray-200 font-medium">{user?.region_scope}</span> • Database: LibSQL Production Snapshot
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/admin/news/new"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold text-xs transition shadow-md shadow-[#C99700]/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Disclosure</span>
          </Link>
          <Link
            href="/admin/media"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#172336] hover:bg-[#20314C] border border-[#273B57] text-gray-200 hover:text-white text-xs font-medium transition"
          >
            <Layers className="w-3.5 h-3.5 text-[#C99700]" />
            <span>Media Library</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Published */}
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] relative overflow-hidden group hover:border-[#C99700]/40 transition">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Live Published Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{totalPublished}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center space-x-1">
            <span>Across 7 collections</span>
            <span className="text-emerald-400 font-medium ml-1">100% Synced</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition" />
        </div>

        {/* Card 2: In Review */}
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] relative overflow-hidden group hover:border-[#C99700]/40 transition">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Review Queue</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-300 tracking-tight">{inReviewCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center space-x-1">
            <span>Pending compliance sign-off</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition" />
        </div>

        {/* Card 3: Drafts */}
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] relative overflow-hidden group hover:border-[#C99700]/40 transition">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Drafts</span>
            <FileText className="w-4 h-4 text-[#C99700]" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight">{draftCount}</div>
          <div className="text-[11px] text-gray-500 mt-1 flex items-center space-x-1">
            <span>Unpublished revisions</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-[#C99700]/5 rounded-full blur-xl group-hover:bg-[#C99700]/10 transition" />
        </div>

        {/* Card 4: Health / Incidents */}
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] relative overflow-hidden group hover:border-[#C99700]/40 transition">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">System Health</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>99.9%</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              Nominal
            </span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {activeIncidents === 0 ? '0 Active Incidents' : `${activeIncidents} Active Incident`}
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition" />
        </div>
      </div>

      {/* Two Column Layout: Needs Attention & Publishing Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Review Queue & Content Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Review Queue Card */}
          <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Workflow Review Queue</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Items requiring editorial review or two-person sign-off before publishing
                </p>
              </div>
              <Link
                href="/admin/tasks"
                className="text-xs text-[#E6C657] hover:underline flex items-center space-x-1"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.pendingItems && data.pendingItems.length > 0 ? (
              <div className="divide-y divide-[#1A2536]">
                {data.pendingItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-white">{item.title}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#162234] text-gray-300 border border-[#24354F]">
                          {item.collection}
                        </span>
                        <span
                          className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-medium ${
                            item.status === 'in_review'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        Author: {item.owner_name || 'Sarah Jenkins'} • Updated {new Date(item.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <Link
                      href={`/admin/${item.collection}/${item.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#141F30] hover:bg-[#1D2C44] border border-[#22334D] text-xs text-gray-200 hover:text-white transition flex items-center space-x-1"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#C99700]" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-[#080D14] border border-[#162030] text-gray-400 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span>All editorial items are up to date. No pending reviews in the queue.</span>
              </div>
            )}
          </div>

          {/* Collections Overview Grid */}
          <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#C99700]" />
              <span>Managed Collections &amp; Repositories</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Operations', count: 10, href: '/admin/operations', desc: 'Global mine profiles' },
                { name: 'Corporate Reports', count: 11, href: '/admin/reports', desc: 'Financial booklets & results' },
                { name: 'News & Releases', count: 4, href: '/admin/news', desc: 'JSE/NYSE disclosures' },
                { name: 'Sustainability', count: 6, href: '/admin/sustainability', desc: '2030 ESG metrics' },
                { name: 'Careers', count: 6, href: '/admin/jobs', desc: 'Open vacancies' },
                { name: 'Suppliers', count: 4, href: '/admin/suppliers', desc: 'Procurement standards' }
              ].map((c) => (
                <Link
                  key={c.name}
                  href={c.href}
                  className="p-3.5 rounded-xl bg-[#090E17] border border-[#1A2536] hover:border-[#C99700]/50 hover:bg-[#0E1624] transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-200 group-hover:text-[#D4AF37] transition">
                      {c.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">{c.count}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{c.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Dual Timezone Publishing Calendar & Audit Trail */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dual-Timezone Publishing Calendar */}
          <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#C99700]" />
                <span>Publishing Schedule</span>
              </h2>
              <span className="text-[10px] font-mono text-gray-400">SAST &amp; UTC</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#0F1726] border border-[#1E2D44]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white">Q3 2026 Operational Disclosures</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    Scheduled
                  </span>
                </div>
                <div className="text-[11px] text-gray-400">
                  Dual embargo release: JSE SENS &amp; NYSE Wire
                </div>
                <div className="mt-2 pt-2 border-t border-[#1C2B42] flex items-center justify-between text-[11px] font-mono text-gray-300">
                  <span>SAST: 2026-10-15 08:00</span>
                  <span>UTC: 06:00</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A101A] border border-[#162234]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-300">Annual GISTM Tailings Compliance Audit</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-gray-500">
                  Verified across 10 operational tailings management facilities
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail Stream */}
          <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Live Audit Activity</span>
              </h2>
              <Link href="/admin/audit" className="text-xs text-[#E6C657] hover:underline">
                Full Trail
              </Link>
            </div>

            <div className="space-y-3">
              {data?.auditLogs && data.auditLogs.length > 0 ? (
                data.auditLogs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-[#C99700]/50 pl-3 py-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{log.action}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      by <span className="text-gray-300">{log.actor_name}</span> • result: <span className="text-emerald-400">{log.result}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No recent audit events.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
