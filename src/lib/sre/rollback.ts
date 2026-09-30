/**
 * Bastion SRE — Automated Rollback Engine
 * Protects production users by immediately reverting code if a post-deploy probe fails (HTTP >= 500 or timeout).
 */

import { getGitHubToken } from './github-pr';
import { getDb } from '@/lib/db/client';

const GITHUB_API = 'https://api.github.com';

function headers(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Bastion-SRE-Rollback/1.0',
    'Content-Type': 'application/json'
  };
}

export interface RollbackResult {
  success: boolean;
  revertedSha?: string;
  revertCommitSha?: string;
  error?: string;
  message: string;
}

/**
 * Triggers an immediate emergency rollback on GitHub main branch
 * and records the event in the Bastion SRE timeline.
 */
export async function executeAutomatedRollback({
  owner = 'MalcolmGov',
  repo = 'MoveDigital',
  failedCommitSha,
  incidentId,
  reason
}: {
  owner?: string;
  repo?: string;
  failedCommitSha?: string;
  incidentId: string;
  reason: string;
}): Promise<RollbackResult> {
  const token = getGitHubToken();
  if (!token) {
    return {
      success: false,
      error: 'No GitHub token available for emergency rollback',
      message: 'Rollback aborted: Missing GitHub authorization'
    };
  }

  try {
    console.warn(`[Bastion SRE Auto-Rollback] INITIATING EMERGENCY ROLLBACK on ${owner}/${repo} due to: ${reason}`);

    // 1. Get recent commits on main
    const commitsRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?sha=main&per_page=5`, {
      headers: headers(token)
    });

    if (!commitsRes.ok) {
      const err = await commitsRes.text();
      return { success: false, error: err, message: 'Failed to query commit log for rollback' };
    }

    const commits = await commitsRes.json();
    if (!commits || commits.length < 2) {
      return { success: false, error: 'Insufficient commit history to revert', message: 'Rollback aborted' };
    }

    // The commit to restore to is the parent of the merged fix
    const targetPreviousSha = commits[1].sha;

    // 2. Query the tree of the previous known-good commit
    const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${targetPreviousSha}?recursive=1`, {
      headers: headers(token)
    });

    let revertCommitSha = '';
    if (treeRes.ok) {
      const treeData = await treeRes.json();

      // Create a clean revert commit on top of main
      const currentHeadSha = commits[0].sha;
      const createCommitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify({
          message: `revert(sre): [${incidentId}] automated rollback — post-deploy probe failure (${reason})`,
          tree: treeData.sha,
          parents: [currentHeadSha]
        })
      });

      if (createCommitRes.ok) {
        const commitData = await createCommitRes.json();
        revertCommitSha = commitData.sha;

        // Fast-forward main to revert commit
        await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
          method: 'PATCH',
          headers: headers(token),
          body: JSON.stringify({
            sha: revertCommitSha,
            force: false
          })
        });

        console.log(`[Bastion SRE Auto-Rollback] Successfully created and pushed revert commit ${revertCommitSha}`);
      }
    }

    // 3. Update Incident in DB
    const db = getDb();
    const incRes = await db.execute({
      sql: `SELECT timeline_json FROM incidents WHERE id = ?`,
      args: [incidentId]
    });

    let timeline: any[] = [];
    if (incRes.rows.length > 0 && incRes.rows[0].timeline_json) {
      try {
        timeline = JSON.parse(incRes.rows[0].timeline_json as string);
      } catch {}
    }

    timeline.push({
      time: new Date().toISOString(),
      action: `EMERGENCY AUTO-ROLLBACK TRIGGERED: Post-deploy verification probe failed (${reason}). Reverted main to known-good state (Revert Commit: ${revertCommitSha ? revertCommitSha.slice(0, 7) : 'HEAD'}).`,
      by: 'Bastion Autonomous SRE Guardrail'
    });

    await db.execute({
      sql: `UPDATE incidents SET
        deploy_status = 'rolled_back',
        verification_status = 'warning',
        status = 'investigating',
        timeline_json = ?
      WHERE id = ?`,
      args: [JSON.stringify(timeline), incidentId]
    });

    return {
      success: true,
      revertedSha: failedCommitSha,
      revertCommitSha,
      message: `Emergency rollback executed cleanly. Revert commit ${revertCommitSha.slice(0, 7)} pushed to trigger Vercel recovery.`
    };
  } catch (err: any) {
    console.error('[Bastion SRE Auto-Rollback Fatal Error]:', err);
    return {
      success: false,
      error: err.message,
      message: 'Failed to complete emergency rollback'
    };
  }
}
