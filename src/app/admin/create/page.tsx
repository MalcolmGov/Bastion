'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2, Download, Globe2, Layers3, Loader2, Palette, ShieldCheck, Sparkles } from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { isAgencyUser } from '@/lib/auth/roles';
import { BLUEPRINTS } from '@/lib/studio/blueprints';
import { COLOR_DEFAULTS, createDesignSystem, contrastRatio, designSystemCss, designSystemIssues, safeAssetUrl, safeFont } from '@/lib/studio/designSystem';
import type { ColorRole, WebsiteDesignSystem } from '@/lib/studio/designSystem';
import type { BrandKit, BlueprintId, DesignCollectionId } from '@/lib/studio/types';
import type { BrandKitDnaResult } from '@/lib/studio/brandExtractor';
import type { ExtractionResult } from '@/lib/studio/importer';
import type { AssembleInput, AssembleResult } from '@/lib/studio/assembler';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50';
function kitFrom(system: WebsiteDesignSystem): Partial<BrandKit> {
  return {
    colors: Object.fromEntries(Object.entries(system.colors).map(([role, value]) => [role, { name: role, value, status: 'approved', evidence: system.evidence[role] || 'Reviewed agency design proposal' }])) as BrandKit['colors'],
    typography: { ...system.typography, status: 'approved' }, logos: { primary: { url: system.logoUrl, status: 'approved' } },
    componentRules: { radius: system.radius, buttonStyle: 'solid', shadows: 'subtle', imageryDirection: 'Selected client imagery' },
  };
}
function exportFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

