import { notFound } from 'next/navigation';
import { requirePermission, clientOwns } from '@/lib/auth/guard';
import { ensureDbReady } from '@/lib/db/client';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';
import type { DesignCollectionId, SectionInstance } from '@/lib/studio/types';

export const dynamic = 'force-dynamic';

export default async function EditorSavedPreview({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string; pageSlug?: string }>;
}) {
  const gate = await requirePermission('content:read');
  if (!gate.ok) notFound();
  const { siteId, pageSlug = 'home' } = await searchParams;
  if (!siteId) notFound();
  const db = await ensureDbReady();
  const site = (
    await db.execute({
      sql: 'SELECT * FROM websites WHERE id = ?',
      args: [siteId],
    })
  ).rows[0];
  if (!site || !clientOwns(gate.user, String(site.client_id))) notFound();
  const page = (
    await db.execute({
      sql: 'SELECT * FROM page_compositions WHERE site_id = ? AND page_slug = ?',
      args: [site.id, pageSlug],
    })
  ).rows[0];
  if (!page) notFound();
  const sections = JSON.parse(String(page.sections_json)) as SectionInstance[];
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        Draft preview · {String(site.name)} · {String(page.title)} · v
        {Number(page.version)}
      </div>
      {sections.map((section) => (
        <StudioComponentRenderer
          key={section.id}
          section={section}
          collection={page.layout_collection as DesignCollectionId}
        />
      ))}
    </div>
  );
}
