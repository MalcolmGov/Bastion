'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { renderResultsHtml } from '@/lib/results/renderHtml';
import type { StoredResultsDocument } from '@/lib/results/types';

type Version = { id: string; version: number; author_id: string | null; author_name: string; created_at: string; restored_from: string | null; reviewer_name: string | null; reviewed_at: string | null; comment: string | null; requested_name: string | null; requested_at: string | null; published_at: string | null };
type History = { versions: Version[]; currentRevisionId: string | null; nextOffset: number | null; permissions: { edit: boolean; approve: boolean; publish: boolean }; userId: string };
export function ResultsHistory({ current, dirty, sourceReviewed, validationReviewed, hasIssues, onRestore, onPublishReady }: { current: StoredResultsDocument; dirty: boolean; sourceReviewed: boolean; validationReviewed: boolean; hasIssues: boolean; onRestore: (value: StoredResultsDocument) => void; onPublishReady: (ready: boolean) => void }) {
  const [history, setHistory] = useState<History | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [preview, setPreview] = useState<{ version: number; html: string; changes: string[] } | null>(null);
  const sequence = useRef(0);
  const load = useCallback(async (offset = 0) => {
    const token = ++sequence.current;
    const response = await fetch(`/api/admin/results/${current.id}/history?offset=${offset}`);
    const body = await response.json();
    if (token !== sequence.current) return;
    if (!response.ok) throw new Error(body.error || 'Could not load version history.');
    setHistory(existing => offset && existing ? { ...body, versions: [...existing.versions, ...body.versions] } : body);
  }, [current.id]);
  useEffect(() => {
    setHistory(null); setPreview(null); setNotice(null); setError(null); onPublishReady(false);
    load().catch(err => setError(err instanceof Error ? err.message : 'Could not load history.'));
    const requestSequence = sequence;
    return () => { requestSequence.current++; };
  }, [current.updatedAt, load, onPublishReady]);
  const latest = history?.versions.find(version => version.id === history.currentRevisionId);
  const approved = Boolean(latest?.reviewed_at);
  useEffect(() => { onPublishReady(Boolean(!dirty && approved && history?.permissions.publish)); }, [dirty, approved, history?.permissions.publish, onPublishReady]);
  async function action(action: 'request' | 'approve' | 'restore', revisionId: string) {
    const token = sequence.current;
    setBusy(true); setError(null); setNotice(null);
    try {
      const response = await fetch(`/api/admin/results/${current.id}/history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, revisionId, expectedUpdatedAt: current.updatedAt, sourceReviewed, validationReviewed, comment }) });
      const body = await response.json();
      if (token !== sequence.current) return;
      if (!response.ok) throw new Error(body.error || 'The action could not be completed.');
      if (action === 'restore') { setPreview(null); onRestore(body); }
      else { setNotice(action === 'approve' ? 'Approval recorded for this saved version.' : 'Review requested. A reviewer can open this saved report to approve it.'); await load(); }
    } catch (err) { if (token === sequence.current) setError(err instanceof Error ? err.message : 'The action failed.'); }
    finally { setBusy(false); }
  }
  async function inspect(version: Version) {
    const token = sequence.current;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/admin/results/${current.id}/history?revision=${encodeURIComponent(version.id)}`);
      const body = await response.json();
      if (token !== sequence.current) return;
      if (!response.ok) throw new Error(body.error || 'Could not open this version.');
      setPreview({ version: version.version, html: body.document.presentationHtml || renderResultsHtml(body.document), changes: body.changes });
    } catch (err) { if (token === sequence.current) setError(err instanceof Error ? err.message : 'Could not open this version.'); }
    finally { setBusy(false); }
  }
  const button = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40';
  return <section aria-label="Approval and version history" className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Publication governance</p><h2 className="mt-1 text-base font-semibold text-slate-900">Review, approve, publish</h2></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${approved && !dirty ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{dirty ? 'Unsaved changes' : approved ? `Version ${latest?.version} approved` : latest?.requested_at ? 'Awaiting review' : 'Approval required'}</span></div>
    <p className="mt-2 text-xs leading-5 text-slate-500">Save your changes, compare the PDF, then ask a different reviewer to approve the exact version. A publisher releases the approved report. Your live page stays online while you work.</p>
    {latest?.reviewed_at && <p className="mt-3 text-sm text-emerald-800">Approved by {latest.reviewer_name} · {new Date(latest.reviewed_at).toLocaleString()}{latest.comment && <span className="mt-1 block text-xs">{latest.comment}</span>}</p>}
    {!history && !error && <p role="status" className="mt-3 text-xs text-slate-500">Loading review records…</p>}
    {history && !latest && <p className="mt-3 text-xs text-amber-800">Save this draft to start its version history. Earlier versions were not recorded.</p>}
    {history?.permissions.edit && latest && !approved && <button type="button" className={`${button} mt-3`} disabled={busy || dirty || Boolean(latest.requested_at)} onClick={() => action('request', latest.id)}>{latest.requested_at ? `Requested by ${latest.requested_name}` : 'Request review'}</button>}
    {history?.permissions.approve && latest && !approved && <div className="mt-3 space-y-2"><label className="block text-xs font-semibold text-slate-600">Reviewer notes<textarea value={comment} onChange={event => setComment(event.target.value)} maxLength={2000} className="mt-1 block w-full rounded-lg border border-slate-200 p-2 font-normal" placeholder="Optional review notes" /></label><button type="button" className={button} disabled={busy || dirty || !sourceReviewed || (hasIssues && !validationReviewed) || latest.author_id === history.userId} onClick={() => action('approve', latest.id)}>Approve saved version</button>{latest.author_id === history.userId && <p className="text-xs text-slate-500">A different reviewer must approve your changes.</p>}</div>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}{notice && <p role="status" className="mt-3 text-xs text-emerald-700">{notice}</p>}
    <details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Version history · {history?.versions.length || 0} saved versions</summary><p className="mt-2 text-xs text-slate-500">Restoring creates a new draft for review. It keeps the current live publication.</p><ol className="mt-3 max-h-80 space-y-2 overflow-auto">{history?.versions.map(version => <li key={version.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3"><div><p className="text-xs font-semibold text-slate-800">Version {version.version}{version.id === history.currentRevisionId ? ' · Current draft' : ''}{version.published_at ? ' · Live' : ''}{version.restored_from ? ' · Restored draft' : ''}</p><p className="mt-1 text-[11px] text-slate-500">{version.author_name} · {new Date(version.created_at).toLocaleString()}</p>{version.reviewed_at && <p className="mt-1 text-[11px] text-emerald-700">Approved by {version.reviewer_name} · {new Date(version.reviewed_at).toLocaleString()}</p>}</div><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => inspect(version)} className={button}>Preview v{version.version}</button>{history.permissions.edit && version.id !== history.currentRevisionId && <button type="button" disabled={busy || dirty} onClick={() => action('restore', version.id)} className={button}>Restore as draft</button>}</div></li>)}</ol>{history?.nextOffset != null && <button type="button" className={`${button} mt-2`} onClick={() => load(history.nextOffset!).catch(err => setError(String(err)))}>Load earlier versions</button>}</details>
    {preview && <div className="mt-4"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Version {preview.version} preview</p><button type="button" onClick={() => setPreview(null)} className={button}>Close preview</button></div><p className="my-2 text-xs text-slate-500">Compared with the saved draft: {preview.changes.join(' · ')}</p><iframe title={`Version ${preview.version} preview`} srcDoc={preview.html} sandbox="" className="h-[500px] w-full rounded-xl border border-slate-200 bg-white" /></div>}
  </section>;
}
