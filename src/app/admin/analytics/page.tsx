'use client';

import React from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { BarChart3, TrendingUp, Download, Globe, Users, ArrowUpRight, Clock, Shield } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { user } = useAdminAuth();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Audience &amp; Regulatory Dissemination Telemetry</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Analytics &amp; Engagement Intelligence</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time insight into investor traffic, regulatory document downloads, and geographical engagement across mining regions.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 bg-[#080D14] border border-[#1E2B3E] px-3.5 py-2 rounded-xl">
          Tracking Period: <span className="text-white font-bold">Past 30 Days</span>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold">Total Page Views</span>
            <Users className="w-4 h-4 text-[#C99700]" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">148,920</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% since H1 2026 Results release</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold">Unique Visitors</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">42,650</div>
          <div className="text-[11px] text-gray-400 mt-1">Across 84 countries</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold">Report Downloads</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">12,480</div>
          <div className="text-[11px] text-gray-400 mt-1">PDF booklets &amp; tables</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs uppercase font-semibold">Avg Sub-Second Speed</span>
            <Clock className="w-4 h-4 text-[#C99700]" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight font-mono">0.31s</div>
          <div className="text-[11px] text-emerald-400 mt-1">Global 99.4% Edge Cache Hit</div>
        </div>
      </div>

      {/* Two Column Grid: Jurisdictions & Top Downloads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6: Jurisdictions */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Globe className="w-4 h-4 text-[#C99700]" />
            <span>Audience Distribution by Jurisdiction</span>
          </h2>

          <div className="space-y-3">
            {[
              { region: 'South Africa (JSE Focus)', pct: 42, color: 'bg-[#C99700]' },
              { region: 'Australia (Perth / Sydney)', pct: 28, color: 'bg-emerald-500' },
              { region: 'Ghana (Accra / Tarkwa)', pct: 14, color: 'bg-blue-500' },
              { region: 'North America (NYSE / GFI)', pct: 12, color: 'bg-purple-500' },
              { region: 'South America (Peru / Chile)', pct: 4, color: 'bg-amber-500' }
            ].map((j) => (
              <div key={j.region} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{j.region}</span>
                  <span className="font-mono text-white font-semibold">{j.pct}%</span>
                </div>
                <div className="w-full h-2 bg-[#080D14] rounded-full overflow-hidden">
                  <div className={`h-full ${j.color} rounded-full`} style={{ width: `${j.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 6: Top Downloads */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Most Downloaded Financial Disclosures</span>
          </h2>

          <div className="divide-y divide-[#162030]">
            {[
              { title: 'H1 2026 Results Booklet & Financial Tables', downloads: '4,890', size: '4.8 MB' },
              { title: '2024 Mineral Resources & Reserves Statement', downloads: '3,120', size: '12.4 MB' },
              { title: '2024 Climate Change & Decarbonization Report', downloads: '2,450', size: '6.2 MB' },
              { title: 'South Deep Operational Profile & Technical Summary', downloads: '1,980', size: '3.1 MB' }
            ].map((d) => (
              <div key={d.title} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="overflow-hidden pr-3">
                  <div className="text-xs font-semibold text-white truncate">{d.title}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">{d.size} • PDF format</div>
                </div>
                <span className="text-xs font-mono font-bold text-[#E6C657] shrink-0">
                  {d.downloads} dl
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
