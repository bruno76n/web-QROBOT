/**
 * Admin authentication: checks the Cloudflare Access token of each request and exposes
 * `requireAdmin` for the middleware and the handlers (docs/13 §2).
 */

import { createRemoteJWKSet, type JWTVerifyGetKey } from 'jose';
import { getEnv } from './env';
import {
  ACCESS_HEADER,
  issuerFromTeamDomain,
  parseAllowedEmails,
  verifyAccessToken,
  type AccessConfig,
} from './auth-core';

/** The signed-in administrator. */
export interface AdminSession {
  email: string;
}

/** Thrown by `requireAdmin`; the middleware and the handlers turn it into `401 UNAUTHORIZED`. */
export class UnauthorizedError extends Error {
  constructor(public reason: string) {
    super('UNAUTHORIZED');
  }
}

/** Last key set created, reused while the issuer stays the same. */
let cachedKeys: { issuer: string; keys: JWTVerifyGetKey } | undefined;

/** Public keys of the Access team, cached per isolate (the library refreshes them on rotation). */
function keysFor(issuer: string): JWTVerifyGetKey {
  if (cachedKeys?.issuer !== issuer) {
    cachedKeys = {
      issuer,
      keys: createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`), {
        cooldownDuration: 30_000,
      }),
    };
  }
  return cachedKeys.keys;
}

/** Access settings from the environment (team domain, application tag, allowed e-mails). */
function readConfig(): AccessConfig {
  const env = getEnv();
  return {
    issuer: issuerFromTeamDomain(env.ACCESS_TEAM_DOMAIN),
    audience: env.ACCESS_AUD ?? '',
    allowedEmails: parseAllowedEmails(env.ADMIN_EMAILS),
  };
}

/**
 * Every admin request goes through here: in the middleware (before Astro validates the input)
 * and again inside each handler (docs/13 §2, defense in depth). Returns the session or throws
 * `UnauthorizedError`. In development it always returns a fixed local administrator.
 */
export async function requireAdmin(request: Request): Promise<AdminSession> {
  // Development only. Vite replaces `import.meta.env.DEV` with `false` in the production
  // build and removes this branch; a test looks for the string in dist/ (docs/13 §2 point 3).
  if (import.meta.env.DEV) return { email: 'dev-admin@quickrobot.local' };

  const config = readConfig();
  const result = await verifyAccessToken(
    request.headers.get(ACCESS_HEADER),
    config,
    config.issuer ? keysFor(config.issuer) : async () => Promise.reject(new Error('no keys')),
  );
  if (!result.ok) throw new UnauthorizedError(result.reason);
  return { email: result.email };
}

/** Same check, but returns a boolean instead of throwing (for the middleware). */
export async function isAdminRequest(request: Request): Promise<boolean> {
  try {
    await requireAdmin(request);
    return true;
  } catch (error) {
    if (error instanceof UnauthorizedError) return false;
    throw error;
  }
}
