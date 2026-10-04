/** Agency staff can switch clients. Client CMS users cannot. */
export function isAgencyUser(user: { role?: string | null; client_id?: string | null } | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'platform_admin' && !user.client_id;
}

export const AGENCY_PATH_PREFIXES = [
  '/admin/clients',
  '/admin/create',
  '/admin/billing',
  '/admin/brand',
  '/admin/blueprints',
  '/admin/design-system',
  '/admin/incidents',
  '/admin/sre',
  '/admin/repositories',
  '/admin/api-keys',
  '/admin/sandbox',
  '/admin/settings',
];

export function isAgencyOnlyPath(pathname: string): boolean {
  return AGENCY_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