export default function WebsiteCreationPage() {
  const { user, isLoading } = useAdminAuth();
  const { clients, refreshClients, setActiveClientId, setActiveSiteId } = useStudioWorkspace();
  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState('');
  const [newClient, setNewClient] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [slug, setSlug] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [source, setSource] = useState<BrandKitDnaResult | null>(null);
  const [system, setSystem] = useState(createDesignSystem());
  const [collection, setCollection] = useState<DesignCollectionId>('editorial');
  const [blueprint, setBlueprint] = useState<BlueprintId>('professional_services');
  const [summary, setSummary] = useState('');
  const [headline, setHeadline] = useState('');
  const [services, setServices] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState<AssembleResult | null>(null);
  const selectedClient = clients.find(c => c.id === clientId);
  const clientName = selectedClient?.name || newClient.trim();
  const issues = designSystemIssues(system);
  const completeBrief = !!clientName && !!websiteName.trim() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const media = (source?.assets.media || []).filter(item => safeAssetUrl(item.url)).slice(0, 12);

  async function extract() {
    setBusy('Reading website DNA'); setError(''); setNotice(''); setReviewed(false);
    try {
      const responses = await Promise.allSettled([
        fetch('/api/admin/brand/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: sourceUrl, maxPages: 3 }) }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); return data.result as BrandKitDnaResult; }),
        fetch('/api/admin/wizard/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: sourceUrl, maxPages: 4 }) }).then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.error); return data.result as ExtractionResult; }),
      ]);
      if (responses[0].status === 'rejected') throw responses[0].reason;
      const dna = responses[0].value;
      setSource(dna); setSystem(createDesignSystem({}, dna.theme, dna.sourceUrl));
      setHeroImage(safeAssetUrl(dna.assets.media.find(m => m.category === 'hero')?.url));
      if (responses[1].status === 'fulfilled') {
        const content = responses[1].value;
        setSummary(content.content.businessSummary || ''); setHeadline(content.brandCandidates.taglineCandidate || '');
        setServices(content.content.servicesFound.map(s => `${s.title} | ${s.description}`).join('\n'));
        setEmail(content.content.contactInfoFound.email || ''); setPhone(content.content.contactInfoFound.phone || '');
      } else {
        setSummary(dna.copyAnalysis.metaDescription || ''); setHeadline(dna.copyAnalysis.commonPhrases[0] || '');
        setNotice('Design DNA was extracted. Some content could not be read; complete the company brief below.');
      }
      setStep(1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Extraction failed. Try another public website or continue with a manual brief.'); }
    finally { setBusy(''); }
  }
  async function generate() {
    setBusy('Creating four editable pages'); setError('');
    const body: AssembleInput = {
      clientId: selectedClient?.id || `client_${slug.replace(/-/g, '_')}`, clientName, websiteName: websiteName.trim(), websiteSlug: slug,
      blueprintId: blueprint, collectionId: collection, designReviewed: reviewed, designSystem: system, brandKit: kitFrom(system), sourceUrl: source?.sourceUrl, heroImage,
      extractedContent: { tagline: headline.trim(), businessSummary: summary.trim(), contactInfo: { email: email.trim(), phone: phone.trim() },
        services: services.split('\n').filter(line => line.trim()).map(line => { const [title, ...description] = line.split('|'); return { title: title.trim(), description: description.join('|').trim() }; }) },
    };
    try {
      const response = await fetch('/api/admin/wizard/assemble', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setResult(data); await refreshClients(); setActiveClientId(body.clientId); setActiveSiteId(data.websiteId); setStep(3);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Creation failed. Your existing websites have not been replaced.'); }
    finally { setBusy(''); }
  }
  if (isLoading) return <div className="p-12 text-slate-500">Loading your workspace…</div>;
  if (!isAgencyUser(user)) return <div className="p-12">Website creation is available to the Bastion agency team.</div>;
  return <div className="mx-auto max-w-[1560px] space-y-7 p-5 md:p-9 lg:p-12">
    <header className="flex flex-wrap items-start justify-between gap-5">
      <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-indigo-600"><Layers3 size={15} /> Bastion creation studio</div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Great websites start with a clear identity.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Capture the client’s brand. Refine the design system. Create a cohesive, editable corporate website.</p></div>
      <Link href="/admin/create/advanced" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600">Advanced imports & GitHub →</Link>
    </header>
    <nav aria-label="Creation progress" className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 md:grid-cols-4">
      {['Client & source', 'Design system', 'Website direction', 'Ready to edit'].map((label, i) => <button key={label} disabled={!!busy || i === 3 && !result || i > step} onClick={() => setStep(i)} aria-current={step === i ? 'step' : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${step === i ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 disabled:opacity-50'}`}><span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${step === i ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>{i < step ? <Check size={14} /> : i + 1}</span>{label}</button>)}
    </nav>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{notice}</div>}
    <div className="grid gap-7 lg:grid-cols-[minmax(330px,.85fr)_minmax(0,1.15fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <fieldset disabled={!!busy || !!result} className="min-w-0 space-y-5">
          {step === 0 && <>
            <div><h2 className="text-xl font-semibold text-slate-900">A home for your client’s brand</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose the client and give this website its own identity. Every build starts as a private draft.</p></div>
            <label className="block space-y-2 text-sm font-medium text-slate-700">Client<select value={clientId} onChange={e => setClientId(e.target.value)} className={inputClass}><option value="">Create a new client</option>{clients.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
            {!clientId && <label className="block space-y-2 text-sm font-medium text-slate-700">New client name<input value={newClient} onChange={e => setNewClient(e.target.value)} placeholder="e.g. Meridian Advisory" className={inputClass} /></label>}
            <label className="block space-y-2 text-sm font-medium text-slate-700">Website name<input value={websiteName} onChange={e => setWebsiteName(e.target.value)} placeholder="Corporate website" className={inputClass} /></label>
            <label className="block space-y-2 text-sm font-medium text-slate-700">Website address slug<input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="meridian-corporate" className={inputClass} /><span className="block text-xs font-normal text-slate-400">Use a unique slug. Existing websites are protected.</span></label>
            <div className="border-t border-slate-100 pt-5"><label className="block space-y-2 text-sm font-medium text-slate-700">Reference website<input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://client-website.com" className={inputClass} /></label><p className="mt-2 text-xs leading-5 text-slate-500">Reads public brand styles and assets. Source candidates need your review; blocked websites can be built from a manual brief.</p></div>
            <button onClick={extract} disabled={!completeBrief || !sourceUrl.trim()} className={buttonClass}><Globe2 size={16} /> Extract website DNA</button>
            <button onClick={() => { setStep(1); setSource(null); setSystem(createDesignSystem()); setNotice('Start with the proposed palette and enter the client’s approved content.'); }} disabled={!completeBrief} className="ml-3 text-sm font-medium text-slate-600">Start from a brief →</button>
          </>}
          {step === 1 && <>
            <div><h2 className="text-xl font-semibold text-slate-900">One system. Every page.</h2><p className="mt-2 text-sm leading-6 text-slate-500">{source ? 'Extracted styles are candidates. Adjust their semantic roles and check contrast before approving.' : 'A considered starting palette. Replace it with your client’s approved brand colours.'}</p></div>
            {source && <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong>{source.theme.sources.extractedEngine || 'Website extraction'}</strong><br />{source.crawledPages.length} pages read · {new Date(source.extractedAt).toLocaleDateString()}<br /><a href={safeAssetUrl(source.sourceUrl)} target="_blank" rel="noreferrer" className="break-all text-indigo-600">{source.sourceUrl}</a></div>}
            <div className="grid grid-cols-2 gap-3">{Object.keys(COLOR_DEFAULTS).map(role => <label key={role} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"><input aria-label={`${role} colour`} type="color" value={system.colors[role as ColorRole]} onChange={e => { setReviewed(false); setSystem({ ...system, colors: { ...system.colors, [role]: e.target.value } }); }} className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent" /><span className="text-xs font-medium text-slate-700">{role.replace(/[A-Z]/g, c => ' ' + c.toLowerCase())}<span className="mt-1 block font-mono text-[10px] text-slate-400">{system.colors[role as ColorRole]}</span></span></label>)}</div>
            <div className="grid grid-cols-2 gap-3">{(['headingFont', 'bodyFont'] as const).map(key => <label className="space-y-2 text-xs font-medium text-slate-600" key={key}>{key === 'headingFont' ? 'Heading font' : 'Body font'}<input value={system.typography[key]} onChange={e => { setReviewed(false); setSystem({ ...system, typography: { ...system.typography, [key]: e.target.value } }); }} className={inputClass} /></label>)}</div>
            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-2 text-xs font-medium text-slate-600">Corners<select value={system.radius} onChange={e => { setReviewed(false); setSystem({ ...system, radius: e.target.value as WebsiteDesignSystem['radius'] }); }} className={inputClass}>{['none', 'sm', 'md', 'lg', 'full'].map(value => <option value={value} key={value}>{value}</option>)}</select></label>
              <label className="space-y-2 text-xs font-medium text-slate-600">Heading weight<select value={system.typography.headingWeight} onChange={e => { setReviewed(false); setSystem({ ...system, typography: { ...system.typography, headingWeight: e.target.value } }); }} className={inputClass}>{['400', '500', '600', '700'].map(value => <option value={value} key={value}>{value}</option>)}</select></label>
              <label className="space-y-2 text-xs font-medium text-slate-600">Type scale<select value={system.typography.scaleRatio} onChange={e => { setReviewed(false); setSystem({ ...system, typography: { ...system.typography, scaleRatio: Number(e.target.value) } }); }} className={inputClass}><option value="1.125">Compact</option><option value="1.25">Balanced</option><option value="1.414">Expressive</option></select></label>
            </div>
            <p className="text-xs leading-5 text-slate-500">Fonts use an installed font or its fallback. Licensed font files must be supplied before matching a proprietary typeface.</p>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Logo URL<input value={system.logoUrl} onChange={e => { setReviewed(false); setSystem({ ...system, logoUrl: e.target.value }); }} placeholder="https://…/logo.svg (optional)" className={inputClass} /></label>
            <div className={`rounded-xl p-4 text-xs leading-6 ${issues.length ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}><strong>{issues.length ? 'Contrast needs attention' : 'Core text contrast passes AA'}</strong><br />{issues.length ? issues.join(' ') : `Body on canvas ${contrastRatio(system.colors.textPrimary, system.colors.background).toFixed(1)}:1 · muted on canvas ${contrastRatio(system.colors.textMuted, system.colors.background).toFixed(1)}:1`}</div>
            <div className="flex flex-wrap gap-3"><button onClick={() => exportFile(`${slug}-tokens.json`, JSON.stringify(system, null, 2), 'application/json')} className="flex items-center gap-2 text-xs font-medium text-slate-600"><Download size={14} /> JSON tokens</button><button onClick={() => exportFile(`${slug}-tokens.css`, designSystemCss(system), 'text/css')} className="flex items-center gap-2 text-xs font-medium text-slate-600"><Download size={14} /> CSS tokens</button></div>
            <button onClick={() => setStep(2)} disabled={issues.length > 0} className={buttonClass}>Choose website direction <ArrowRight size={16} /></button>
          </>}
          {step === 2 && <>
            <div><h2 className="text-xl font-semibold text-slate-900">Make the brand feel at home</h2><p className="mt-2 text-sm leading-6 text-slate-500">Choose an art direction and review the copy. We’ll create Home, About, Services and Contact with a shared design system.</p></div>
            <div className="grid grid-cols-3 gap-2">{(['editorial', 'contemporary', 'immersive'] as const).map(c => <button key={c} aria-pressed={collection === c} onClick={() => { setCollection(c); setReviewed(false); }} className={`rounded-xl border px-2 py-4 text-xs font-semibold capitalize ${collection === c ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500'}`}>{c}<span className="mt-1 block text-[10px] font-normal">{c === 'editorial' ? 'Elegant & considered' : c === 'contemporary' ? 'Clear & confident' : 'Bold & expansive'}</span></button>)}</div>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Industry blueprint<select value={blueprint} onChange={e => setBlueprint(e.target.value as BlueprintId)} className={inputClass}>{Object.values(BLUEPRINTS).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Homepage headline<input value={headline} onChange={e => { setReviewed(false); setHeadline(e.target.value); }} placeholder={clientName} className={inputClass} /></label>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Company introduction<textarea value={summary} onChange={e => { setReviewed(false); setSummary(e.target.value); }} rows={3} placeholder="The client’s approved introduction…" className={inputClass} /></label>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Services <span className="font-normal">· one per line: title | description</span><textarea value={services} onChange={e => { setReviewed(false); setServices(e.target.value); }} rows={3} placeholder="Strategy | Your approved service description" className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-2 text-xs font-medium text-slate-600">Contact email<input value={email} onChange={e => { setReviewed(false); setEmail(e.target.value); }} type="email" className={inputClass} /></label><label className="space-y-2 text-xs font-medium text-slate-600">Phone<input value={phone} onChange={e => { setReviewed(false); setPhone(e.target.value); }} className={inputClass} /></label></div>
            <label className="block space-y-2 text-xs font-medium text-slate-600">Hero image URL<input value={heroImage} onChange={e => { setReviewed(false); setHeroImage(e.target.value); }} placeholder="Approved client photography URL (optional)" className={inputClass} /></label>
            {media.length > 0 && <div className="grid grid-cols-4 gap-2">{media.map(m => <button key={m.id} title={m.altText || 'Select source image'} onClick={() => { setHeroImage(m.url); setReviewed(false); }} className={`overflow-hidden rounded-lg border-2 ${heroImage === m.url ? 'border-indigo-500' : 'border-transparent'}`}><img src={m.url} alt={m.altText || 'Source image candidate'} className="h-16 w-full object-cover" /></button>)}</div>}
            <label className="flex gap-3 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} className="mt-1" />I’ve reviewed the design tokens and content candidates, including image rights and font licensing. Missing content will be flagged for completion before publication.</label>
            <button onClick={generate} disabled={!reviewed || issues.length > 0 || !completeBrief} className={buttonClass}><Sparkles size={16} /> Create editable website</button>
          </>}
        </fieldset>
        {step === 3 && result && <div className="space-y-5"><CheckCircle2 className="text-emerald-500" size={32} /><h2 className="text-2xl font-semibold text-slate-900">Your website is ready to shape.</h2><p className="text-sm leading-6 text-slate-500">Four pages are saved as drafts, with reviewed tokens, working page links and version history. Open the visual editor to refine the content, then send it for client approval.</p><div className="grid grid-cols-2 gap-2">{result.compositions.map(p => <Link key={p.id} href={`/admin/editor?siteId=${result.websiteId}&pageSlug=${p.pageSlug}`} className="rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700">{p.pageSlug} <ArrowRight className="float-right text-indigo-500" size={16} /></Link>)}</div><Link href={result.previewUrl} className={buttonClass}>Open visual editor <ArrowRight size={16} /></Link><div className="border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold text-slate-800">Editorial checklist</h3>{result.gaps.map(g => <p key={g.id} className="mt-3 text-xs leading-5 text-slate-500">• {g.message}</p>)}</div></div>}
        {busy && <div role="status" className="mt-5 flex items-center gap-3 text-sm text-indigo-600"><Loader2 size={18} className="animate-spin" />{busy}…</div>}
      </section>
      <aside className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-center justify-between px-1"><span className="flex items-center gap-2 text-xs font-medium text-slate-500"><Palette size={14} /> Live brand direction</span><span className="text-[10px] uppercase tracking-wider text-slate-400">Illustrative composition</span></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60" style={{ background: system.colors.background, color: system.colors.textPrimary, fontFamily: `"${safeFont(system.typography.bodyFont)}", sans-serif` }}>
          <div className="flex gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-3"><span className="h-2 w-2 rounded-full bg-slate-300" /><span className="h-2 w-2 rounded-full bg-slate-300" /><span className="h-2 w-2 rounded-full bg-slate-300" /><span className="mx-auto text-[10px] text-slate-400">{slug || 'your-client'}.bastion.preview</span></div>
          <div className="flex items-center justify-between gap-3 border-b px-7 py-6" style={{ borderColor: system.colors.hairline }}><span className="text-sm font-semibold">{safeAssetUrl(system.logoUrl) ? <img src={safeAssetUrl(system.logoUrl)} alt={`${clientName} logo`} className="h-8 max-w-32 object-contain" /> : clientName || 'Meridian'}</span><div className="hidden gap-4 text-[10px] text-current/70 sm:flex"><span>About</span><span>Services</span><span>Contact ↗</span></div></div>
          <div className={`relative px-7 py-14 md:px-10 ${collection === 'immersive' ? 'text-center' : ''}`}>
            {safeAssetUrl(heroImage) && <img src={safeAssetUrl(heroImage)} alt="Selected client hero photography" className="mb-8 h-52 w-full rounded-lg object-cover" />}
            <p className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: system.colors.textMuted }}>Perspective. Purpose. Progress.</p>
            <h2 className="mt-6 text-4xl leading-[1.13] tracking-tight md:text-5xl" style={{ fontFamily: `"${safeFont(system.typography.headingFont)}", serif`, fontWeight: Number(system.typography.headingWeight) }}>{headline || 'A clear vision.\nAn enduring impact.'}</h2>
            <p className="mt-6 max-w-md text-sm leading-7" style={{ color: system.colors.textMuted }}>{summary || 'A distinctive digital presence, designed around your client’s purpose and built to grow with their business.'}</p>
            <span className="mt-8 inline-flex items-center gap-5 border-b pb-2 text-xs font-semibold" style={{ borderColor: system.colors.accent }}>Explore our capabilities <ArrowRight size={15} /></span>
          </div>
          <div className="border-t px-7 py-8 md:px-10" style={{ background: system.colors.surface, borderColor: system.colors.hairline }}><p className="mb-5 text-[10px] uppercase tracking-[.18em]" style={{ color: system.colors.textMuted }}>A connected experience</p><div className="grid grid-cols-3 gap-4">{['A clear identity', 'Considered details', 'Room to grow'].map((label, i) => <div key={label}><span className="text-[10px]" style={{ color: system.colors.textMuted }}>0{i + 1}</span><h3 className="mt-3 text-sm font-semibold" style={{ fontFamily: `"${safeFont(system.typography.headingFont)}", serif` }}>{label}</h3><div className="mt-5 h-1 w-8" style={{ background: system.colors.accent }} /></div>)}</div></div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"><ShieldCheck size={19} className="shrink-0 text-emerald-600" /><p className="text-xs leading-5 text-slate-500"><strong className="text-slate-700">Built for a careful handover.</strong> Creation saves drafts. Client review, approval and publishing remain separate steps.</p></div>
      </aside>
    </div>
  </div>;
}
