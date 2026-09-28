import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import type { Website, BrandKit, PageComposition } from '@/lib/studio/types';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';

interface PageProps {
  params: Promise<{ siteSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteSlug } = await params;
  const db = getDb();
  const siteRes = await db.execute({
    sql: `SELECT * FROM websites WHERE slug = ? LIMIT 1`,
    args: [siteSlug]
  });

  if (siteRes.rows.length === 0) {
    return { title: 'Site Not Found | Move Studio' };
  }

  const site = siteRes.rows[0];
  const settings = typeof site.settings_json === 'string' ? JSON.parse(site.settings_json) : (site.settings_json || {});
  const siteName = (site.name as string) || 'Client Website';
  const tagline = settings.tagline || 'Move Studio Created Experience';

  return {
    title: `${siteName} — ${tagline}`,
    description: `${siteName} official website. Powered by Move Studio.`,
    robots: { index: false, follow: false }
  };
}

export default async function DynamicSitePage({ params, searchParams }: PageProps) {
  const { siteSlug } = await params;
  const { preview } = await searchParams;
  const isDraftPreview = preview === 'true' || preview === '1';

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
  const settings = typeof siteRow.settings_json === 'string' ? JSON.parse(siteRow.settings_json) : (siteRow.settings_json || {});

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

  // 3. Fetch Page Composition for 'home'
  const compRes = await db.execute({
    sql: `SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = 'home' ORDER BY version DESC LIMIT 1`,
    args: [siteRow.id]
  });

  if (compRes.rows.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">{siteRow.name as string}</h1>
          <p className="text-slate-400 text-sm">
            This website is currently being assembled in Move Studio. Open the Visual Editor to publish its initial page composition.
          </p>
          <a
            href="/admin/editor"
            className="inline-block px-5 py-2.5 rounded-lg bg-sky-500 text-white text-xs font-semibold"
          >
            Open in Move Studio Editor
          </a>
        </div>
      </div>
    );
  }

  const compRow = compRes.rows[0];
  const sections = typeof compRow.sections_json === 'string' ? JSON.parse(compRow.sections_json) : (compRow.sections_json || []);
  const collection = (siteRow.design_collection_id as any) || 'contemporary';

  // Extract dynamic colors for inline theme vars
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
            href={`/admin/editor?siteId=${siteRow.id}`}
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

      {/* Floating Move Studio Attribution / Switcher */}
      <div className="fixed bottom-4 right-4 z-40">
        <a
          href="/admin"
          className="group flex items-center space-x-2 px-3.5 py-2 rounded-full bg-[#0F172A]/90 hover:bg-[#0F172A] border border-slate-700 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md shadow-lg transition"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Move Studio</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 group-hover:text-sky-300">Open Studio</span>
        </a>
      </div>
    </div>
  );
}
