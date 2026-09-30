import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/client';
import { diagnoseAndGeneratePatch } from '@/lib/sre/engine';
import { openFixPR } from '@/lib/sre/github-pr';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { incidentId, customPrompt } = body;

    if (!incidentId) {
      return NextResponse.json({ error: 'incidentId is required' }, { status: 400 });
    }

    const db = getDb();
    const result = await db.execute({
      sql: `SELECT * FROM incidents WHERE id = ?`,
      args: [incidentId]
    });

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    const incident: any = result.rows[0];

    const repoOwner = body.repoOwner || incident.repo_owner || 'MalcolmGov';
    const repoName = body.repoName || incident.repo_name ||
      (incident.affected_routes?.includes('movedigital') || incident.title.toLowerCase().includes('move') || incident.title.toLowerCase().includes('tailings') ? 'MoveDigital' : 'Goldfields');

    // 1. Run AI Diagnosis & Patch Generation
    const diagnosisResult = await diagnoseAndGeneratePatch({
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      affectedRoutes: incident.affected_routes,
      errorDetails: incident.error_details,
      customPrompt,
      repoOwner,
      repoName
    });

    const patch = diagnosisResult.patch;

    // 2. Open GitHub PR via GitHub API
    const prResult = await openFixPR({
      owner: repoOwner,
      repo: repoName,
      baseBranch: 'main',
      fileChanges: {
        [patch.filePath]: patch.fullNewContent
      },
      title: diagnosisResult.prTitle,
      body: diagnosisResult.prBody
    });

    const prNumber = prResult.pr_number || null;
    const prUrl = prResult.pr_url || null;
    const prBranch = prResult.branch || null;
    const prStatus = prResult.success ? 'open' : 'failed';

    // 3. Update Incident in DB
    const timeline = incident.timeline_json ? JSON.parse(incident.timeline_json) : [];
    timeline.push({
      time: new Date().toISOString(),
      action: prResult.success
        ? `AI SRE generated patch and opened GitHub PR #${prNumber} on ${repoOwner}/${repoName} (branch: ${prBranch})`
        : `AI SRE generated patch for ${repoOwner}/${repoName} (PR creation warning: ${prResult.error})`,
      by: user.email
    });

    await db.execute({
      sql: `UPDATE incidents SET
        repo_owner = ?,
        repo_name = ?,
        ai_diagnosis = ?,
        ai_proposed_patch = ?,
        risk_level = ?,
        pr_number = ?,
        pr_url = ?,
        pr_branch = ?,
        pr_status = ?,
        approval_status = 'pending_review',
        status = 'investigating',
        timeline_json = ?
      WHERE id = ?`,
      args: [
        repoOwner,
        repoName,
        diagnosisResult.diagnosis,
        JSON.stringify(patch),
        patch.riskLevel,
        prNumber,
        prUrl,
        prBranch,
        prStatus,
        JSON.stringify(timeline),
        incidentId
      ]
    });

    return NextResponse.json({
      success: true,
      incidentId,
      repoOwner,
      repoName,
      diagnosis: diagnosisResult.diagnosis,
      patch,
      prResult,
      prNumber,
      prUrl,
      prBranch,
      prStatus
    });
  } catch (error: any) {
    console.error('[Bastion SRE Diagnose & Fix Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
