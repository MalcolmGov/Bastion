import { createSign, randomUUID } from 'node:crypto';
import { getDb } from '@/lib/db/client';

export class OperationsError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export interface RepositoryLink {
  siteId: string; repository: string; repositoryId: number; installationId: number;
  branch: string; environment: string; revision: number; linkedAt: string;
}
export interface ActivityItem { title: string; detail: string; status: string; url: string; }
export interface OperationsSnapshot {
  link: RepositoryLink | null;
  app: { configured: boolean; installUrl: string | null };
  checkedAt?: string;
  connectionError?: string;
  activity?: { commits: ActivityItem[]; pulls: ActivityItem[]; builds: ActivityItem[]; deployments: ActivityItem[] };
  warnings?: string[];
}
const API = 'https://api.github.com';
const permissions = { contents: 'read', pull_requests: 'read', actions: 'read', deployments: 'read' };

export function appConfiguration() {
  const configured = !!(process.env.BASTION_GITHUB_APP_ID && process.env.BASTION_GITHUB_APP_PRIVATE_KEY);
  const slug = process.env.BASTION_GITHUB_APP_SLUG || '';
  return { configured, installUrl: /^[a-z0-9-]+$/.test(slug) ? `https://github.com/apps/${slug}/installations/new` : null };
}
export function appJwt(): string {
  if (!appConfiguration().configured) throw new OperationsError('Configure the Bastion GitHub App on the server before linking a repository.', 503);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iat: now - 60, exp: now + 540, iss: process.env.BASTION_GITHUB_APP_ID })).toString('base64url');
  try {
    const signer = createSign('RSA-SHA256');
    signer.update(`${header}.${payload}`);
    const signature = signer.sign(process.env.BASTION_GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, '\n'), 'base64url');
    return `${header}.${payload}.${signature}`;
  } catch { throw new OperationsError('The GitHub App signing key is invalid. Ask your platform administrator to check the server configuration.', 503); }
}

