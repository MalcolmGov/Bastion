/**
 * Credentials for the manual browser and test scripts come from the environment. Nothing in this repository holds a working
 * password: set E2E_ADMIN_PASSWORD (and E2E_CLIENT_PASSWORD where a script signs in as a client) to the password of an account
 * you created, for example through BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Set ${name} in the environment to run this script (see .env.example).`);
  return value;
}
