import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, clientOwns } from '@/lib/auth/guard';
import { ensureDbReady } from '@/lib/db/client';
import {
  saveComposition,
  EditorSaveError,
} from '@/lib/studio/editor/saveComposition';

export async function POST(req: NextRequest) {
  const gate = await requirePermission('content:edit');
  if (!gate.ok) return gate.response;
  try {
    const {
      siteId,
      pageSlug = 'home',
      targetVersion,
      expectedVersion,
    } = await req.json();
    if (
      typeof siteId !== 'string' ||
      !Number.isSafeInteger(targetVersion) ||
      targetVersion < 1
    )
      return NextResponse.json(
        { error: 'Choose a website and valid version to restore.' },
        { status: 400 },
      );
    const db = await ensureDbReady();
    const site = (
      await db.execute({
        sql: 'SELECT id,client_id FROM websites WHERE id = ? OR slug = ? LIMIT 1',
        args: [siteId, siteId],
      })
    ).rows[0];
    if (!site || !clientOwns(gate.user, String(site.client_id)))
      return NextResponse.json(
        { error: 'Website not found.' },
        { status: 404 },
      );
    const target = (
      await db.execute({
        sql: 'SELECT * FROM page_versions WHERE site_id = ? AND page_slug = ? AND version = ?',
        args: [site.id, pageSlug, targetVersion],
      })
    ).rows[0];
    if (!target)
      return NextResponse.json(
        { error: 'This page version was not found.' },
        { status: 404 },
      );
    const sections = JSON.parse(String(target.sections_json));
    const summary = `Restored version ${targetVersion} as a new draft`;
    const result = await saveComposition(gate.user, {
      siteId: String(site.id),
      pageSlug,
      sections,
      expectedVersion,
      title: String(target.title),
      layoutCollection: String(target.layout_collection),
      meta: target.meta_json ? JSON.parse(String(target.meta_json)) : null,
      status: 'draft',
      changeSummary: summary,
    });
    return NextResponse.json({
      ...result,
      newVersion: result.version,
      rolledBackToVersion: targetVersion,
      sections,
      status: 'draft',
      summary,
    });
  } catch (error) {
    if (error instanceof EditorSaveError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error('[Editor restore]', error);
    return NextResponse.json(
      {
        error: 'This version could not be restored. Your edits are still here.',
      },
      { status: 500 },
    );
  }
}
