// Administrator authentication: scrypt password hashes plus a signed, HttpOnly
// session cookie. Every admin route is guarded on the server, so hiding the
// admin link in the UI is never what protects the data.
import crypto from 'node:crypto';
import { query } from '../db.js';

export const SESSION_COOKIE = 'sonique_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** The signing key comes from the platform-managed environment, never the repo. */
function signingKey() {
  const value = process.env.SESSION_SECRET ?? '';
  return value.length >= 16 ? value : '';
}

export function adminConfigured() {
  return Boolean(signingKey());
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function sign(payload) {
  return crypto.createHmac('sha256', signingKey()).update(payload).digest('base64url');
}

function createSessionToken(adminId) {
  const payload = Buffer.from(
    JSON.stringify({ id: adminId, exp: Date.now() + SESSION_TTL_MS }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function readSessionToken(token) {
  if (!signingKey() || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!Number.isInteger(data?.id) || typeof data.exp !== 'number' || data.exp < Date.now()) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

/** Sets the session cookie. `req.secure` is true only for an HTTPS request. */
export function setSessionCookie(req, res, adminId) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(createSessionToken(adminId))}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (req.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(req, res) {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (req.secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/** Resolves the signed-in administrator for a request, or null. */
export async function adminFromRequest(req) {
  if (!adminConfigured()) return null;
  const session = readSessionToken(readCookie(req, SESSION_COOKIE));
  if (!session) return null;
  const { rows } = await query('SELECT id, email FROM admin_users WHERE id = $1', [session.id]);
  return rows[0] ?? null;
}

/** Guards every /api/admin/* route except sign-in and the one-time setup. */
export async function requireAdmin(req, res, next) {
  if (!adminConfigured()) {
    return res.status(503).json({
      error: 'Admin sign-in is not configured on this deployment (SESSION_SECRET is missing).',
    });
  }

  try {
    const admin = await adminFromRequest(req);
    if (!admin) return res.status(401).json({ error: 'Sign in to manage this store.' });
    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}
