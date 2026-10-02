import type { ApiTokenAuthResult } from '@/lib/auth/apiToken';
import type { Client } from '@libsql/client';

export interface ApiAccess extends ApiTokenAuthResult {
  actorId?: string;
}

export function assertApiScope(access: ApiAccess, scope: string): void {
  if (!access.ok || (!access.isAgencyAdmin && !access.clientId)) {
    throw new Error('Unauthorized');
  }
  if (!access.isAgencyAdmin && !access.scopes?.includes('*') && !access.scopes?.includes(scope)) {
    throw new Error(`Forbidden: API token lacks required scope '${scope}'`);
  }
}

/** Only server credentials and agency sessions can bypass tenant boundaries. */
export function apiTenantFilter(
  access: ApiAccess,
  kind: 'page' | 'record' | 'media' | 'release',
  alias = ''
): { sql: string; args: string[] } {
  if (!access.ok || (!access.isAgencyAdmin && !access.clientId)) {
    return { sql: ' AND 1 = 0', args: [] };
  }
  if (access.isAgencyAdmin) return { sql: '', args: [] };
  const prefix = alias ? `${alias}.` : '';
  const clientId = access.clientId!;
  // Compositions inherit ownership from their website. Their own client_id is
  // absent in older schemas and can be stale after a website is reassigned.
  const ownerSql = kind === 'page'
    ? `${prefix}site_id IN (SELECT id FROM websites WHERE client_id = ?)`
    : `(${prefix}client_id = ? OR (${prefix}client_id IS NULL AND ${prefix}site_id IN (SELECT id FROM websites WHERE client_id = ?)))`;
  const args = kind === 'page' ? [clientId] : [clientId, clientId];
  let sql = ` AND ${ownerSql}`;
  if (access.siteId) {
    sql += ` AND ${prefix}site_id = ?`;
    args.push(access.siteId);
  }
  return { sql, args };
}

export async function assertApiSiteAccess(db: Pick<Client, 'execute'>, access: ApiAccess, siteId: string): Promise<void> {
  if (!access.ok || (!access.isAgencyAdmin && !access.clientId)) throw new Error('Unauthorized');
  const result = await db.execute({
    sql: `SELECT id FROM websites WHERE id = ?${access.isAgencyAdmin ? '' : ' AND client_id = ?'}${access.siteId ? ' AND id = ?' : ''} LIMIT 1`,
    args: [siteId, ...(access.isAgencyAdmin ? [] : [access.clientId || '']), ...(access.siteId ? [access.siteId] : [])]
  });
  if (result.rows.length === 0) throw new Error('Website not found');
}
