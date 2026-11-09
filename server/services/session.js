'use strict';
/**
 * Session & password service for OpManager Central (real-data rebuild).
 *
 * - Passwords: node:crypto scrypt with a random per-password salt.
 *   Stored format: `scrypt$<saltHex>$<hashHex>`. No bcrypt dependency.
 * - Sessions: cryptographically random 32-byte tokens. Only the SHA-256
 *   hash of a token is stored server-side (sessions table, via the store
 *   service); the raw token is only ever sent to the client as an
 *   HttpOnly cookie (`opm_session`) or accepted as a Bearer token.
 * - No password, token, or key is hardcoded anywhere in this file.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SESSION_COOKIE = 'opm_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SCRYPT_KEYLEN = 64;

// ---------------------------------------------------------------------------
// Store access (lazy: the store service is built in parallel to this contract)
// ---------------------------------------------------------------------------
let cachedStore = null;

function getStore() {
  if (cachedStore) return cachedStore;
  try {
    cachedStore = require('./store');
  } catch (err) {
    throw new Error(
      'user/session store is not available (server/services/store.js): ' + err.message
    );
  }
  return cachedStore;
}

// ---------------------------------------------------------------------------
// Password hashing (scrypt, random salt)
// ---------------------------------------------------------------------------

/**
 * Hash a password. Returns `scrypt$<saltHex>$<hashHex>`.
 */
function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return 'scrypt$' + salt.toString('hex') + '$' + hash.toString('hex');
}

/**
 * Verify a password against a stored `scrypt$<saltHex>$<hashHex>` value.
 * Constant-time comparison; returns false (never throws) for any bad input.
 */
function verifyPassword(password, stored) {
  try {
    if (typeof password !== 'string' || typeof stored !== 'string') return false;
    const parts = stored.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    if (salt.length === 0 || expected.length === 0) return false;
    const actual = crypto.scryptSync(password, salt, expected.length);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Session tokens
// ---------------------------------------------------------------------------

/** Cryptographically random 32-byte session token (64 hex chars). */
function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) out[name] = decodeURIComponent(value);
  }
  return out;
}

/** Session token from the `opm_session` cookie or an Authorization header. */
function extractToken(req) {
  if (req.cookies && req.cookies[SESSION_COOKIE]) return req.cookies[SESSION_COOKIE];
  const fromCookie = parseCookies(req.headers && req.headers.cookie)[SESSION_COOKIE];
  if (fromCookie) return fromCookie;
  const auth = req.headers && req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    const token = auth.slice('Bearer '.length).trim();
    if (token) return token;
  }
  return null;
}

/**
 * Validate the presented session and resolve its user.
 * Returns { id, username, role } or null. Expired sessions are revoked.
 */
async function getSessionUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  const store = getStore();
  const tokenHash = sha256Hex(token);
  const sessionRecord = await store.sessions.getSessionByTokenHash(tokenHash);
  if (!sessionRecord) return null;

  const expiresRaw =
    sessionRecord.expires_at ?? sessionRecord.expiresAt ?? sessionRecord.expires;
  if (expiresRaw != null) {
    const expiresMs = typeof expiresRaw === 'number' ? expiresRaw : Date.parse(expiresRaw);
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
      try {
        await store.sessions.deleteSession(tokenHash);
      } catch {
        // Revocation is best-effort; the session is already expired.
      }
      return null;
    }
  }

  const userId = sessionRecord.user_id ?? sessionRecord.userId;
  if (userId == null) return null;
  const users = await store.users.listUsers();
  const user = (users || []).find((u) => String(u.id) === String(userId));
  if (!user) return null;
  return { id: user.id, username: user.username, role: user.role || 'admin' };
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/**
 * Require a valid session (HttpOnly `opm_session` cookie or
 * `Authorization: Bearer <token>`). Sets req.user = { id, username, role }.
 * Otherwise 401 { error: 'unauthorized', authenticated: false }.
 */
async function requireAuth(req, res, next) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', authenticated: false });
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Require req.user to have the given role (after requireAuth).
 * 'admin' and 'SuperAdmin' are treated as the same administrative role.
 * Otherwise 401 (no user) or 403 { error: 'forbidden' }.
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'unauthorized', authenticated: false });
    }
    const userRole = String(req.user.role || '');
    const wanted = String(role);
    const equivalent =
      (userRole === 'admin' && wanted === 'SuperAdmin') ||
      (userRole === 'SuperAdmin' && wanted === 'admin');
    if (userRole !== wanted && !equivalent) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return next();
  };
}

// ---------------------------------------------------------------------------
// First-admin bootstrap
// ---------------------------------------------------------------------------

/**
 * Create the initial admin account if (and only if) the users table is empty.
 * The password is random (12 random bytes, base64url = 16 characters) and is
 * never hardcoded: it is printed ONCE to stdout and written to
 * server/data/.admin-initial (mode 600) so the operator can retrieve it.
 * The account is flagged must_change_password so it must be changed on
 * first login. Returns { created: true, password } or { created: false }.
 */
async function ensureFirstAdmin() {
  const store = getStore();
  const existing = await store.users.listUsers();
  if (Array.isArray(existing) && existing.length > 0) return { created: false };

  const password = crypto.randomBytes(12).toString('base64url'); // exactly 16 chars
  const passwordHash = hashPassword(password);

  try {
    await store.users.createUser('admin', passwordHash, 'admin');
  } catch (err) {
    // Lost a race with another bootstrap: if a user now exists, we are done.
    const after = await store.users.listUsers();
    if (Array.isArray(after) && after.length > 0) return { created: false };
    throw err;
  }

  // Flag the bootstrap account as must-change-password (best effort; the
  // store contract's updateUser field name is must_change_password).
  try {
    const admin = await store.users.getUserByUsername('admin');
    if (admin && admin.id != null) {
      try {
        await store.users.updateUser(admin.id, { must_change_password: 1 });
      } catch {
        await store.users.updateUser(admin.id, { mustChangePassword: true });
      }
    }
  } catch {
    // Flagging is best-effort; the account itself was created successfully.
  }

  console.log('Bootstrap admin password written to server/data/.admin-initial (mode 600) — change it on first login.');
  const dir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '.admin-initial');
  fs.writeFileSync(file, password + '\n', { mode: 0o600 });
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    // Mode was already applied on creation; ignore.
  }
  return { created: true, password };
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSessionToken,
  requireAuth,
  requireRole,
  ensureFirstAdmin,
};