// Only fixed GitHub API paths; tokens never cross redirects or reach the browser.
async function github(path: string, token: string, body?: object): Promise<any> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, {
      method: body ? 'POST' : 'GET', redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10', 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch { throw new OperationsError('GitHub could not be reached. Retry shortly.', 502); }
  if (!response.ok) {
    if (response.status === 404) throw new OperationsError('Repository, branch, or installation is unavailable. Check the App installation and selected repositories.', 404);
    if (response.status === 401) throw new OperationsError('GitHub rejected the App credentials. Check the App configuration.', 502);
    if (response.status === 403 || response.status === 429) throw new OperationsError('GitHub access is restricted or rate limited. Check App permissions or retry later.', 503);
    throw new OperationsError('GitHub could not complete this request. Retry shortly.', 502);
  }
  return response.json();
}
export function parseRepository(value: unknown): string {
  if (typeof value !== 'string') throw new OperationsError('Enter a GitHub repository as owner/repository.');
  const match = /^(?:https:\/\/github\.com\/)?([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38}))\/([a-zA-Z0-9_.-]{1,100})\/?$/.exec(value.trim());
  if (!match || ['.', '..'].includes(match[2])) throw new OperationsError('Enter a GitHub repository as owner/repository or its github.com URL.');
  return `${match[1]}/${match[2].replace(/\.git$/, '')}`;
}
export function parseBranch(value: unknown): string {
  if (typeof value !== 'string' || value.length > 200 || !/^[a-zA-Z0-9_./-]+$/.test(value) || value.includes('..') || value.includes('//') || value.endsWith('/') || value.startsWith('/')) {
    throw new OperationsError('Enter a valid branch name.');
  }
  return value;
}
function safeUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com' && !url.username && !url.password ? url.href : ''; }
  catch { return ''; }
}
async function schema() {
  await getDb().batch([
    `CREATE TABLE IF NOT EXISTS website_github_links (site_id TEXT PRIMARY KEY, repository TEXT NOT NULL, repository_id INTEGER NOT NULL, installation_id INTEGER NOT NULL, branch TEXT NOT NULL, environment TEXT NOT NULL, revision INTEGER NOT NULL, linked_at TEXT NOT NULL, linked_by TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS website_github_audit (id TEXT PRIMARY KEY, site_id TEXT NOT NULL, actor_id TEXT NOT NULL, action TEXT NOT NULL, details_json TEXT NOT NULL, created_at TEXT NOT NULL)`,
  ]);
}
export async function readLink(siteId: string): Promise<RepositoryLink | null> {
  await schema();
  const result = await getDb().execute({ sql: 'SELECT * FROM website_github_links WHERE site_id = ?', args: [siteId] });
  const row = result.rows[0];
  if (!row) return null;
  return { siteId, repository: String(row.repository), repositoryId: Number(row.repository_id), installationId: Number(row.installation_id), branch: String(row.branch), environment: String(row.environment), revision: Number(row.revision), linkedAt: String(row.linked_at) };
}
async function installationToken(installationId: number, repositoryId: number): Promise<string> {
  const result = await github(`/app/installations/${installationId}/access_tokens`, appJwt(), { repository_ids: [repositoryId], permissions });
  if (typeof result.token !== 'string' || !result.token) throw new OperationsError('GitHub did not issue an installation token.', 502);
  return result.token;
}
async function persistLink(link: RepositoryLink, actor: string, expectedRevision: number, action: 'link' | 'unlink') {
  await schema();
  const db = getDb();
  await db.execute('SELECT 1'); // schema initialization precedes the transaction
  const tx = await db.transaction('write');
  try {
    const current = await tx.execute({ sql: 'SELECT revision FROM website_github_links WHERE site_id = ?', args: [link.siteId] });
    if (Number(current.rows[0]?.revision || 0) !== expectedRevision) throw new OperationsError('This repository connection changed. Refresh before saving.', 409);
    if (action === 'unlink') {
      await tx.execute({ sql: 'DELETE FROM website_github_links WHERE site_id = ?', args: [link.siteId] });
    } else {
      const history = await tx.execute({ sql: "SELECT MAX(json_extract(details_json, '$.revision')) AS revision FROM website_github_audit WHERE site_id = ?", args: [link.siteId] });
      link.revision = Number(history.rows[0]?.revision || 0) + 1;
      await tx.execute({ sql: `INSERT INTO website_github_links VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(site_id) DO UPDATE SET repository=excluded.repository, repository_id=excluded.repository_id, installation_id=excluded.installation_id, branch=excluded.branch, environment=excluded.environment, revision=excluded.revision, linked_at=excluded.linked_at, linked_by=excluded.linked_by`, args: [link.siteId, link.repository, link.repositoryId, link.installationId, link.branch, link.environment, link.revision, link.linkedAt, actor] });
    }
    await tx.execute({ sql: 'INSERT INTO website_github_audit VALUES(?,?,?,?,?,?)', args: [randomUUID(), link.siteId, actor, action, JSON.stringify(link), new Date().toISOString()] });
    await tx.commit();
  } catch (error) { await tx.rollback(); throw error; }
  finally { tx.close(); }
}
export async function linkRepository(siteId: string, body: Record<string, unknown>, actor: string): Promise<RepositoryLink> {
  const repository = parseRepository(body.repository);
  if (body.branch) parseBranch(body.branch);
  const environment = typeof body.environment === 'string' ? body.environment.trim() : 'production';
  if (!environment || environment.length > 100) throw new OperationsError('Enter a deployment environment, up to 100 characters.');
  const revision = body.expectedRevision;
  if (!Number.isSafeInteger(revision) || Number(revision) < 0) throw new OperationsError('A connection revision is required. Refresh and try again.');
  const installation = await github(`/repos/${repository}/installation`, appJwt());
  if (!Number.isSafeInteger(installation.id) || installation.id <= 0) throw new OperationsError('GitHub returned an invalid installation.', 502);
  // Metadata lookup is performed using this installation, never a developer's CLI token.
  const initial = await github(`/app/installations/${installation.id}/access_tokens`, appJwt(), { repositories: [repository.split('/')[1]], permissions });
  if (typeof initial.token !== 'string' || !initial.token) throw new OperationsError('GitHub did not issue an installation token.', 502);
  const metadata = await github(`/repos/${repository}`, initial.token);
  if (!Number.isSafeInteger(metadata.id) || metadata.id <= 0 || String(metadata.full_name).toLowerCase() !== repository.toLowerCase()) throw new OperationsError('Repository verification failed.', 502);
  const branch = parseBranch(body.branch || metadata.default_branch);
  await github(`/repos/${repository}/branches/${encodeURIComponent(branch)}`, initial.token);
  const link = { siteId, repository: String(metadata.full_name), repositoryId: metadata.id, installationId: installation.id, branch, environment, revision: Number(revision) + 1, linkedAt: new Date().toISOString() };
  await persistLink(link, actor, Number(revision), 'link');
  return link;
}
export async function unlinkRepository(siteId: string, revision: number, actor: string) {
  const link = await readLink(siteId);
  if (!link) throw new OperationsError('No repository is linked to this website.', 404);
  await persistLink(link, actor, revision, 'unlink');
}
export async function repositorySnapshot(siteId: string): Promise<OperationsSnapshot> {
  const link = await readLink(siteId);
  const app = appConfiguration();
  if (!link) return { link, app };
  let token: string;
  try { token = await installationToken(link.installationId, link.repositoryId); }
  catch (error) { return { link, app, connectionError: error instanceof OperationsError ? error.message : 'GitHub is unavailable. Retry shortly.' }; }
  const root = `/repos/${link.repository}`;
  const paths = [`${root}/commits?sha=${encodeURIComponent(link.branch)}&per_page=5`, `${root}/pulls?state=open&base=${encodeURIComponent(link.branch)}&per_page=5`, `${root}/actions/runs?branch=${encodeURIComponent(link.branch)}&per_page=5`, `${root}/deployments?environment=${encodeURIComponent(link.environment)}&per_page=3`];
  const results = await Promise.allSettled(paths.map(path => github(path, token)));
  const warnings: string[] = [];
  const names = ['Commits', 'Pull requests', 'Builds', 'Deployments'];
  const values = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value;
    warnings.push(`${names[i]} unavailable: ${r.reason instanceof OperationsError ? r.reason.message : 'Retry shortly.'}`);
    return null;
  });
  const item = (title: string, detail: string, status: string, url: unknown): ActivityItem => ({ title, detail, status, url: safeUrl(url) });
  // Deployment records only describe a request. Resolve the latest status rather than assuming it succeeded.
  const deployments = await Promise.all((values[3] || []).map(async (d: any) => {
    try {
      const statuses = await github(`${root}/deployments/${Number(d.id)}/statuses?per_page=1`, token);
      return item(d.environment, `${String(d.sha).slice(0, 7)} · ${d.created_at}`, statuses[0]?.state || 'No status reported', d.url?.replace('https://api.github.com/repos/', 'https://github.com/').replace(/\/deployments\/\d+$/, '/deployments'));
    } catch { warnings.push('A deployment status is unavailable.'); return item(d.environment, String(d.sha).slice(0, 7), 'Unknown', ''); }
  }));
  return { link, app, checkedAt: new Date().toISOString(), warnings, activity: {
    commits: (values[0] || []).map((c: any) => item(c.commit.message.split('\n')[0], `${String(c.sha).slice(0, 7)} · ${c.commit.author?.date || ''}`, 'Commit', c.html_url)),
    pulls: (values[1] || []).map((p: any) => item(`#${p.number} ${p.title}`, `${p.head.ref} → ${p.base.ref}`, p.draft ? 'Draft' : 'Open', p.html_url)),
    builds: (values[2]?.workflow_runs || []).map((r: any) => item(r.name || 'Workflow', `${String(r.head_sha).slice(0, 7)} · ${r.updated_at}`, r.conclusion || r.status, r.html_url)),
    deployments,
  } };
}
