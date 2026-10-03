import type { Page } from 'puppeteer-core';

/**
 * Sign-in for the dev capture, screenshot and E2E scripts. The accounts must already exist on the instance being tested;
 * nothing is shipped with the repository, so the passwords come from the environment (see .env.example).
 */
const ACCOUNTS = {
  agency: { emailVar: 'E2E_AGENCY_EMAIL', defaultEmail: 'malcolm@movedigital.africa', passwordVar: 'E2E_AGENCY_PASSWORD' },
  client: { emailVar: 'E2E_CLIENT_EMAIL', defaultEmail: 'admin@goldfields.com', passwordVar: 'E2E_CLIENT_PASSWORD' },
} as const;

export type DevAccount = keyof typeof ACCOUNTS;

export function devCredentials(account: DevAccount): { email: string; password: string } {
  const spec = ACCOUNTS[account];
  const password = process.env[spec.passwordVar];
  if (!password) {
    throw new Error(`Set ${spec.passwordVar} to the password of the ${account} account on the instance you are testing (see .env.example).`);
  }
  return { email: process.env[spec.emailVar] || spec.defaultEmail, password };
}

/** Types the account's credentials into the sign-in form that is already open, without submitting it. */
export async function typeCredentials(page: Page, account: DevAccount, delay?: number): Promise<void> {
  const { email, password } = devCredentials(account);
  const options = delay === undefined ? undefined : { delay };
  await page.type('input[type="email"]', email, options);
  await page.type('input[type="password"]', password, options);
}

export interface FormLoginOptions {
  /** Milliseconds between keystrokes. */
  delay?: number;
  /** Set to false to submit and return at once, for a script that waits for the redirect itself. */
  waitForNavigation?: boolean;
}

/** Opens the admin sign-in page, signs in through the form and, unless told otherwise, waits for the redirect. */
export async function loginViaForm(page: Page, baseUrl: string, account: DevAccount, options: FormLoginOptions = {}): Promise<void> {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'networkidle2' });
  await typeCredentials(page, account, options.delay);
  if (options.waitForNavigation === false) {
    await page.click('button[type="submit"]');
    return;
  }
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('button[type="submit"]')]);
}

/** Signs in through the login API and returns the raw response, so the caller can read the session cookie. */
export function loginViaApi(baseUrl: string, account: DevAccount): Promise<Response> {
  return fetch(`${baseUrl}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(devCredentials(account)),
  });
}
