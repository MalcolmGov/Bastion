'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Code2, GitBranch, RefreshCw, ExternalLink, ShieldCheck, Unplug, ArrowRight, AlertCircle } from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { isAgencyUser } from '@/lib/auth/roles';
import type { ActivityItem, OperationsSnapshot } from '@/lib/github/operations';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
function Activity({ title, items, empty }: { title: string; items: ActivityItem[]; empty: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    {items.length ? <ul className="mt-5 divide-y divide-slate-100">{items.map((item, index) => <li key={`${item.url}-${index}`} className="py-4 first:pt-0">
      <div className="flex items-start justify-between gap-3"><span className="text-sm font-medium text-slate-800 break-words">{item.title}</span><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${['failure', 'error', 'timed_out'].includes(item.status) ? 'bg-rose-50 text-rose-700' : item.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{item.status.replaceAll('_', ' ')}</span></div>
      <p className="mt-2 text-xs text-slate-500 break-words">{item.detail}</p>
      {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600">Open in GitHub <ExternalLink size={12} /></a>}
    </li>)}</ul> : <p className="mt-5 text-sm text-slate-500">{empty}</p>}
  </section>;
}

export default function RepositoryOperationsPage() {
  const { user } = useAdminAuth();
  const { activeSite, activeClient, isLoading } = useStudioWorkspace();
  const agency = isAgencyUser(user);
  const siteId = activeSite?.id;
  const requestId = useRef(0);
  const [snapshot, setSnapshot] = useState<OperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [repository, setRepository] = useState('');
  const [branch, setBranch] = useState('');
  const [environment, setEnvironment] = useState('production');
  const [editing, setEditing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const load = useCallback(async () => {
    const sequence = ++requestId.current;
    if (!agency || !siteId) { setSnapshot(null); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/admin/github/operations?siteId=${encodeURIComponent(siteId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (sequence !== requestId.current) return;
      if (!response.ok) throw new Error(data.error || 'Unable to load repository status.');
      setSnapshot(data); setError(data.connectionError || ''); setRepository(data.link?.repository || ''); setBranch(data.link?.branch || ''); setEnvironment(data.link?.environment || 'production');
    } catch (e) { if (sequence === requestId.current) setError(e instanceof Error ? e.message : 'Unable to load repository status.'); }
    finally { if (sequence === requestId.current) setLoading(false); }
  }, [agency, siteId]);
  useEffect(() => {
    const sequenceRef = requestId;
    setSnapshot(null); setEditing(false); setDisconnecting(false); setRepository(''); setBranch(''); setEnvironment('production'); setSaving(false);
    void load();
    return () => { sequenceRef.current++; };
  }, [load]);

  async function save(action: 'link' | 'unlink') {
    const sequence = requestId.current;
    setSaving(true); setError('');
    try {
      const response = await fetch(`/api/admin/github/operations?siteId=${encodeURIComponent(siteId || '')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, repository, branch, environment, expectedRevision: snapshot?.link?.revision || 0 }) });
      const data = await response.json();
      if (sequence !== requestId.current) return;
      if (!response.ok) throw new Error(data.error || 'Unable to save this connection.');
      setEditing(false); setDisconnecting(false); setSaving(false);
      await load();
    } catch (e) { if (sequence === requestId.current) setError(e instanceof Error ? e.message : 'Unable to save this connection.'); }
    finally { if (sequence === requestId.current) setSaving(false); }
  }

  if (!agency) return <div className="p-8 text-slate-600">GitHub operations is available to Bastion agency staff.</div>;
  if (isLoading) return <div className="p-8 text-slate-600">Loading your workspace…</div>;
  if (!siteId) return <div className="p-8 text-slate-600">Choose a client website to connect its codebase.</div>;
  const link = snapshot?.link;
  const activity = snapshot?.activity;
  return <main className="mx-auto max-w-7xl space-y-7 p-6 lg:p-10">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Bastion Operations</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Your website. Its code. One clear view.</h1><p className="mt-3 text-sm text-slate-500">{activeClient?.name} <span className="px-2">/</span> {activeSite?.name}</p></div>
      <button onClick={() => void load()} disabled={loading || saving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> {loading ? 'Checking GitHub…' : 'Refresh status'}</button>
    </header>
    {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={18} className="shrink-0" /><div>{error}<p className="mt-1 text-xs">Status is unavailable until the connection can be verified.</p></div></div>}
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-7 text-white lg:p-9">
      <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-wrap items-center justify-between gap-6"><div className="flex items-start gap-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><Code2 size={28} /></div><div><p className="text-xs font-medium uppercase tracking-widest text-slate-400">{link ? 'Connected codebase' : 'Connect your codebase'}</p><h2 className="mt-2 text-xl font-semibold">{link?.repository || 'A reliable foundation for website support'}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{link ? `${link.branch} · ${link.environment} · GitHub App` : 'Link this client website to its GitHub repository. See what changed, what is being reviewed, and which builds need attention.'}</p></div></div>
      {link && <button disabled={saving || loading} onClick={() => { setEditing(!editing); setDisconnecting(false); }} className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium hover:bg-white/15 disabled:opacity-50">{editing ? 'Cancel' : 'Manage connection'}</button>}</div>
      <div className="relative mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-slate-400"><ShieldCheck size={15} /> Read-only diagnostics · Changes go through reviewed pull requests</div>
    </section>
    {snapshot && (!link || editing) && <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]"><div><h2 className="text-lg font-semibold text-slate-900">{link ? 'Update repository connection' : 'Connect in two steps'}</h2><ol className="mt-5 space-y-4 text-sm leading-6 text-slate-600"><li><strong className="text-slate-900">1. Install the Bastion GitHub App.</strong><br />Grant access to the client repository you want to connect.</li><li><strong className="text-slate-900">2. Link and verify.</strong><br />Enter the repository and the branch you support. Bastion verifies access before saving.</li></ol>{snapshot.app.installUrl && <a href={snapshot.app.installUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600">Install GitHub App <ExternalLink size={14} /></a>}
      {!snapshot.app.configured && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">Your platform administrator needs to configure the GitHub App ID and signing key on the server. Repository linking will then become available.</p>}</div>
      <form onSubmit={e => { e.preventDefault(); void save('link'); }} className="space-y-4"><label className="block text-sm font-medium text-slate-700">GitHub repository<input required value={repository} onChange={e => setRepository(e.target.value)} placeholder="organisation/client-website" className={`${inputClass} mt-2`} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Branch<input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Use repository default" className={`${inputClass} mt-2`} /></label><label className="block text-sm font-medium text-slate-700">Deployment environment<input required value={environment} onChange={e => setEnvironment(e.target.value)} className={`${inputClass} mt-2`} /></label></div><p className="text-xs leading-5 text-slate-500">The environment matches GitHub deployment records, for example production or staging.</p><button disabled={!snapshot.app.configured || saving || loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{saving ? 'Verifying…' : 'Verify & link repository'}<ArrowRight size={16} /></button></form></div>
      {link && <div className="mt-7 border-t border-slate-100 pt-5">{disconnecting ? <div className="flex flex-wrap items-center gap-4 text-sm"><p>Disconnect this website from {link.repository}?</p><button disabled={saving} onClick={() => void save('unlink')} className="font-semibold text-rose-600">Confirm disconnect</button><button onClick={() => setDisconnecting(false)} className="text-slate-500">Cancel</button></div> : <button onClick={() => setDisconnecting(true)} className="inline-flex items-center gap-2 text-sm text-slate-500"><Unplug size={14} /> Disconnect this website</button>}</div>}
    </section>}
    {loading && !snapshot && <p role="status" className="text-sm text-slate-500">Checking the repository connection…</p>}
    {link && activity && !error && <>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"><span className="inline-flex items-center gap-2"><GitBranch size={14} /> Activity for {link.branch} · latest 5 items</span><span>Checked {snapshot.checkedAt ? new Date(snapshot.checkedAt).toLocaleString() : 'just now'}</span></div>
      {!!snapshot.warnings?.length && <div role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{snapshot.warnings.map(w => <p key={w}>{w}</p>)}</div>}
      <div className="grid gap-5 lg:grid-cols-2"><Activity title="Recent code changes" items={activity.commits} empty="No commits were returned for this branch." /><Activity title="Pull requests" items={activity.pulls} empty="No open pull requests target this branch." /><Activity title="Builds & checks" items={activity.builds} empty="No GitHub Actions runs were returned for this branch." /><Activity title="Deployment activity" items={activity.deployments} empty="No GitHub deployment records were returned for this environment. Your hosting provider may report elsewhere." /></div>
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6"><div><h2 className="font-semibold text-slate-900">Investigate with the right context</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Compare recent changes and failed builds with your incident timeline. GitHub status describes the code pipeline; runtime health and hosting logs provide the rest of the picture.</p></div><Link href="/admin/incidents" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Open incidents <ArrowRight size={16} /></Link></section>
    </>}
  </main>;
}
