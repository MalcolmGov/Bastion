import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftPreviewActive } from '@/lib/auth/draftPreview';
import { getPublishedComposition } from '@/lib/studio/editor/publishedComposition';
import { getDb } from '@/lib/db/client';
import type { BrandKit } from '@/lib/studio/types';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';

interface SubPageProps {
  params: Promise<{ siteSlug: string; pageSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params, searchParams }: SubPageProps): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  const sParams = await searchParams;
  const isPreview = sParams.preview === 'true';

  const db = getDb();
  const siteRes = await db.execute({
    sql: `SELECT * FROM websites WHERE slug = ? LIMIT 1`,
    args: [siteSlug]
  });

  if (siteRes.rows.length === 0) {
    return { title: { absolute: 'Page Not Found | Bastion Studio' } };
  }

  const site = siteRes.rows[0];
  const siteName = (site.name as string) || 'Client Website';

  const compRes = await getPublishedComposition(db, String(site.id), pageSlug);

  const pageTitle = compRes.rows.length > 0 ? String(compRes.rows[0].title) : pageSlug.toUpperCase();

  return {
    title: { absolute: `${pageTitle} — ${siteName}` },
    description: `${pageTitle} overview on ${siteName}. Powered by Bastion Studio.`,
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
    alternates: {
      canonical: site.primary_domain
        ? `https://${site.primary_domain}/${pageSlug}`
        : `https://zaraai.digital/sites/${siteSlug}/${pageSlug}`
    }
  };
}

export default async function DynamicSiteSubPage({ params, searchParams }: SubPageProps) {
  const { siteSlug, pageSlug } = await params;
  const sParams = await searchParams;
  const db = getDb();

  // 1. Fetch website by slug
  const siteRes = await db.execute({
    sql: `SELECT * FROM websites WHERE slug = ? LIMIT 1`,
    args: [siteSlug]
  });

  if (siteRes.rows.length === 0) {
    notFound();
  }

  const siteRow = siteRes.rows[0];
  // Draft mode is only a cookie: show drafts only to someone who may see this client's unpublished work.
  const isDraftPreview = await draftPreviewActive(siteRow);

  // 2. Fetch Brand Kit
  const brandRes = await db.execute({
    sql: `SELECT * FROM brand_kits WHERE site_id = ? ORDER BY version DESC LIMIT 1`,
    args: [siteRow.id]
  });

  let brandKit: Partial<BrandKit> = {};
  if (brandRes.rows.length > 0) {
    const bRow = brandRes.rows[0];
    brandKit = {
      colors: typeof bRow.colors_json === 'string' ? JSON.parse(bRow.colors_json) : bRow.colors_json,
      typography: typeof bRow.typography_json === 'string' ? JSON.parse(bRow.typography_json) : bRow.typography_json,
      componentRules: typeof bRow.component_rules_json === 'string' ? JSON.parse(bRow.component_rules_json) : bRow.component_rules_json,
      voiceAndMessaging: typeof bRow.voice_and_messaging_json === 'string' ? JSON.parse(bRow.voice_and_messaging_json) : bRow.voice_and_messaging_json,
    };
  }

  // 3. Fetch Page Composition for pageSlug
  const compRes = isDraftPreview
    ? await db.execute({ sql: 'SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ? ORDER BY version DESC LIMIT 1', args: [siteRow.id,pageSlug] })
    : await getPublishedComposition(db, String(siteRow.id), pageSlug);

  if (compRes.rows.length === 0) {
    notFound();
  }

  const compRow = compRes.rows[0];
  const sections = typeof compRow.sections_json === 'string' ? JSON.parse(compRow.sections_json) : (compRow.sections_json || []);
  const collection = (siteRow.design_collection_id as any) || 'contemporary';

  const primaryColor = brandKit.colors?.primary?.value || '#0F172A';
  const accentColor = brandKit.colors?.accent?.value || '#0284C7';
  const bgColor = brandKit.colors?.background?.value || '#F8FAFC';

  return (
    <div
      className="min-h-screen flex flex-col transition-colors selection:bg-sky-500 selection:text-white"
      style={{
        backgroundColor: bgColor,
        ['--brand-primary' as any]: primaryColor,
        ['--brand-accent' as any]: accentColor,
      }}
    >
      {/* Draft Mode Ribbon if previewing */}
      {isDraftPreview && (
        <div className="bg-amber-600 text-black px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-sm sticky top-0 z-50">
          <span>⚠️ DRAFT PREVIEW MODE — You are viewing unapproved changes for {siteRow.name as string}</span>
          <a
            href={`/admin/editor?siteId=${siteRow.id}&page=${pageSlug}`}
            className="underline ml-2 hover:text-white transition"
          >
            Return to Editor
          </a>
        </div>
      )}

      {/* Render Composed Sections */}
      <main className="flex-1">
        {sections.map((section: any) => (
          <StudioComponentRenderer
            key={section.id}
            section={section}
            collection={collection}
          />
        ))}
      </main>

      {/* Floating Bastion Studio Attribution */}
      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="/admin"
          className="group flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#0F172A]/90 hover:bg-[#0F172A] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md shadow-lg transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Bastion Studio</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 group-hover:text-sky-300">Open Studio</span>
        </a>
      </div>
    </div>
  );
}
