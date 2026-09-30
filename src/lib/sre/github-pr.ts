/**
 * Bastion SRE — GitHub Automated Pull Request & Branching Client
 * Ported & enhanced from MalcolmGov/CODEVIZ backend/core/github_pr.py
 * Handles automated branch creation, file commits via GitHub API,
 * Pull Request creation, merging, and closure.
 */

import { execSync } from 'child_process';
import { getDb } from '@/lib/db/client';

export interface GitHubPROperationResult {
  success: boolean;
  pr_url?: string;
  pr_number?: number;
  branch?: string;
  base?: string;
  files_changed?: string[];
  error?: string;
  sha?: string;
}

export function getGitHubToken(): string | null {
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8', timeout: 3000 }).trim();
    if (token && token.length > 8) return token;
  } catch {
    // fallback to DB token
  }

  try {
    const db = getDb();
    const rows = (db as any).prepare
      ? (db as any).prepare('SELECT access_token FROM developer_github_integrations ORDER BY last_used_at DESC LIMIT 1').all()
      : null;
    if (rows && rows.length > 0 && rows[0].access_token) {
      return rows[0].access_token;
    }
  } catch {
    // ignore
  }

  return process.env.GITHUB_TOKEN || null;
}

const GITHUB_API = 'https://api.github.com';

function headers(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Bastion-SRE-AutoFix/1.0',
    'Content-Type': 'application/json'
  };
}

