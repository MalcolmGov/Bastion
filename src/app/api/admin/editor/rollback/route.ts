import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { assertSiteAccess, requirePermission, requireUser } from '@/lib/auth/guard';

/**
 * Page Composition Rollback API
 * Restores a page composition to any previous immutable historical version,
 * creating an explicit audit-tracked rollback version.
 */
export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    const permGate = await requirePermission('content:edit');
    if (!permGate.ok) {
      return NextResponse.json({ error: 'Forbidden: content:edit permission required to roll back.' }, { status: 403 });
    }

    const body = await req.json();
    const { siteId, pageSlug = 'home', targetVersion } = body;

    if (!siteId || targetVersion === undefined || targetVersion === null) {
      return NextResponse.json({ error: 'siteId and targetVersion are required' }, { status: 400 });
    }

    const targetVerNum = parseInt(String(targetVersion), 10);
    if (isNaN(targetVerNum) || targetVerNum <= 0) {
      return NextResponse.json({ error: 'Invalid targetVersion number' }, { status: 400 });
    }

    const siteGate = await assertSiteAccess(gate.user, siteId);
    if (!siteGate.ok) return siteGate.response;

    const db = getDb();
    const now = new Date().toISOString();

    // 1. Fetch target version snapshot from page_versions
    const targetRes = await db.execute({
      sql: `SELECT * FROM page_versions WHERE site_id = ? AND page_slug = ? AND version = ? LIMIT 1`,
      args: [siteId, pageSlug, targetVerNum],
    });

    if (targetRes.rows.length === 0) {
      return NextResponse.json(
        { error: `Version ${targetVerNum} does not exist for page '${pageSlug}'` },
        { status: 404 }
      );
    }

    const targetRow: any = targetRes.rows[0];

    // 2. Fetch current composition to calculate next version number
    const currentRes = await db.execute({
      sql: `SELECT id, version FROM page_compositions WHERE site_id = ? AND page_slug = ? LIMIT 1`,
      args: [siteId, pageSlug],
    });

    const currentVersion = currentRes.rows.length > 0 ? Number(currentRes.rows[0].version || 1) : 0;
    const newVersion = currentVersion + 1;
    const compId = currentRes.rows.length > 0 ? String(currentRes.rows[0].id) : `comp_${siteId}_${pageSlug}`;

    // 3. Update page_compositions with restored snapshot
    await db.execute({
      sql: `INSERT OR REPLACE INTO page_compositions (id, site_id, page_slug, title, layout_collection, sections_json, meta_json, version, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        compId,
        siteId,
        pageSlug,
        targetRow.title || 'Page',
        targetRow.layout_collection || 'contemporary',
        targetRow.sections_json,
        targetRow.meta_json || null,
        newVersion,
        'draft', // Rollbacks default to draft for safe review before publishing
        now,
        now,
      ],
    });

    // 4. Record new version snapshot representing the rollback
    const versionId = `pver_${siteId}_${pageSlug}_v${newVersion}`;
    const rollbackSummary = `Rolled back to version ${targetVerNum} (originally created ${new Date(targetRow.created_at).toLocaleDateString()})`;

    await db.execute({
      sql: `INSERT INTO page_versions (id, composition_id, site_id, page_slug, version, title, layout_collection, sections_json, meta_json, status, created_by, created_by_name, change_summary, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        versionId,
        compId,
        siteId,
        pageSlug,
        newVersion,
        targetRow.title || 'Page',
        targetRow.layout_collection || 'contemporary',
        targetRow.sections_json,
        targetRow.meta_json || null,
        'draft',
        gate.user.id,
        gate.user.name,
        rollbackSummary,
        now,
      ],
    });

    // 5. Audit Log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `audit_${Date.now()}`,
        gate.user.id,
        gate.user.name,
        'page_composition_rollback',
        'page_compositions',
        compId,
        `success: v${targetVerNum} -> v${newVersion}`,
        now,
      ],
    });

    let restoredSections = [];
    try {
      restoredSections = typeof targetRow.sections_json === 'string'
        ? JSON.parse(targetRow.sections_json)
        : targetRow.sections_json;
    } catch {
      restoredSections = [];
    }

    return NextResponse.json({
      success: true,
      compositionId: compId,
      rolledBackToVersion: targetVerNum,
      newVersion,
      sections: restoredSections,
      title: targetRow.title,
      status: 'draft',
      summary: rollbackSummary,
      savedAt: now,
    });
  } catch (err: any) {
    console.error('Rollback error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
