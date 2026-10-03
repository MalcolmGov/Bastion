'use client';

import Link from 'next/link';
import {
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  MoreHorizontal,
  Undo2,
  Redo2,
  Eye,
  PanelLeft,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';

export function EditorToolbar({
  siteName,
  siteId,
  sites,
  page,
  pages,
  busy,
  dirty,
  savedTime,
  loading,
  isNew,
  advancedTools,
  canEdit,
  canPublish,
  viewport,
  preview,
  leftOpen,
  rightOpen,
  canUndo,
  canRedo,
  onSite,
  onPage,
  onSave,
  onPublish,
  onViewport,
  onPreview,
  onLeft,
  onRight,
  onUndo,
  onRedo,
  onMore,
}: {
  siteName: string;
  siteId: string;
  sites: { id: string; name: string }[];
  page: string;
  pages: string[];
  busy: boolean;
  dirty: boolean;
  savedTime: string | null;
  loading: boolean;
  isNew: boolean;
  advancedTools: boolean;
  canEdit: boolean;
  canPublish: boolean;
  viewport: 'desktop' | 'tablet' | 'mobile';
  preview: boolean;
  leftOpen: boolean;
  rightOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onSite: (id: string) => void;
  onPage: (slug: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  onPreview: () => void;
  onLeft: () => void;
  onRight: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onMore: (action: string) => void;
}) {
  const button =
    'rounded-lg px-3 py-2 text-xs font-medium transition disabled:opacity-40';
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Link
            href="/admin"
            aria-label="Back to workspace"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold">Page editor</h1>
            <select
              aria-label="Website"
              value={siteId}
              disabled={busy || loading}
              onChange={(event) => onSite(event.target.value)}
              className="max-w-56 bg-transparent text-xs text-slate-500"
            >
              {sites.some((site) => site.id === siteId) ? (
                sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))
              ) : (
                <option value={siteId}>{siteName}</option>
              )}
            </select>
          </div>
          <span className="hidden h-7 border-l border-slate-200 sm:block" />
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Page
            <select
              aria-label="Page"
              value={page}
              disabled={busy || loading}
              onChange={(event) => onPage(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 capitalize text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              {pages.map((slug) => (
                <option key={slug} value={slug}>
                  {slug.replaceAll('-', ' ')}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => onMore('ai')}
              className={`${button} flex items-center gap-2 border border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI assistant
            </button>
          )}
          <span role="status" className="mr-2 text-xs text-slate-500">
            {loading
              ? 'Loading page…'
              : busy
                ? 'Saving…'
                : dirty
                  ? 'Unsaved changes'
                  : isNew
                    ? 'New page · Not saved yet'
                    : savedTime
                      ? `Saved at ${savedTime}`
                      : 'All changes saved'}
          </span>
          <button
            type="button"
            disabled={loading}
            aria-pressed={preview}
            onClick={onPreview}
            className={`${button} hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            {preview ? 'Back to editing' : 'Preview'}
          </button>
          <button
            type="button"
            disabled={!canEdit || busy || loading || (!dirty && !isNew)}
            onClick={onSave}
            className={`${button} bg-blue-600 text-white hover:bg-blue-700`}
          >
            Save draft
          </button>
          {canPublish && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={onPublish}
              className={`${button} border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900`}
            >
              Publish…
            </button>
          )}
          {canEdit && advancedTools && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => onMore('ingest')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-amber-600/15 hover:from-amber-500/20 hover:to-amber-600/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition shadow-xs"
              title="Bastion Agency Ingestion Suite"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Ingest Report</span>
            </button>
          )}
          {canEdit && (
            <button
              type="button"
              disabled={busy || loading}
              onClick={() => onMore('compliance')}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-500/10 to-teal-500/15 hover:from-emerald-500/20 hover:to-teal-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition shadow-xs"
              title="Real-Time JSE Regulatory & ESG Compliance Guardian"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden sm:inline">Compliance</span>
            </button>
          )}
          <details className="relative">
            <summary
              aria-label="More editor tools"
              className="list-none cursor-pointer rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreHorizontal className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {[
                { id: 'compliance', label: '🛡️ JSE & ESG Compliance Guardian' },
                { id: 'ingest', label: '📄 Ingest Annual Report / PDF (Bastion)' },
                { id: 'history', label: 'Version history' },
                { id: 'release', label: 'Add to a release' },
                { id: 'ai', label: 'AI writing assistant' },
                { id: 'keys', label: 'AI settings' },
                { id: 'saved', label: 'Saved brand sections' },
                { id: 'advanced', label: 'Advanced section tools' },
                { id: 'qr', label: 'Share preview link' },
                { id: 'theme', label: 'Change canvas theme' },
              ]
                .filter(
                  (action) =>
                    (canEdit ||
                      ['history', 'qr', 'theme'].includes(action.id)) &&
                    (advancedTools ||
                      !['keys', 'advanced', 'ingest'].includes(action.id)),
                )
                .map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={busy || loading}
                    onClick={(event) => {
                      event.currentTarget
                        .closest('details')
                        ?.removeAttribute('open');
                      onMore(action.id);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    {action.label}
                  </button>
                ))}
            </div>
          </details>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-2 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={leftOpen}
            onClick={onLeft}
            className={`${button} flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            <PanelLeft className="h-4 w-4" />
            Sections
          </button>
          <p className="hidden text-xs text-slate-400 lg:block">
            {preview
              ? 'Check your page on different screens.'
              : 'Choose a section, then edit its content on the right.'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'desktop', Icon: Monitor },
              { id: 'tablet', Icon: Tablet },
              { id: 'mobile', Icon: Smartphone },
            ] as const
          ).map(({ id, Icon }) => (
            <button
              type="button"
              key={id}
              aria-label={`${id} viewport`}
              aria-pressed={viewport === id}
              onClick={() => onViewport(id)}
              className={`rounded-lg p-2 ${viewport === id ? 'bg-blue-50 text-blue-600 dark:bg-blue-950' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          <span className="mx-2 h-4 border-l border-slate-200" />
          <button
            type="button"
            aria-label="Undo"
            disabled={!canUndo || loading || busy}
            onClick={onUndo}
            className="rounded-lg p-2 text-slate-500 disabled:opacity-30"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Redo"
            disabled={!canRedo || loading || busy}
            onClick={onRedo}
            className="rounded-lg p-2 text-slate-500 disabled:opacity-30"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-pressed={rightOpen}
            onClick={onRight}
            className={`${button} ml-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Edit section
          </button>
        </div>
      </div>
    </div>
  );
}
