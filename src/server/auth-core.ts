import { jwtVerify, type JWTVerifyGetKey } from 'jose';

/**
 * Verifies the Cloudflare Access token (docs/13 §2). No Cloudflare imports here, so it runs in
 * plain Node tests with keys generated on the spot.
 */
export interface AccessConfig {
  /** `https://<team>.cloudflareaccess.com` (the `iss` of the token). */
  issuer: string;
  /** The `aud` tag of the Access application. */
  audience: string;
  /** Allowed e-mails, already split. Compared in lowercase. */
  allowedEmails: readonly string[];
}

export type AccessResult = { ok: true; email: string } | { ok: false; reason: string };

export const ACCESS_HEADER = 'Cf-Access-Jwt-Assertion';

export function parseAllowedEmails(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Team domain variable ("quickrobot.cloudflareaccess.com" or a full URL) → issuer URL. */
export function issuerFromTeamDomain(domain: string | undefined): string {
  const d = (domain ?? '').trim().replace(/\/+$/, '');
  if (!d) return '';
  return d.startsWith('https://') ? d : `https://${d}`;
}

export async function verifyAccessToken(
  token: string | null | undefined,
  config: AccessConfig,
  keys: JWTVerifyGetKey,
  now: Date = new Date(),
): Promise<AccessResult> {
  if (!token) return { ok: false, reason: 'no token' };
  // Misconfiguration must fail closed, never open.
  if (!config.issuer || !config.audience || config.allowedEmails.length === 0) {
    return { ok: false, reason: 'access not configured' };
  }
  try {
    const { payload } = await jwtVerify(token, keys, {
      issuer: config.issuer,
      audience: config.audience,
      algorithms: ['RS256'],
      currentDate: now,
    });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (!email || !config.allowedEmails.includes(email)) {
      return { ok: false, reason: 'email not allowed' };
    }
    return { ok: true, email };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.name : 'invalid token' };
  }
}
