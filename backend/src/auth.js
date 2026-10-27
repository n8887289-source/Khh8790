import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const COOKIE_NAME = 'sonique_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// SESSION_SECRET is provided by the environment (see .env.base44-defaults and the
// platform-managed /run/base44/app.env). A random fallback keeps the server bootable
// if the variable is absent; sessions then simply do not survive a restart.
const SECRET = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn(
    '[auth] SESSION_SECRET is not set - using an ephemeral key. Sign-ins will not survive a restart.',
  );
}

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(value) {
  return createHmac('sha256', SECRET).update(value).digest('hex');
}

export function makeSession(customerId) {
  const value = String(customerId);
  return `${value}.${sign(value)}`;
}

export function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const entry = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  const raw = decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
  const [value, signature] = raw.split('.');
  if (!value || !signature) return null;
  if (sign(value) !== signature) return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function setSessionCookie(res, customerId) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${makeSession(customerId)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}
