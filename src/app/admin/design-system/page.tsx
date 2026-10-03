'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, Layers3 } from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { designSystemCss, designSystemIssues, safeFont } from '@/lib/studio/designSystem';
import type { WebsiteDesignSystem } from '@/lib/studio/designSystem';

export default function DesignSystemPage() {
  const { activeSite } = useStudioWorkspace();
  const siteId = activeSite?.id;
  const [system, setSystem] = useState<WebsiteDesignSystem | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const controller = new AbortController(); setSystem(null); setError('');
    if (!siteId) return;
    setLoading(true);
    fetch(`/api/admin/design-system?siteId=${encodeURIComponent(siteId)}`, { signal: controller.signal }).then(async response => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error); setSystem(data.system);
    }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [siteId]);
  function download(format: 'json' | 'css') {
    if (!system) return;
    const url = URL.createObjectURL(new Blob([format === 'css' ? designSystemCss(system) : JSON.stringify(system, null, 2)], { type: format === 'css' ? 'text/css' : 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${activeSite?.slug || 'website'}-tokens.${format}`; anchor.click(); URL.revokeObjectURL(url);
  }
  return <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-12"><header><div className="mb-3 flex gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600"><Layers3 size={16} /> Website design system</div><h1 className="text-3xl font-semibold tracking-tight text-slate-900">A consistent identity, down to the details.</h1><p className="mt-3 text-sm text-slate-500">{activeSite?.name || 'Choose a website in your workspace'} · Saved design tokens for the client’s website.</p></header>
    {error && <p role="alert" className="text-rose-600">{error}</p>}
    {loading ? <p>Loading website tokens…</p> : !system ? <div className="rounded-2xl border border-slate-200 bg-white p-8"><h2 className="text-lg font-semibold">No website design system saved yet.</h2><p className="mt-2 text-sm text-slate-500">Start with website DNA or an approved client brief in the creation studio.</p><Link href="/admin/create" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">Open creation studio <ArrowRight size={16} /></Link></div> : <>
      <div className="flex gap-4">{(['json', 'css'] as const).map(format => <button key={format} onClick={() => download(format)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600"><Download size={15} /> Export {format.toUpperCase()} tokens</button>)}</div>
      <section className="rounded-2xl border border-slate-200 bg-white p-7"><h2 className="text-lg font-semibold text-slate-900">Semantic colour palette</h2><div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">{Object.entries(system.colors).map(([name, hex]) => <div key={name}><div className="h-24 rounded-xl border border-black/5" style={{ background: hex }} /><p className="mt-3 text-sm font-medium text-slate-700">{name.replace(/[A-Z]/g, c => ' ' + c.toLowerCase())}</p><p className="mt-1 font-mono text-xs text-slate-400">{hex}</p></div>)}</div></section>
      <section className="grid gap-6 rounded-2xl border border-slate-200 p-8 md:grid-cols-2" style={{ background: system.colors.background, color: system.colors.textPrimary }}><div><p className="text-xs uppercase tracking-widest">{system.typography.headingFont} · headings</p><h2 className="mt-5 text-4xl leading-tight" style={{ fontFamily: `"${safeFont(system.typography.headingFont)}", serif`, fontWeight: Number(system.typography.headingWeight) }}>Considered design.<br />Lasting presence.</h2></div><div style={{ fontFamily: `"${safeFont(system.typography.bodyFont)}", sans-serif` }}><p className="text-xs uppercase tracking-widest">{system.typography.bodyFont} · body</p><p className="mt-5 text-sm leading-7">A shared visual language gives every page a clear purpose. Typography, colour, space and component details work together to support the client’s identity.</p><p className="mt-4 text-xs">Installed fonts and safe fallbacks are used; custom licensed font files require configuration.</p></div></section>
      <div className="grid gap-6 md:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-7"><h2 className="text-lg font-semibold">Spacing & shape</h2><p className="mt-3 text-sm text-slate-500">Radius: {system.radius} · type ratio: {system.typography.scaleRatio}</p><div className="mt-6 flex items-end gap-2">{system.spacing.map(n => <div key={n} className="flex-1 text-center"><div className="rounded-t bg-indigo-100" style={{ height: n }} /><span className="text-[10px] text-slate-500">{n}</span></div>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-7"><h2 className="text-lg font-semibold">Review & provenance</h2><p className="mt-3 text-sm leading-6 text-slate-500">{designSystemIssues(system).join(' ') || 'Core body and muted text pairs meet 4.5:1 contrast.'}</p><p className="mt-3 break-all text-xs text-slate-400">Source: {system.sourceUrl || 'Agency design proposal'}</p><p className="mt-3 text-xs leading-5 text-slate-500">Tokens are saved with generated page versions. A future brand-kit change does not silently rewrite approved pages.</p></section></div>
    </>}
  </div>;
}
