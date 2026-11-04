import { beforeAll, describe, expect, it } from 'vitest';
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair, type JWK } from 'jose';
import {
  issuerFromTeamDomain,
  parseAllowedEmails,
  verifyAccessToken,
  type AccessConfig,
} from '@/server/auth-core';

// docs/13 §10: no token, expired, wrong aud, wrong issuer, e-mail not allowed → rejected.
const issuer = 'https://quickrobot.cloudflareaccess.com';
const audience = 'aud-tag-123';
const config: AccessConfig = {
  issuer,
  audience,
  allowedEmails: ['dueno@example.com', 'ayuda@example.com'],
};
const now = new Date('2026-11-04T12:00:00Z');
const nowSec = Math.floor(now.getTime() / 1000);

let privateKey: CryptoKey;
let otherPrivateKey: CryptoKey;
let keys: ReturnType<typeof createLocalJWKSet>;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  const other = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  otherPrivateKey = other.privateKey;
  const jwk: JWK = { ...(await exportJWK(pair.publicKey)), alg: 'RS256', use: 'sig', kid: 'k1' };
  keys = createLocalJWKSet({ keys: [jwk] });
});

async function token(
  overrides: {
    aud?: string;
    iss?: string;
    email?: string | null;
    exp?: number;
    key?: CryptoKey;
  } = {},
) {
  const jwt = new SignJWT(
    overrides.email === null ? {} : { email: overrides.email ?? 'dueno@example.com' },
  )
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(overrides.iss ?? issuer)
    .setAudience(overrides.aud ?? audience)
    .setIssuedAt(nowSec - 60)
    .setExpirationTime(overrides.exp ?? nowSec + 3600);
  return jwt.sign(overrides.key ?? privateKey);
}

const check = (t: string | null | undefined, cfg = config) => verifyAccessToken(t, cfg, keys, now);

describe('verifyAccessToken', () => {
  it('accepts a valid token and returns the e-mail in lowercase', async () => {
    expect(await check(await token({ email: 'Dueno@Example.com' }))).toEqual({
      ok: true,
      email: 'dueno@example.com',
    });
  });
  it('rejects a request without token', async () => {
    expect(await check(null)).toMatchObject({ ok: false });
    expect(await check('')).toMatchObject({ ok: false });
    expect(await check(undefined)).toMatchObject({ ok: false });
  });
  it('rejects an expired token', async () => {
    expect(await check(await token({ exp: nowSec - 10 }))).toMatchObject({ ok: false });
  });
  it('rejects a wrong audience', async () => {
    expect(await check(await token({ aud: 'otra-app' }))).toMatchObject({ ok: false });
  });
  it('rejects a wrong issuer', async () => {
    expect(await check(await token({ iss: 'https://otro.cloudflareaccess.com' }))).toMatchObject({
      ok: false,
    });
  });
  it('rejects an e-mail that is not in the list, or a token without e-mail', async () => {
    expect(await check(await token({ email: 'intruso@example.com' }))).toEqual({
      ok: false,
      reason: 'email not allowed',
    });
    expect(await check(await token({ email: null }))).toEqual({
      ok: false,
      reason: 'email not allowed',
    });
  });
  it('rejects a token signed with another key, a tampered one and garbage', async () => {
    expect(await check(await token({ key: otherPrivateKey }))).toMatchObject({ ok: false });
    const good = await token();
    const [h, p, s] = good.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({
        email: 'intruso@example.com',
        iss: issuer,
        aud: audience,
        exp: nowSec + 99,
      }),
    ).toString('base64url');
    expect(await check(`${h}.${forgedPayload}.${s}`)).toMatchObject({ ok: false });
    expect(await check('no.es.un.jwt')).toMatchObject({ ok: false });
    expect(await check(`${h}.${p}.`)).toMatchObject({ ok: false });
  });
  it('rejects an unsigned (alg none) token', async () => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ email: 'dueno@example.com', iss: issuer, aud: audience, exp: nowSec + 3600 })}.`;
    expect(await check(none)).toMatchObject({ ok: false });
  });
  it('fails closed when Access is not configured', async () => {
    const good = await token();
    expect(await check(good, { ...config, audience: '' })).toEqual({
      ok: false,
      reason: 'access not configured',
    });
    expect(await check(good, { ...config, issuer: '' })).toEqual({
      ok: false,
      reason: 'access not configured',
    });
    expect(await check(good, { ...config, allowedEmails: [] })).toEqual({
      ok: false,
      reason: 'access not configured',
    });
  });
});

describe('configuration helpers', () => {
  it('splits and normalizes the e-mail list', () => {
    expect(parseAllowedEmails(' A@x.com, b@x.com ,,')).toEqual(['a@x.com', 'b@x.com']);
    expect(parseAllowedEmails(undefined)).toEqual([]);
  });
  it('builds the issuer from the team domain', () => {
    expect(issuerFromTeamDomain('quickrobot.cloudflareaccess.com')).toBe(issuer);
    expect(issuerFromTeamDomain('https://quickrobot.cloudflareaccess.com/')).toBe(issuer);
    expect(issuerFromTeamDomain('')).toBe('');
  });
});
