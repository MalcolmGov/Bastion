'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { ResultsHistory } from '@/components/results/ResultsHistory';
import { ResultsCodingChat } from '@/components/results/ResultsCodingChat';
import { InteractiveResultsViewer } from '@/components/results/InteractiveResultsViewer';
import { validateFinancials } from '@/lib/results/validateFinancials';
import { applyFigureEdit } from '@/lib/results/applyFigureEdit';
import { renderResultsHtml } from '@/lib/results/renderHtml';
import type { ResultsBrand, ResultsDocument, StoredResultsDocument, ResultsDocumentSummary } from '@/lib/results/types';

import { isAgencyUser } from '@/lib/auth/roles';

const STEPS = ['Converter', 'Brand', 'PDF', 'Review and publish'];

export default function ResultsStudioPage() {
  const { activeClient } = useStudioWorkspace();
  const { hasPerm, user } = useAdminAuth();
  const agency = isAgencyUser(user);
  const canEdit = hasPerm('content:edit');
  const [documents, setDocuments] = useState<ResultsDocumentSummary[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const workspaceEpoch = useRef(0);
  const [current, setCurrent] = useState<StoredResultsDocument | null>(null);
  const [step, setStep] = useState(0);
  const userId=user?.id;
  useEffect(()=>{if(userId)setStep(agency?0:3);},[agency,userId]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [brand, setBrand] = useState<ResultsBrand | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [htmlStale, setHtmlStale] = useState(false);
  const [validationReviewed, setValidationReviewed] = useState(false);
  const [sourceReviewed, setSourceReviewed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishReady, setPublishReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [comparisonPage, setComparisonPage] = useState(1);
  const [previewMode, setPreviewMode] = useState<'analytics' | 'document' | 'compare'>('document');

  const refreshSequence = useRef(0);
  const refresh = useCallback(async (offset = 0) => {
    const sequence = ++refreshSequence.current;
    const params = new URLSearchParams({ offset: String(offset) });
    if (activeClient?.id) params.set('clientId', activeClient.id);
    const url = '/api/admin/results?' + params;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Could not load saved results.');
    const body = await response.json();
    if (sequence === refreshSequence.current) {
      setDocuments(existing => offset ? [...existing, ...(body.documents || [])].filter((item, index, all) => all.findIndex(other => other.id === item.id) === index) : body.documents || []);
      setNextOffset(body.nextOffset ?? null);
    }
  }, [activeClient?.id]);

  useEffect(() => {
    workspaceEpoch.current += 1;
    setBusy(null);
    setCurrent(null);
    setDirty(false);
    setPublishReady(false);
    setSourceReviewed(false);
    setValidationReviewed(false);
    setBrand(null);
    setWebsiteUrl('');
    setShowAssistant(false);
    setNotice(null);
    setHtmlStale(false);
    setDocuments([]);
    refresh().catch(() => setError('Could not load saved results.'));
    return () => { refreshSequence.current += 1; };
  }, [refresh]);

  async function extractBrand() {
    const epoch = workspaceEpoch.current;
    setBusy('brand');
    setError(null);
    try {
      const response = await fetch('/api/admin/results/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
        signal: AbortSignal.timeout(25_000),
      });
      const body = await response.json();
      if (epoch !== workspaceEpoch.current) return;
      if (!response.ok) throw new Error(body.error || 'Could not read that website');
      setBrand(body.brand);
    } catch (err) {
      if (epoch !== workspaceEpoch.current) return;
      const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
      setError(timedOut ? 'That website took too long to read. Try again, or continue without it.' : (err instanceof Error ? err.message : 'Could not read that website'));
    } finally {
      if (epoch === workspaceEpoch.current) setBusy(null);
    }
  }

  async function convert(payload: { sample?: boolean; example?: string; file?: File }) {
    const epoch = workspaceEpoch.current;
    setBusy(payload.file ? 'upload' : payload.example || 'sample');
    setError(null);
    try {
      let response: Response;
      if (payload.file) {
        const form = new FormData();
        form.set('file', payload.file);
        if (activeClient?.id) form.set('clientId', activeClient.id);
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
            clientId: activeClient?.id,
          }),
        });
      }
      const body = await response.json();
      if (epoch !== workspaceEpoch.current) return;
      if (!response.ok) throw new Error(body.error || 'PDF conversion failed');
      setCurrent(body);
      setDirty(false);
      setPublishReady(false);
      setSourceReviewed(false);
    setValidationReviewed(false);
      setNotice(null);
      setHtmlStale(false);
      setStep(3);
      await refresh();
    } catch (err) {
      if (epoch !== workspaceEpoch.current) return;
      setError(err instanceof Error ? err.message : 'PDF conversion failed');
    } finally {
      if (epoch === workspaceEpoch.current) setBusy(null);
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
    row.confidence = row.cells.every((cell, index) => row.sourceBlankCells?.includes(index) || (cell && cell.trim())) ? 1 : 0.6;
    const placed = applyFigureEdit(document, statementId, rowId, cellIndex, previous);
    setSourceReviewed(false);
    setValidationReviewed(false);
    setNotice(null);
    setDirty(true);
    setCurrent({ ...current, document });
    setHtmlStale(true);
    setError(placed ? null : 'That row is not in the published tables, so this figure stays in the grid.');
  }

  function applyHtml(nextHtml: string) {
    setDirty(true);
    setSourceReviewed(false);
    setValidationReviewed(false);
    setNotice(null);
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
    const epoch = workspaceEpoch.current;
    setBusy(status);
    setError(null);
    try {
      const document: ResultsDocument = htmlStale
        ? { ...current.document, presentationHtml: renderResultsHtml(current.document) }
        : current.document;
      const response = await fetch(`/api/admin/results/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, status, expectedUpdatedAt: current.updatedAt, sourceReviewed, validationReviewed }),
      });
      const body = await response.json();
      if (epoch !== workspaceEpoch.current) return;
      if (!response.ok) throw new Error(body.error || 'Save failed');
      setCurrent(body);
      setDirty(false);
      setPublishReady(false);
      setHtmlStale(false);
      setNotice(status === 'published' ? 'Publication saved and published.' : 'Draft saved.');
      await refresh();
    } catch (err) {
      if (epoch !== workspaceEpoch.current) return;
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      if (epoch === workspaceEpoch.current) setBusy(null);
    }
  }

  async function openExisting(item: ResultsDocumentSummary) {
    if (busy) return;
    const epoch = workspaceEpoch.current;
    setBusy('open');
    setError(null);
    try {
      const response = await fetch(`/api/admin/results/${encodeURIComponent(item.id)}`, { signal: AbortSignal.timeout(30_000) });
      const saved = await response.json() as StoredResultsDocument & { error?: string };
      if (!response.ok) throw new Error(saved.error || 'Could not open the publication.');
      if (epoch !== workspaceEpoch.current) return;
      setSourceReviewed(false);
    setValidationReviewed(false);
      setNotice(null);
      const document = saved.document.presentationHtml ? saved.document : { ...saved.document, presentationHtml: renderResultsHtml(saved.document) };
      setComparisonPage(1);
      setCurrent({ ...saved, document });
      setDirty(false);
      setPublishReady(false);
      setBrand(document.brand || null);
      setHtmlStale(false);
      setStep(3);
    } catch (err) {
      if (epoch === workspaceEpoch.current) setError(err instanceof Error ? err.message : 'Could not open the publication.');
    } finally { if (epoch === workspaceEpoch.current) setBusy(null); }
  }

  const validation = useMemo(() => current ? validateFinancials(current.document) : null, [current]);
  const previewHtml = current?.document.presentationHtml || '';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700">Bastion results centre</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{agency ? 'PDF to HTML' : 'Financial publications'}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          {agency ? 'Convert source reports into branded drafts, compare the source, and submit reviewed reports for publication.' : 'Open a delivered report below to review its source, request updates, and approve a saved version.'}
        </p>
      </div>

      {agency && <ol className="grid gap-2 sm:grid-cols-4">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => {
                if (agency && (index < 3 || current)) setStep(index);
              }}
              className={`w-full rounded-2xl border px-3 py-3 text-left text-sm ${step === index ? 'border-violet-600 bg-violet-50 text-violet-950 dark:bg-violet-950/40 dark:text-violet-100' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'}`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wider">Step {index + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>}

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      {agency && step === 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Selected tool</p>
          <h2 className="mt-2 text-xl font-semibold">PDF to HTML converter</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Turns a financial results booklet into a branded HTML publication, with source comparison and an assistant for typography and layout.
          </p>
          <button type="button" onClick={() => setStep(1)} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Continue
          </button>
        </section>
      )}

      {agency && step === 1 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-xl font-semibold">Client website</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Extract a starting point from the client’s website, then confirm the colours and typography before converting. Website extraction is a suggestion, not an approved brand guide.
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
          {!brand && <button type="button" onClick={() => setBrand({ sourceUrl: websiteUrl, siteName: activeClient?.name || 'Client', logoUrl: null, colors: [], primary: '#142033', accent: '#b59156', ink: '#142033', paper: '#f6f5f1', headingFont: 'Georgia', bodyFont: 'Source Sans 3' })} className="mt-4 text-sm font-semibold text-violet-700">Set brand manually</button>}
          {brand && (
            <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              {brand.logoUrl && <img src={brand.logoUrl} alt="" className="h-12 w-auto rounded bg-white p-1" />}
              <div>
                <p className="font-semibold">{brand.siteName}</p>
                <p className="text-xs text-slate-500">{brand.sourceUrl}</p>
              </div>
              <div className="grid w-full gap-4 sm:grid-cols-4">
                {(['primary', 'accent', 'ink', 'paper'] as const).map((key) => (
                  <label key={key} className="text-xs font-medium capitalize">{key === 'ink' ? 'Text' : key === 'paper' ? 'Background' : key}
                    <input type="color" aria-label={`${key} colour`} value={brand[key]} onChange={(event) => setBrand({ ...brand, [key]: event.target.value })} className="mt-2 block h-10 w-full cursor-pointer rounded border border-slate-200" />
                    <span className="mt-1 block font-mono text-slate-500">{brand[key]}</span>
                  </label>
                ))}
                {(['headingFont', 'bodyFont'] as const).map((key) => (
                  <label key={key} className="text-xs font-medium sm:col-span-2">{key === 'headingFont' ? 'Heading font' : 'Body font'}
                    <input value={brand[key]} onChange={(event) => setBrand({ ...brand, [key]: event.target.value })} className="mt-2 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2" />
                  </label>
                ))}
                <label className="text-xs font-medium sm:col-span-4">Logo URL (HTTPS)
                  <input value={brand.logoUrl?.startsWith('data:') ? '' : brand.logoUrl || ''} placeholder={brand.logoUrl?.startsWith('data:') ? 'Embedded website logo; enter a URL to replace' : 'https://client.com/logo.svg'} onChange={(event) => setBrand({ ...brand, logoUrl: event.target.value || null })} className="mt-2 block w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2" />
                </label>
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

      {agency && step === 2 && (
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
        <fieldset disabled={busy !== null} className={`grid min-w-0 items-start gap-4 ${showAssistant ? 'xl:grid-cols-[minmax(0,1fr)_380px]' : ''}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{current.document.issuer}</p>
                <p className="text-xs text-slate-500">{current.status === 'published' ? 'Published' : 'Draft'} · {current.document.periodLabel}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('analytics')}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      previewMode === 'analytics'
                        ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Interactive Analytics
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('document')}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      previewMode === 'document'
                        ? 'bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Publication HTML
                  </button>
                </div>
                <button type="button" onClick={() => setPreviewMode('compare')} className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700">Compare with PDF</button>
                <button type="button" onClick={() => setShowAssistant(!showAssistant)} disabled={!canEdit} aria-expanded={showAssistant} className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700">{showAssistant ? 'Close assistant' : 'Polish with AI'}</button>
                <button type="button" onClick={() => save('draft')} disabled={busy !== null || !canEdit} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">
                  {busy === 'draft' ? 'Saving…' : 'Save draft'}
                </button>
                <button type="button" onClick={() => save('published')} disabled={busy !== null || !publishReady || dirty || !sourceReviewed || htmlStale || Boolean(validation?.issues.length && !validationReviewed)} className="rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {busy === 'published' ? 'Publishing…' : 'Publish HTML'}
                </button>
                {current.publishedAt && (
                  <Link href={`/results/${current.slug}`} target="_blank" className="rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50">
                    Open live page
                  </Link>
                )}
              </div>
            </div>
            {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p>}
            {validation && <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold text-slate-900">Financial validation</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{validation.issues.length} {validation.issues.length === 1 ? 'item' : 'items'} to review</span></div>
              <p className="mt-2 text-xs leading-5 text-slate-500">{validation.totalsChecked} subtotal calculations checked · {validation.totalsSkipped} totals require manual review. Checks cover recognised breakdowns, missing cells, periods and units. They cannot detect every omitted PDF row or certify the report.</p>
              {validation.issues.length ? <ul className="mt-4 space-y-3">{validation.issues.map(issue => <li key={issue.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3"><p className="text-sm font-semibold text-amber-950">{issue.title}{issue.sourcePage ? ` · PDF page ${issue.sourcePage}` : ''}</p><p className="mt-1 text-xs leading-5 text-amber-900">{issue.detail}</p>{issue.sourcePage && current.document.sourcePages?.some(page => page.page === issue.sourcePage) && <button type="button" onClick={() => { setComparisonPage(issue.sourcePage!); setPreviewMode('compare'); }} className="mt-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950">Compare PDF page {issue.sourcePage}</button>}</li>)}</ul> : <p className="mt-3 text-sm text-emerald-700">No issues found by these checks. Complete the source comparison before publishing.</p>}
              {validation.issues.length > 0 && <label className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-600"><input type="checkbox" checked={validationReviewed} onChange={event => setValidationReviewed(event.target.checked)} className="mt-1" />I have reviewed these validation items against the PDF and confirmed any source discrepancies with the responsible reviewer.</label>}
            </section>}
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <input type="checkbox" checked={sourceReviewed} onChange={event => setSourceReviewed(event.target.checked)} disabled={htmlStale} className="mt-1" />
              I have checked the complete publication against the original PDF, including figures, units, restatements, notes and extraction warnings.
            </label>
            <ResultsHistory key={`${activeClient?.id}:${current.id}`} current={current} dirty={dirty || htmlStale} sourceReviewed={sourceReviewed} validationReviewed={validationReviewed} hasIssues={Boolean(validation?.issues.length)} onPublishReady={setPublishReady} onRestore={saved => { setCurrent(saved); setDirty(false); setHtmlStale(false); setSourceReviewed(false); setValidationReviewed(false); setPublishReady(false); setNotice('Earlier version restored as a new draft. Your live page is unchanged.'); refresh().catch(() => setError('Could not refresh saved reports.')); }} />
            <details open={current.document.warnings.length > 0} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <summary className="cursor-pointer font-semibold">Source review · {current.document.warnings.length ? `${current.document.warnings.length} extraction warnings` : 'Compare figures before publishing'}</summary>
              <p className="mt-2">Check periods, units, totals, restatements, footnotes and charts against the original PDF. Source visuals preserve the artwork; they are not editable charts.</p>
              {current.document.warnings.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{current.document.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
            </details>
            {htmlStale && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <p>Figure edits are not in the HTML yet.</p>
                <button type="button" onClick={rebuildHtml} className="rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white">
                  Rebuild HTML from figures
                </button>
              </div>
            )}
            {previewMode === 'compare' ? <SourceComparison key={current.id} document={current.document} html={previewHtml} selectedPage={comparisonPage} onPageChange={setComparisonPage} /> : previewMode === 'analytics' ? (
              <div className="max-h-[850px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <InteractiveResultsViewer
                  document={current.document}
                  slug={current.slug}
                  published={current.status === 'published'}
                />
              </div>
            ) : (
              <iframe
                title="Results preview"
                srcDoc={previewHtml}
                sandbox="allow-popups allow-popups-to-escape-sandbox"
                className="h-[820px] w-full rounded-3xl border border-slate-200 bg-white"
              />
            )}
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
                                    readOnly={!canEdit}
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
          {showAssistant && <ResultsCodingChat
            key={current.id}
            html={previewHtml}
            documentId={current.id}
            onApplyHtml={applyHtml}
          />}
        </fieldset>
      )}

      <section>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Recent conversions</h2>
        <ul className="mt-3 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950">
          {documents.length === 0 && <li className="px-4 py-3 text-sm text-slate-500">No booklets converted yet.</li>}
          {documents.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <button type="button" disabled={busy !== null} onClick={() => openExisting(item)} className="truncate text-left font-medium">
                {item.title}
              </button>
              <span className="shrink-0 text-xs uppercase tracking-wide text-slate-500">{item.status}</span>
            </li>
          ))}
        </ul>
        {busy === 'open' && <p role="status" className="mt-3 text-sm text-slate-500">Opening publication…</p>}
        {nextOffset !== null && <button disabled={busy !== null} onClick={async () => { setBusy('list'); try { await refresh(nextOffset); } catch { setError('Could not load more publications.'); } finally { setBusy(null); } }} className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold">Load more publications</button>}
      </section>
    </div>
  );
}


function SourceComparison({ document, html, selectedPage, onPageChange }: { document: ResultsDocument; html: string; selectedPage: number; onPageChange: (page: number) => void }) {
  const pages = document.sourcePages || [];
  const index = Math.max(0, pages.findIndex(page => page.page === selectedPage));
  const [transcript, setTranscript] = useState('');
  const page = pages[index];
  useEffect(() => {
    if (!page) return;
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const references = Array.from(parsed.querySelectorAll('.source-reference'));
    const start = references.find(anchor => anchor.getAttribute('href') === `#source-page-${page.page}`);
    const wrapper = parsed.createElement('main');
    wrapper.id = 'results-layout';
    if (start) {
      let sibling = start.nextElementSibling;
      while (sibling && !sibling.matches('.source-reference, #results-source-visuals')) {
        wrapper.append(sibling.cloneNode(true));
        sibling = sibling.nextElementSibling;
      }
    } else {
      const message = parsed.createElement('p');
      message.textContent = 'This page has no separate HTML transcription. Cover artwork and front matter remain in the original source visuals. Check the full publication for any content that needs to be added.';
      wrapper.append(message);
    }
    parsed.body.replaceChildren(wrapper);
    // A compact review density fits all comparative columns beside the source page.
    const reviewStyle = parsed.createElement('style');
    reviewStyle.textContent = 'main { width: calc(100% - 24px); margin: 16px auto; } #results-layout h2 { font-size: 22px; line-height: 1.3; } #results-layout p { font-size: 13px; line-height: 1.6; } table { min-width: 0; width: 100%; font-size: 11px; } th, td { padding: 8px 5px; } thead th { font-size: 9px; letter-spacing: 0; } tbody th { font-size: 10px; overflow-wrap: anywhere; } .statement { margin: 18px 0; }';
    parsed.head.append(reviewStyle);
    setTranscript('<!DOCTYPE html>' + parsed.documentElement.outerHTML);
  }, [html, page]);
  if (!page) return <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">No original page images are available in this older draft. Convert the PDF again to enable source comparison.</p>;
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
      <div><h2 className="font-semibold text-slate-900">Source comparison</h2><p className="mt-1 text-xs text-slate-500">Check the original beside the actual publication transcription.</p></div>
      <div className="flex items-center gap-3">
        <button disabled={index === 0} onClick={() => onPageChange(pages[index - 1].page)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40">Previous</button>
        <select aria-label="Source page" value={index} onChange={event => onPageChange(pages[Number(event.target.value)].page)} className="rounded-lg border px-3 py-2 text-xs">{pages.map((item, i) => <option key={item.page} value={i}>Page {item.page} of {document.pageCount}</option>)}</select>
        <button disabled={index === pages.length - 1} onClick={() => onPageChange(pages[index + 1].page)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40">Next</button>
      </div>
    </div>
    <div className="grid lg:grid-cols-2">
      <div className="border-r border-slate-200 bg-slate-100"><p className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Original PDF · page {page.page}</p><div className="h-[700px] overflow-auto p-4"><img src={page.image} alt={`Original PDF page ${page.page}`} width={page.width} height={page.height} className="h-auto w-full bg-white shadow" /></div></div>
      <div><p className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">HTML transcription · compact comparison</p><iframe title={`HTML transcription page ${page.page}`} srcDoc={transcript} sandbox="" className="h-[700px] w-full border-0" /></div>
    </div>
  </section>;
}
