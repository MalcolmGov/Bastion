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
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Published</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>In Review</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Approved</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Scheduled</span>
          </span>
        );
      case 'changes_requested':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Changes Req.</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <span>{title}</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-slate-800 text-bastion-blue dark:text-sky-300 border border-blue-200 dark:border-slate-700 font-semibold">
              {records.length} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>

        {createUrl && (
          <Link
            href={createUrl}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-bastion hover:bg-bastion-navy dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-950 font-semibold text-xs transition shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New</span>
          </Link>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between transition-colors">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${collection}...`}
            className="w-full bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-bastion-blue transition"
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
                  ? 'bg-bastion text-white dark:bg-slate-800 dark:text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-[#0A0D14] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Title &amp; Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Author / Owner</th>
                <th className="py-3 px-4">Last Modified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-[#151D2E] transition group">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-bastion-blue dark:group-hover:text-sky-400 transition">
                        {r.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        /{r.collection}/{r.slug}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {r.owner_name || 'Malcolm Govender'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(r.updated_at).toLocaleDateString()}{' '}
                      <span className="text-slate-400 dark:text-slate-600">
                        {new Date(r.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/admin/${collection}/${r.id}`}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition flex items-center space-x-1 font-medium shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3 text-amber-500" />
                          <span>Edit</span>
                        </Link>
                        {collection === 'pages' ? (
                          <Link
                            href={r.slug === 'home' ? '/' : `/${r.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Preview Public Page"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/${collection}/${r.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
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
