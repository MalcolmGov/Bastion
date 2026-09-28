'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, ChevronRight, Eye, Edit3, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';

interface RecordItem {
  id: string;
  collection: string;
  slug: string;
  title: string;
  status: string;
  owner_name?: string;
  created_at: string;
  updated_at: string;
}

interface DataTableProps {
  title: string;
  collection: string;
  description: string;
  records: RecordItem[];
  createUrl?: string;
  onRefresh?: () => void;
}

export function DataTable({
  title,
  collection,
  description,
  records,
  createUrl,
  onRefresh
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = records.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Published</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>In Review</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/80 text-blue-300 border border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Approved</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-950/80 text-purple-300 border border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Scheduled</span>
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-red-950/80 text-red-300 border border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Changes Req.</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#162337] text-[#C99700] border border-[#243754]">
              {records.length} Records
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>

        {createUrl && (
          <Link
            href={createUrl}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold text-xs transition shadow-md shadow-[#C99700]/20 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </Link>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${collection}...`}
            className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700] transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'published', 'in_review', 'approved', 'draft', 'scheduled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${
                statusFilter === st
                  ? 'bg-[#C99700]/20 text-[#E6C657] border border-[#C99700]/40 font-semibold'
                  : 'bg-[#0E1522] text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0E1522] text-gray-400 border-b border-[#1C2638] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Title &amp; Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Author / Owner</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162030]">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#0E1624] transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-[#E6C657] transition">
                        {r.title}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                        /{r.collection}/{r.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {r.owner_name || 'Sarah Jenkins'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                      {new Date(r.updated_at).toLocaleDateString()}{' '}
                      <span className="text-gray-600">
                        {new Date(r.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/${collection}/${r.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-[#141F30] hover:bg-[#1D2C44] border border-[#22334D] text-gray-200 hover:text-white transition flex items-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3 text-[#C99700]" />
                          <span>Edit</span>
                        </Link>
                        {collection === 'pages' ? (
                          <Link
                            href={r.slug === 'home' ? '/' : `/${r.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1A2536] transition"
                            title="Preview Public Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/${collection}/${r.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1A2536] transition"
                            title="Preview Public Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <span>No records matching criteria.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
