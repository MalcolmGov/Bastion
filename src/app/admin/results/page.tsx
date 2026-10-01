'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResultsCodingChat } from '@/components/results/ResultsCodingChat';
import { applyFigureEdit } from '@/lib/results/applyFigureEdit';
import { renderResultsHtml } from '@/lib/results/renderHtml';
import type { ResultsBrand, ResultsDocument, StoredResultsDocument } from '@/lib/results/types';

const STEPS = ['Converter', 'Brand', 'PDF', 'Code and publish'];

export default function ResultsStudioPage() {
  const [documents, setDocuments] = useState<StoredResultsDocument[]>([]);
  const [current, setCurrent] = useState<StoredResultsDocument | null>(null);
  const [step, setStep] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brand, setBrand] = useState<ResultsBrand | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [htmlStale, setHtmlStale] = useState(false);

  async function refresh() {
    const response = await fetch('/api/admin/results');
    if (!response.ok) return;
    const body = await response.json();
    setDocuments(body.documents || []);
  }

  useEffect(() => {
    refresh().catch(() => setError('Could not load saved results.'));
  }, []);

  async function extractBrand() {
    setBusy('brand');
    setError(null);
    try {
      const response = await fetch('/api/admin/results/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not read that website');
      setBrand(body.brand);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that website');
    } finally {
      setBusy(null);
    }
  }

  async function convert(payload: { sample?: boolean; example?: string; file?: File }) {
    setBusy(payload.file ? 'upload' : payload.example || 'sample');
    setError(null);
    try {
      let response: Response;
      if (payload.file) {
        const form = new FormData();
        form.set('file', payload.file);
        if (brand) form.set('brand', JSON.stringify(brand));
        response = await fetch('/api/admin/results/convert', { method: 'POST', body: form });
      } else {
        response = await fetch('/api/admin/results/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sample: payload.sample || undefined,
            example: payload.example,
            brand,
          }),
        });
      }
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'PDF conversion failed');
      setCurrent(body);
      setHtmlStale(false);
      setStep(3);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF conversion failed');
    } finally {
      setBusy(null);
    }
  }

  function updateCell(statementId: string, rowId: string, cellIndex: number, value: string) {
    if (!current) return;
    const document = structuredClone(current.document);
    const statement = document.statements.find((item) => item.id === statementId);
    const row = statement?.rows.find((item) => item.id === rowId);
    if (!statement || !row) return;
    const previous = row.cells[cellIndex] ?? null;
    row.cells[cellIndex] = value;
    row.confidence = row.cells.every((cell) => cell && cell.trim()) ? 1 : 0.6;
    const placed = applyFigureEdit(document, statementId, rowId, cellIndex, previous);
    setCurrent({ ...current, document });
    setHtmlStale(true);
    setError(placed ? null : 'That row is not in the published tables, so this figure stays in the grid.');
  }

  function applyHtml(nextHtml: string) {
    setCurrent((existing) => existing ? {
      ...existing,
      document: { ...existing.document, presentationHtml: nextHtml },
    } : existing);
    setHtmlStale(false);
  }

  function rebuildHtml() {
    if (!current) return;
    applyHtml(renderResultsHtml(current.document));
  }

  async function save(status: 'draft' | 'published') {
    if (!current) return;
    setBusy(status);
    setError(null);
    try {
      const document: ResultsDocument = htmlStale
        ? { ...current.document, presentationHtml: renderResultsHtml(current.document) }
        : current.document;
      const response = await fetch(`/api/admin/results/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, status }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Save failed');
      setCurrent(body);
      setHtmlStale(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setBusy(null);
    }
  }

  function openExisting(item: StoredResultsDocument) {
    const document = item.document.presentationHtml
      ? item.document
      : { ...item.document, presentationHtml: renderResultsHtml(item.document) };
    setCurrent({ ...item, document });
    setBrand(item.document.brand || null);
    setHtmlStale(false);
    setStep(3);
  }

  const previewHtml = current?.document.presentationHtml || '';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">Bastion results centre</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">PDF to HTML</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Read the client’s website for brand, convert the results booklet, then use the coding assistant to edit the HTML before it is published.
        </p>
      </div>

      <ol className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => {
                if (index < 3 || current) setStep(index);
              }}
              className={`w-full rounded-2xl border px-3 py-3 text-left text-sm ${step === index ? 'border-violet-600 bg-violet-50 text-violet-950 dark:bg-violet-950/40 dark:text-violet-100' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider">Step {index + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      {step === 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Selected tool</p>
          <h2 className="mt-2 text-xl font-semibold">PDF to HTML converter</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Turns a financial results booklet into a branded HTML publication, with a live coding assistant for layout and copy.
          </p>
          <button type="button" onClick={() => setStep(1)} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Continue
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-xl font-semibold">Client website</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            The converter reads the public homepage for the logo, colours, and type. Those tokens are written into the HTML.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://client.com"
              className="min-w-[260px] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <button type="button" onClick={extractBrand} disabled={busy !== null || !websiteUrl.trim()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {busy === 'brand' ? 'Reading site…' : 'Extract brand'}
            </button>
          </div>
          {brand && (
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              {brand.logoUrl && <img src={brand.logoUrl} alt="" className="h-12 w-auto rounded bg-white p-1" />}
              <div>
                <p className="font-semibold">{brand.siteName}</p>
                <p className="text-xs text-slate-500">{brand.sourceUrl}</p>
              </div>
              <div className="flex gap-2">
                {[brand.primary, brand.accent, brand.ink, brand.paper].map((color) => (
                  <span key={color} title={color} className="h-8 w-8 rounded-full border border-black/10" style={{ background: color }} />
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => setStep(2)} disabled={!brand} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              Use this brand
            </button>
            <button type="button" onClick={() => { setBrand(null); setStep(2); }} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              Continue without a website
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-xl font-semibold">Upload the results PDF</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            {brand ? `The HTML will use ${brand.siteName} colours and logo.` : 'No brand was extracted, so the page uses the Bastion results theme.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              {busy === 'upload' ? 'Reading PDF…' : 'Upload PDF'}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={busy !== null}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void convert({ file });
                  event.target.value = '';
                }}
              />
            </label>
            <button type="button" disabled={busy !== null} onClick={() => convert({ example: 'merafe' })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              {busy === 'merafe' ? 'Converting…' : 'Merafe 2025 example'}
            </button>
            <button type="button" disabled={busy !== null} onClick={() => convert({ sample: true })} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
              {busy === 'sample' ? 'Converting…' : 'Sample booklet'}
            </button>
          </div>
        </section>
      )}

      {step === 3 && current && (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{current.document.issuer}</p>
                <p className="text-xs text-slate-500">{current.status === 'published' ? 'Published' : 'Draft'} · {current.document.periodLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => save('draft')} disabled={busy !== null} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">
                  Save draft
                </button>
                <button type="button" onClick={() => save('published')} disabled={busy !== null} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white">
                  {busy === 'published' ? 'Publishing…' : 'Publish HTML'}
                </button>
                {current.status === 'published' && (
                  <Link href={`/results/${current.slug}/document`} target="_blank" className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700">
                    Open live page
                  </Link>
                )}
              </div>
            </div>
            {htmlStale && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p>Figure edits are not in the HTML yet.</p>
                <button type="button" onClick={rebuildHtml} className="rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white">
                  Rebuild HTML from figures
                </button>
              </div>
            )}
            {current.document.warnings.length > 0 && (
              <ul className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                {current.document.warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            )}
            <iframe
              title="Results preview"
              srcDoc={previewHtml}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
              className="h-[820px] w-full rounded-3xl border border-slate-200 bg-white"
            />
            <details className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <summary className="cursor-pointer text-sm font-semibold">Check extracted figures</summary>
              <div className="mt-4 space-y-4">
                {current.document.statements.map((statement) => (
                  <div key={statement.id}>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{statement.title}</p>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-xs">
                        <tbody>
                          {statement.rows.filter((row) => row.kind !== 'section').map((row) => (
                            <tr key={row.id}>
                              <td className="max-w-[180px] truncate py-1 pr-2">{row.label}</td>
                              {row.cells.map((cell, cellIndex) => (
                                <td key={`${row.id}-${cellIndex}`} className="py-1 pl-1">
                                  <input
                                    value={cell || ''}
                                    onChange={(event) => updateCell(statement.id, row.id, cellIndex, event.target.value)}
                                    className="w-full rounded border border-slate-200 bg-slate-50 px-1.5 py-1 text-right font-mono text-[11px] dark:border-slate-700 dark:bg-slate-900"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
          <ResultsCodingChat
            html={previewHtml}
            documentId={current.id}
            onApplyHtml={applyHtml}
          />
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent conversions</h2>
        <ul className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {documents.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No booklets converted yet.</li>}
          {documents.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <button type="button" onClick={() => openExisting(item)} className="truncate text-left font-medium">
                {item.title}
              </button>
              <span className="shrink-0 text-xs uppercase tracking-wide text-slate-500">{item.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