export async function openFixPR({
  owner = 'MalcolmGov',
  repo = 'Goldfields',
  baseBranch = 'main',
  fileChanges,
  title,
  body
}: {
  owner?: string;
  repo?: string;
  baseBranch?: string;
  fileChanges: Record<string, string>; // relativePath -> newFullContent
  title: string;
  body: string;
}): Promise<GitHubPROperationResult> {
  const token = getGitHubToken();
  if (!token) {
    return { success: false, error: 'No GitHub token available. Ensure gh CLI is authenticated or connect GitHub in Bastion.' };
  }

  if (Object.keys(fileChanges).length === 0) {
    return { success: false, error: 'No file changes provided to commit.' };
  }

  try {
    // 1. Get base branch commit SHA
    const baseRefRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, {
      headers: headers(token)
    });

    if (!baseRefRes.ok) {
      const err = await baseRefRes.text();
      return { success: false, error: `Failed to fetch base branch '${baseBranch}': ${err}` };
    }

    const baseRefData = await baseRefRes.json();
    const baseSha = baseRefData.object.sha;

    // 2. Create new SRE branch
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const branchName = `sre/auto-fix-${timestamp}`;

    const createRefRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      })
    });

    if (!createRefRes.ok) {
      const err = await createRefRes.text();
      return { success: false, error: `Failed to create branch '${branchName}': ${err}` };
    }

    // 3. Commit file changes onto the new branch
    const committedFiles: string[] = [];

    for (const [filePath, newContent] of Object.entries(fileChanges)) {
      // Get existing file sha if it exists
      let fileSha: string | undefined = undefined;
      const getFileRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branchName}`, {
        headers: headers(token)
      });
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        fileSha = fileData.sha;
      }

      // Update file via GitHub API
      const contentBase64 = Buffer.from(newContent, 'utf-8').toString('base64');
      const updateRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({
          message: `sre(auto-fix): remediate anomaly in ${filePath}`,
          content: contentBase64,
          branch: branchName,
          ...(fileSha ? { sha: fileSha } : {})
        })
      });

      if (updateRes.ok) {
        committedFiles.push(filePath);
      } else {
        const err = await updateRes.text();
        console.warn(`[Bastion SRE] Failed to commit ${filePath}: ${err}`);
      }
    }

    if (committedFiles.length === 0) {
      return { success: false, error: 'Failed to commit any files to the SRE branch.' };
    }

    // 4. Create Pull Request
    const prRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        title,
        body,
        head: branchName,
        base: baseBranch
      })
    });

    if (!prRes.ok) {
      const err = await prRes.text();
      return {
        success: false,
        error: `Branch pushed but PR creation failed: ${err}`,
        branch: branchName,
        files_changed: committedFiles
      };
    }

    const prData = await prRes.json();

    return {
      success: true,
      pr_url: prData.html_url,
      pr_number: prData.number,
      branch: branchName,
      base: baseBranch,
      files_changed: committedFiles
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error opening GitHub PR' };
  }
}

export async function mergeFixPR({
  owner = 'MalcolmGov',
  repo = 'Goldfields',
  prNumber,
  commitMessage
}: {
  owner?: string;
  repo?: string;
  prNumber: number;
  commitMessage?: string;
}): Promise<{ success: boolean; merged?: boolean; error?: string; sha?: string }> {
  const token = getGitHubToken();
  if (!token) return { success: false, error: 'No GitHub token available' };

  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify({
        commit_title: `sre: merged autonomous fix (PR #${prNumber})`,
        commit_message: commitMessage || 'Approved and merged via Bastion Autonomous SRE Human-in-the-Loop Console.',
        merge_method: 'squash'
      })
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Failed to merge PR #${prNumber}: ${err}` };
    }

    const data = await res.json();
    return { success: true, merged: data.merged, sha: data.sha };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function closeFixPR({
  owner = 'MalcolmGov',
  repo = 'Goldfields',
  prNumber
}: {
  owner?: string;
  repo?: string;
  prNumber: number;
}): Promise<{ success: boolean; closed?: boolean; error?: string }> {
  const token = getGitHubToken();
  if (!token) return { success: false, error: 'No GitHub token available' };

  try {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ state: 'closed' })
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Failed to close PR #${prNumber}: ${err}` };
    }

    return { success: true, closed: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Poll GitHub Deployments API to verify real cloud hosting (e.g. Vercel / GitHub Actions)
 * build & rollout status following a PR merge.
 */
export async function pollDeploymentStatus({
  owner = 'MalcolmGov',
  repo = 'MoveDigital',
  commitSha,
  maxWaitSec = 40,
  pollIntervalMs = 2500
}: {
  owner?: string;
  repo?: string;
  commitSha?: string;
  maxWaitSec?: number;
  pollIntervalMs?: number;
}): Promise<{
  status: 'success' | 'failure' | 'in_progress' | 'unknown';
  targetUrl?: string;
  description?: string;
  environment?: string;
}> {
  const token = getGitHubToken();
  if (!token) return { status: 'unknown', description: 'No GitHub token available' };

  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitSec * 1000) {
    try {
      const depRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/deployments?per_page=5`, {
        headers: headers(token)
      });

      if (depRes.ok) {
        const deployments = await depRes.json();
        const matched = commitSha
          ? deployments.find((d: any) => d.sha === commitSha)
          : deployments[0];

        if (matched) {
          const statusRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/deployments/${matched.id}/statuses`, {
            headers: headers(token)
          });

          if (statusRes.ok) {
            const statuses = await statusRes.json();
            if (statuses.length > 0) {
              const latest = statuses[0];
              if (latest.state === 'success') {
                return {
                  status: 'success',
                  targetUrl: latest.environment_url || latest.target_url,
                  description: latest.description || 'Cloud deployment completed successfully',
                  environment: latest.environment || 'Production'
                };
              }
              if (latest.state === 'failure' || latest.state === 'error') {
                return {
                  status: 'failure',
                  targetUrl: latest.target_url,
                  description: latest.description || 'Cloud deployment build failed',
                  environment: latest.environment || 'Production'
                };
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.warn('[Bastion SRE Deployment Poll Warning]:', err.message);
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  return {
    status: 'in_progress',
    description: 'Cloud deployment build queued/running asynchronously on host (Vercel/Actions)'
  };
}

