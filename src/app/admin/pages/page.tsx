'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  Layers,
  Pencil,
  Eye,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  ArrowRight,
  ArrowUpRight,
  FileText,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace, WorkspaceSite } from '@/components/admin/StudioWorkspaceProvider';

interface PageCompositionItem {
  id: string;
  siteId: string;
  pageSlug: string;
  title: string;
  sections?: any[];
  version: number;
  status: string;
  updatedAt?: string;
}

export default function AdminPagesPage() {
  const { user, hasPerm } = useAdminAuth();
  const {
    activeClient,
    activeSite,
    clientWebsites,
    setActiveSiteId
  } = useStudioWorkspace();

  const [pages, setPages] = useState<PageCompositionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Resolve current website
  const currentSite: WorkspaceSite | undefined = activeSite || clientWebsites[0];
  const siteId = currentSite?.id;
  const siteSlug = currentSite?.slug || '';

  const loadPages = React.useCallback(async () => {
    if (!siteId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/editor?siteId=${encodeURIComponent(siteId)}`);
      if (!res.ok) {
        throw new Error('Failed to load website pages');
      }
      const data = await res.json();
      setPages(data.compositions || []);
    } catch (err: any) {
      console.error('Failed to load pages:', err);
      setError(err.message || 'Unable to load pages for this website');
    } finally {
      setLoading(false);
    }
  }, [siteId]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.pageSlug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && page.status === 'published') ||
        (statusFilter === 'draft' && page.status !== 'published');
      return matchesSearch && matchesStatus;
    });
  }, [pages, searchTerm, statusFilter]);

  const publishedCount = useMemo(() => {
    return pages.filter((p) => p.status === 'published').length;
  }, [pages]);

  const draftCount = useMemo(() => {
    return pages.filter((p) => p.status !== 'published').length;
  }, [pages]);

  const getPageUrl = (pageSlug: string) => {
    if (siteSlug === 'goldfields') {
      return pageSlug === 'home' ? '/' : `/${pageSlug}`;
    }
    return pageSlug === 'home'
      ? `/sites/${encodeURIComponent(siteSlug)}`
      : `/sites/${encodeURIComponent(siteSlug)}/${encodeURIComponent(pageSlug)}`;
  };

  const getEditorHref = (pageSlug?: string, panel?: string) => {
    const params = new URLSearchParams();
    if (siteId) params.set('siteId', siteId);
    if (pageSlug) params.set('pageSlug', pageSlug);
    if (panel) params.set('panel', panel);
    return `/admin/editor?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 pb-16 text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      {/* ─── 1. HEADER & ACTIONS ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {activeClient?.name || 'Corporate'} / Content Maintenance
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Pages &amp; Navigation
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-2xl">
            Maintain your website structure, landing pages, and visual content. Edits are saved as drafts and publish only through your approved release workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPerm('content:edit') && currentSite && (
            <>
              <Link
                href={getEditorHref(undefined, 'ai')}
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 px-4 py-2.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
              >
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Ask Website Assistant</span>
              </Link>
              <Link
                href={getEditorHref()}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
              >
                <Pencil className="h-4 w-4" />
                <span>Open Visual Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ─── 2. MULTI-SITE SELECTOR (IF MULTIPLE WEB PROPERTIES) ─── */}
      {clientWebsites.length > 1 && (
        <section aria-labelledby="pages-site-selector" className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span id="pages-site-selector" className="font-semibold text-slate-700 dark:text-slate-300">
              Active Web Property:
            </span>
            <span>Switch to view pages for another website</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {clientWebsites.map((site) => {
              const isSelected = site.id === currentSite?.id;
              return (
                <button
                  type="button"
                  key={site.id}
                  onClick={() => setActiveSiteId(site.id)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-200 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-[#0F141C] dark:text-slate-400'
                  }`}
                >
                  <Globe className={`h-3.5 w-3.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{site.name}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── 3. WORKSPACE METRICS SUMMARY ─── */}
      <section
        aria-label="Pages overview summary"
        className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F141C]"
      >
        <div className="flex items-center gap-4 p-5 lg:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <Layers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total website pages</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{pages.length}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Configured in {currentSite?.name || 'this website'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 lg:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Published live pages</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{publishedCount}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Currently serving on public domains</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 lg:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pages with draft edits</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{draftCount}</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">Awaiting inclusion in a release</p>
          </div>
        </div>
      </section>

      {/* ─── 4. SEARCH, FILTER & VIEW CONTROLS ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages by title or slug..."
            aria-label="Filter pages"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-[#0A0D14] dark:text-white dark:focus:bg-[#0D1522] transition"
          />
        </div>

        {/* Filters and View Mode */}
        <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50/70 dark:bg-[#0A0D14]">
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? `All (${pages.length})` : tab === 'published' ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
              </button>
            ))}
          </div>

          <div className="flex rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-slate-50/70 dark:bg-[#0A0D14]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Cards view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={`rounded-lg p-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. PAGES PRESENTATION ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] rounded-2xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-[#0F141C]">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Loading website pages...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          <button
            type="button"
            onClick={loadPages}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#0F141C] space-y-3">
          <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {searchTerm || statusFilter !== 'all' ? 'No matching pages found' : 'No pages configured for this website'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to find what you are looking for.'
              : 'Launch the Visual Editor to create your homepage and add your corporate sections.'}
          </p>
          {hasPerm('content:edit') && currentSite && (
            <Link
              href={getEditorHref()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Pencil className="h-4 w-4" />
              <span>Open Visual Editor</span>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => {
            const isPublished = page.status === 'published';
            const sectionsCount = page.sections?.length || 0;
            const previewUrl = getPageUrl(page.pageSlug);
            const editorUrl = getEditorHref(page.pageSlug);
            const aiUrl = getEditorHref(page.pageSlug, 'ai');

            return (
              <div
                key={page.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-[#0F141C] dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                        isPublished
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{isPublished ? 'Published live' : 'Draft edits pending'}</span>
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      v{page.version}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold tracking-tight text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition">
                    {page.title}
                  </h3>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    /{page.pageSlug === 'home' ? '' : page.pageSlug}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <span>{sectionsCount} visual section{sectionsCount === 1 ? '' : 's'}</span>
                    <span>&bull;</span>
                    <span>
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : 'Active draft'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <div className="flex items-center gap-2">
                    {hasPerm('content:edit') && (
                      <Link
                        href={editorUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                    )}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      title="Preview page in new tab"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </a>
                  </div>

                  {hasPerm('content:edit') && (
                    <Link
                      href={aiUrl}
                      className="inline-flex items-center gap-1 rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60 transition"
                      title="Ask AI assistant to polish this page"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#0F141C]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-[#0A0D14] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Page Title &amp; Slug</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Version</th>
                  <th className="px-5 py-3.5">Sections</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredPages.map((page) => {
                  const isPublished = page.status === 'published';
                  const previewUrl = getPageUrl(page.pageSlug);
                  const editorUrl = getEditorHref(page.pageSlug);

                  return (
                    <tr key={page.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {page.title}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          /{page.pageSlug === 'home' ? '' : page.pageSlug}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium border ${
                            isPublished
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{isPublished ? 'Published' : 'Draft'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-500">
                        v{page.version}
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {page.sections?.length || 0} sections
                      </td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                        {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasPerm('content:edit') && (
                            <Link
                              href={editorUrl}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </Link>
                          )}
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            title="Preview in new tab"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 6. WORKFLOW SAFEGUARD GUIDANCE CARD ─── */}
      <section className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-[#0F141C]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Publishing Safeguards &amp; Draft Isolation
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            All updates created in the Visual Editor are saved as isolated drafts. Your live websites remain completely unaffected until your changes are reviewed, approved according to your corporate governance rules, and published in an authorized release.
          </p>
        </div>
      </section>
    </div>
  );
}
