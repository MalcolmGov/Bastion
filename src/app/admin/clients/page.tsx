'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  Globe,
  PlusCircle,
  ExternalLink,
  Edit3,
  Sliders,
  CheckCircle2,
  Clock,
  Layers,
  Palette
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function ClientsAndWebsitesPage() {
  const { clients, activeClient, setActiveClientId } = useStudioWorkspace();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold font-mono uppercase text-sky-400">Move Studio Platform</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Multi-Tenant Client Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Clients & Managed Websites
          </h1>
        </div>

        <Link
          href="/admin/create"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-md flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Client Website</span>
        </Link>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 gap-6">
        {clients.map((client) => {
          const isActive = client.id === activeClient?.id;
          return (
            <div
              key={client.id}
              className={`p-6 rounded-2xl border transition ${
                isActive
                  ? 'bg-[#0E1522] border-sky-500/80 ring-1 ring-sky-500/50 shadow-xl'
                  : 'bg-[#0D121B] border-[#1E293B] hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E293B]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#141C2A] border border-[#232F42] flex items-center justify-center font-bold text-sky-400 text-sm shadow-xs">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-white">{client.name}</h2>
                      {isActive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-medium">
                          Active Workspace
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono capitalize">
                      Sector: {client.industry.replace('_', ' ')} • Slug: <span className="text-slate-300">/{client.slug}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => setActiveClientId(client.id)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
                    >
                      Set Active
                    </button>
                  )}
                  <Link
                    href={`/admin/editor?siteSlug=${client.websites?.[0]?.slug || client.slug}`}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800 text-sky-300 hover:bg-sky-900 transition text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Visual Editor</span>
                  </Link>
                </div>
              </div>

              {/* Websites for this Client */}
              <div className="pt-4 space-y-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Websites & Environments ({client.websites?.length || 0})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {client.websites?.map((site) => (
                    <div
                      key={site.id}
                      className="p-4 rounded-xl bg-[#131A26] border border-[#232F42] flex items-center justify-between hover:bg-[#182130] transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-white">{site.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {site.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {site.blueprintId} • {site.designCollectionId}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link
                          href={client.id === 'client_goldfields' ? '/' : `/sites/${site.slug}`}
                          target="_blank"
                          title="Open live site"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E293B]"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
