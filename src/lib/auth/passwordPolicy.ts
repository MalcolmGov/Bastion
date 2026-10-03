import { isPublicDemoSecret } from '@/lib/auth/apiToken';

/** Every way of setting a password uses this: an invitation, an administrator creating an account, the first administrator and the demo accounts. */
export const MIN_PASSWORD_LENGTH = 12;

/**
 * Passwords that were written into this repository's seed and scripts, so anyone who has read the source knows them. The
 * startup revocation takes these away from accounts that still have one, and nobody may choose one again.
 */
export const PUBLISHED_PASSWORDS: readonly string[] = ['Bastion2026!', 'GoldFields2026!'];

/** Also published, in the end-to-end scripts, but never seeded into an account, so not part of that revocation. */
const OTHER_PUBLISHED_PASSWORDS: readonly string[] = ['Bastion2026!Corp#'];

// Compared in lower case: "bastion2026!" is the same published word with the same year.
const REFUSED = new Set([...PUBLISHED_PASSWORDS, ...OTHER_PUBLISHED_PASSWORDS].map(password => password.toLowerCase()));

export type PasswordProblem = 'not_text' | 'too_short' | 'published';

/** Shown to the person choosing the password. It never repeats the password. */
export const PUBLISHED_PASSWORD_MESSAGE = 'That password has been published and is publicly known. Choose a different one.';

export function passwordProblem(password: unknown): PasswordProblem | null {
  if (typeof password !== 'string') return 'not_text';
  if (password.length < MIN_PASSWORD_LENGTH) return 'too_short';
  const candidate = password.trim();
  if (REFUSED.has(candidate.toLowerCase()) || isPublicDemoSecret(candidate)) return 'published';
  return null;
}

/** The message to answer with when the password is not acceptable, or null when it is. The caller words its own "too short". */
export function passwordRefusal(password: unknown, tooShortMessage: string): string | null {
  const problem = passwordProblem(password);
  if (!problem) return null;
  return problem === 'published' ? PUBLISHED_PASSWORD_MESSAGE : tooShortMessage;
}
