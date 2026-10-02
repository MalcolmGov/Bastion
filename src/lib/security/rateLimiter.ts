/**
 * Bastion Move Studio: Sliding-Window IP Rate Limiter
 * Provides edge-friendly in-memory rate limiting with sliding windows
 * to protect against credential stuffing, brute-force attacks, and API flooding.
 */

import { NextResponse } from 'next/server';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  retryAfterSec: number;
  retryAfter?: number;
}

interface WindowRecord {
  timestamps: number[];
}

const stores = new Map<string, WindowRecord>();

// Periodic garbage collection for inactive rate limit keys (every 5 minutes)
let gcInterval: NodeJS.Timeout | null = null;
function ensureGc() {
  if (!gcInterval && typeof setInterval !== 'undefined') {
    gcInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of stores.entries()) {
        record.timestamps = record.timestamps.filter(ts => now - ts < 10 * 60 * 1000);
        if (record.timestamps.length === 0) {
          stores.delete(key);
        }
      }
    }, 5 * 60 * 1000);
    if (gcInterval.unref) gcInterval.unref();
  }
}

/**
 * Checks and records a request against a sliding-window rate limit.
 * @param key Identifier for the actor (e.g. IP address or client ID)
 * @param limit Maximum allowed requests within the window
 * @param windowMs Duration of the sliding window in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  ensureGc();
  const now = Date.now();
  let record = stores.get(key);

  if (!record) {
    record = { timestamps: [] };
    stores.set(key, record);
  }

  // Prune timestamps outside current sliding window
  record.timestamps = record.timestamps.filter(ts => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    const retryAfterSec = Math.ceil(resetMs / 1000) || 1;
    return {
      allowed: false,
      remaining: 0,
      resetMs,
      retryAfterSec,
      retryAfter: retryAfterSec,
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    allowed: true,
    remaining,
    resetMs: windowMs,
    retryAfterSec: 0,
    retryAfter: 0,
  };
}

/** Pre-configured rate limit for login endpoints (10 attempts per minute per IP) */
export function checkLoginRateLimit(ip: string): RateLimitResult {
  const cleanIp = (ip || '127.0.0.1').split(',')[0].trim();
  return checkRateLimit(`login:${cleanIp}`, 10, 60 * 1000);
}

/** Pre-configured rate limit for general sensitive API routes (120 requests per minute per IP) */
export function checkApiRateLimit(ip: string): RateLimitResult {
  const cleanIp = (ip || '127.0.0.1').split(',')[0].trim();
  return checkRateLimit(`api:${cleanIp}`, 120, 60 * 1000);
}

/** Clear rate limit for an IP/key (e.g. for testing or post-unlock) */
export function clearRateLimit(key: string): void {
  stores.delete(key);
  stores.delete(`login:${key}`);
  stores.delete(`api:${key}`);
}

export const resetRateLimit = clearRateLimit;

/**
 * Per-IP limit for public endpoints. Returns a 429 response when the caller is over the limit,
 * otherwise null. The IP is only used as an in-memory key and is never persisted.
 */
export function rateLimitResponse(
  req: { headers: { get: (name: string) => string | null } },
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
  const result = checkRateLimit(`${name}:${ip}`, limit, windowMs);
  if (result.allowed) return null;
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } }
  );
}
