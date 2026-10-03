/**
 * Sliding-window spending budgets, for things that are billed by amount rather than by request (characters of synthesised
 * speech, say). In memory and per instance, like the request rate limiter next to it.
 */

export interface BudgetWindow {
  limit: number;
  windowMs: number;
}

export interface BudgetResult {
  allowed: boolean;
  retryAfterSec: number;
}

interface Spend {
  at: number;
  cost: number;
}

interface Ledger {
  spends: Spend[];
  keepMs: number;
}

const ledgers = new Map<string, Ledger>();
// Keys that stop spending are not revisited, so once there are this many the expired ones are swept out.
const SWEEP_ABOVE = 500;

/** How long until `cost` more fits under `limit` within `windowMs`, given the spends so far (oldest first). 0 when it fits now. */
function msUntilFits(spends: Spend[], cost: number, { limit, windowMs }: BudgetWindow, now: number): number {
  const live = spends.filter((spend) => now - spend.at < windowMs);
  let spent = live.reduce((sum, spend) => sum + spend.cost, 0);
  if (spent + cost <= limit) return 0;
  for (const spend of live) {
    spent -= spend.cost;
    if (spent + cost <= limit) return spend.at + windowMs - now;
  }
  // Larger than the whole budget: it never fits.
  return windowMs;
}

function sweep(now: number) {
  if (ledgers.size <= SWEEP_ABOVE) return;
  for (const [key, ledger] of ledgers) {
    const newest = ledger.spends[ledger.spends.length - 1];
    if (!newest || now - newest.at >= ledger.keepMs) ledgers.delete(key);
  }
}

/**
 * Records `cost` against `key` if it fits inside every window, and says so. Otherwise records nothing and says how many
 * seconds until it would fit. `now` is only for tests.
 */
export function spendBudget(key: string, cost: number, windows: readonly BudgetWindow[], now = Date.now()): BudgetResult {
  const keepMs = Math.max(...windows.map((window) => window.windowMs));
  const spends = (ledgers.get(key)?.spends ?? []).filter((spend) => now - spend.at < keepMs);

  const waitMs = Math.max(...windows.map((window) => msUntilFits(spends, cost, window, now)));
  if (waitMs > 0) {
    ledgers.set(key, { spends, keepMs });
    return { allowed: false, retryAfterSec: Math.ceil(waitMs / 1000) };
  }

  spends.push({ at: now, cost });
  ledgers.set(key, { spends, keepMs });
  sweep(now);
  return { allowed: true, retryAfterSec: 0 };
}
