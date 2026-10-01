import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { clientOwns } from '@/lib/auth/guard';
import { computeRecordDiff, generateContentHash } from '@/lib/diff/diffEngine';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collection, id } = await context.params;
    const { searchParams } = new URL(req.url);
    const customFromRev = searchParams.get('fromRev');
    const customToRev = searchParams.get('toRev');

    const db = getDb();

    // 1. Fetch content record
    const recordRes = await db.execute({
      sql: `SELECT r.*, u.name as owner_name, c.name as client_name 
            FROM content_records r
            LEFT JOIN users u ON r.owner_id = u.id
            LEFT JOIN clients c ON r.client_id = c.id
            WHERE r.collection = ? AND r.id = ? LIMIT 1`,
      args: [collection, id],
    });

    if (recordRes.rows.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const record = recordRes.rows[0];
    if (!clientOwns(user, record.client_id ? String(record.client_id) : null)) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const draftRevId = customToRev || String(record.current_draft_revision_id || '');
    const publishedRevId = customFromRev || String(record.current_published_revision_id || '');

    // 2. Fetch draft revision
    let draftRevision: any = null;
    let draftData: any = {};
    if (draftRevId) {
      const draftRes = await db.execute({
        sql: `SELECT rev.*, u.name as author_name, u.role as author_role
              FROM revisions rev
              LEFT JOIN users u ON rev.author_id = u.id
              WHERE rev.id = ? LIMIT 1`,
        args: [draftRevId],
      });
      if (draftRes.rows.length > 0) {
        draftRevision = draftRes.rows[0];
        try {
          draftData = JSON.parse(String(draftRevision.data_json || '{}'));
        } catch {
          draftData = {};
        }
      }
    }

    // 3. Fetch published revision
    let publishedRevision: any = null;
    let publishedData: any = {};
    if (publishedRevId) {
      const pubRes = await db.execute({
        sql: `SELECT rev.*, u.name as author_name, u.role as author_role
              FROM revisions rev
              LEFT JOIN users u ON rev.author_id = u.id
              WHERE rev.id = ? LIMIT 1`,
        args: [publishedRevId],
      });
      if (pubRes.rows.length > 0) {
        publishedRevision = pubRes.rows[0];
        try {
          publishedData = JSON.parse(String(publishedRevision.data_json || '{}'));
        } catch {
          publishedData = {};
        }
      }
    }

    // 4. Compute structured diff
    const diffResult = computeRecordDiff(publishedData, draftData);

    // 5. Determine Two-Person Rule eligibility
    const isSensitive = collection === 'reports' || collection === 'news' || collection === 'results' || collection === 'sens';
    const isAuthor = draftRevision?.author_id === user.id;
    const twoPersonRuleApplies = isSensitive && isAuthor;

    // 6. Fetch Approvals history
    const approvalsRes = await db.execute({
      sql: `SELECT a.*, u.name as reviewer_name, u.role as reviewer_role
            FROM approvals a
            LEFT JOIN users u ON a.reviewer_id = u.id
            WHERE a.revision_id = ?
            ORDER BY a.created_at DESC`,
      args: [draftRevId || 'none'],
    });

    return NextResponse.json({
      success: true,
      record: {
        id: String(record.id),
        collection: String(record.collection),
        slug: String(record.slug),
        title: String(record.title),
        status: String(record.status),
        clientId: record.client_id ? String(record.client_id) : null,
        clientName: record.client_name ? String(record.client_name) : 'Corporate Enterprise',
        ownerName: record.owner_name ? String(record.owner_name) : 'Content Author',
        updatedAt: String(record.updated_at),
      },
      publishedRevision: publishedRevision
        ? {
            id: String(publishedRevision.id),
            revisionNumber: Number(publishedRevision.revision_number),
            contentHash: String(publishedRevision.content_hash),
            authorName: String(publishedRevision.author_name || 'System / Prior Author'),
            createdAt: String(publishedRevision.created_at),
            data: publishedData,
          }
        : null,
      draftRevision: draftRevision
        ? {
            id: String(draftRevision.id),
            revisionNumber: Number(draftRevision.revision_number),
            contentHash: String(draftRevision.content_hash || generateContentHash(draftData)),
            authorId: String(draftRevision.author_id),
            authorName: String(draftRevision.author_name || 'Current Editor'),
            authorRole: String(draftRevision.author_role || 'editor'),
            status: String(draftRevision.status),
            reviewComments: draftRevision.review_comments ? String(draftRevision.review_comments) : null,
            createdAt: String(draftRevision.created_at),
            data: draftData,
          }
        : null,
      diffSummary: {
        totalAdditions: diffResult.totalAdditions,
        totalDeletions: diffResult.totalDeletions,
        fieldsChanged: diffResult.fieldsChanged,
        contentHashChanged: publishedRevision?.content_hash !== draftRevision?.content_hash,
      },
      fieldDiffs: diffResult.fieldDiffs,
      governance: {
        isSensitive,
        isAuthor,
        twoPersonRuleApplies,
        twoPersonMessage: twoPersonRuleApplies
          ? 'Two-Person Governance Rule Active: As the author of this sensitive financial disclosure, your role is locked to review-only. An independent Compliance Officer or Executive Director must sign off.'
          : 'Eligible for regulatory sign-off.',
        approvals: approvalsRes.rows.map((a: any) => ({
          id: String(a.id),
          reviewerName: String(a.reviewer_name || 'Auditor'),
          reviewerRole: String(a.reviewer_role || 'reviewer'),
          decision: String(a.decision),
          comment: a.comment ? String(a.comment) : null,
          contentHashAtApproval: a.content_hash_at_approval ? String(a.content_hash_at_approval) : null,
          createdAt: String(a.created_at),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/content/[collection]/[id]/diff:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compute visual diff' },
      { status: 500 }
    );
  }
}
