'use strict';
/**
 * Authentication routes for OpManager Central (real-data rebuild).
 *
 * All authentication is server-side: users live in the store service with
 * scrypt password hashes, sessions live in the store's sessions table and
 * are referenced only by the SHA-256 hash of a random token. The raw token
 * reaches the browser only as an HttpOnly SameSite=Lax cookie
 * (`opm_session`); it is never returned in a response body and never kept
 * in localStorage. No credential is hardcoded anywhere in this file and
 * login failures always return the same generic message.
 */

const express = require('express');
const crypto = require('node:crypto');

const router = express.Router();
const {
  hashPassword,
  verifyPassword,
  createSessionToken,
  requireAuth,
  ensureFirstAdmin,
} = require('../services/session');

const SESSION_COOKIE = 'opm_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const MIN_PASSWORD_LENGTH = 10;

// Store access is lazy: the store service is built in parallel to the same
// contract (store.users / store.sessions). Nothing here requires it at load.
let cachedStore = null;
function getStore() {
  if (cachedStore) return cachedStore;
  try {
    cachedStore = require('../services/store');
  } catch (err) {
    throw new Error(
      'user/session store is not available (server/services/store.js): ' + err.message
    );
  }
  return cachedStore;
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

/** The stored password hash, tolerating the store's field naming. */
function storedHash(user) {
  return user.password_hash ?? user.passwordHash ?? user.password;
}

/** Whether the user must change their password on next login. */
function mustChangePassword(user) {
  const value =
    user.must_change_password ?? user.mustChangePassword ?? user.force_password_change;
  return value === true || value === 1 || value === '1';
}

function publicUser(user) {
  return { username: user.username, role: user.role || 'admin' };
}

function setSessionCookie(res, req, token) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
    // Only mark Secure when the request itself arrived over HTTPS, so the
    // cookie still works on plain-HTTP local deployments.
    secure: req.secure === true,
  });
}

/** Create a server-side session for a user and set its cookie. */
async function issueSession(res, req, user) {
  const token = createSessionToken();
  // Epoch ms, matching the store's INTEGER expires_at column (store.now()).
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await getStore().sessions.createSession(user.id, sha256Hex(token), expiresAt);
  setSessionCookie(res, req, token);
  return token;
}

/**
 * Revoke the session identified by a raw token. The store's deleteSession
 * is called with the token hash first; if that fails, fall back to looking
 * the session up and deleting it by id. Best-effort: never throws.
 */
async function revokeSession(token) {
  const store = getStore();
  const tokenHash = sha256Hex(token);
  try {
    await store.sessions.deleteSession(tokenHash);
    return;
  } catch {
    // Fall through to the id-based attempt below.
  }
  try {
    const record = await store.sessions.getSessionByTokenHash(tokenHash);
    if (record && record.id != null) await store.sessions.deleteSession(record.id);
  } catch {
    // Revocation is best-effort.
  }
}

// ---------------------------------------------------------------------------
// POST /api/auth/setup — create the very first admin (users table must be empty)
// ---------------------------------------------------------------------------
router.post('/api/auth/setup', async (req, res, next) => {
  try {
    const store = getStore();
    const users = await store.users.listUsers();
    if (Array.isArray(users) && users.length > 0) {
      return res.status(403).json({ error: 'setup already completed' });
    }
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'username is required' });
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: 'password must be at least 10 characters' });
    }
    const created = await store.users.createUser(
      username.trim(),
      hashPassword(password),
      'admin'
    );
    const user = created || (await store.users.getUserByUsername(username.trim()));
    // A password chosen here via setup is already the operator's own, so it
    // does not need a forced change (best effort; ignore store field errors).
    if (user && user.id != null) {
      try {
        await store.users.updateUser(user.id, { must_change_password: 0 });
      } catch {
        // Ignore: the account was created successfully.
      }
    }
    return res.status(201).json({
      ok: true,
      status: 'success',
      user: { username: username.trim(), role: 'admin' },
    });
  } catch (err) {
    return next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/api/auth/login', async (req, res, next) => {
  try {
    // Bootstrap the random-password first admin on first use, if the users
    // table is still empty. Failures here are non-fatal: the lookup below
    // will surface a real store failure.
    try {
      await ensureFirstAdmin();
    } catch {
      // Ignore; the user lookup below reports store problems.
    }
    const { username, password } = req.body || {};
    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username.length === 0 ||
      password.length === 0
    ) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const store = getStore();
    const user = await store.users.getUserByUsername(username);
    if (!user || !verifyPassword(password, storedHash(user))) {
      // Generic failure: never reveal whether the user exists.
      return res.status(401).json({ error: 'invalid credentials' });
    }
    await issueSession(res, req, user);
    // Best-effort last-login stamp; a store that rejects the field must
    // never fail an otherwise successful login.
    try {
      await store.users.updateUser(user.id, { last_login: new Date().toISOString() });
    } catch {
      // Ignore.
    }
    return res.json({
      ok: true,
      status: 'success',
      user: publicUser(user),
      mustChangePassword: mustChangePassword(user),
    });
  } catch (err) {
    return next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout — delete the session server-side, clear the cookie
// ---------------------------------------------------------------------------
router.post('/api/auth/logout', async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) await revokeSession(token);
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    return res.json({ ok: true, status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    return next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/session — 200 { authenticated: true, user } or 401
// ---------------------------------------------------------------------------
router.get('/api/auth/session', requireAuth, (req, res) => {
  return res.json({
    authenticated: true,
    ok: true,
    user: { id: req.user.id, username: req.user.username, role: req.user.role },
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/change-password — authed; verifies current, rotates session
// ---------------------------------------------------------------------------
router.post('/api/auth/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ error: 'new password must be at least 10 characters' });
    }
    if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const store = getStore();
    const user = await store.users.getUserByUsername(req.user.username);
    if (!user || !verifyPassword(currentPassword, storedHash(user))) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    const newHash = hashPassword(newPassword);
    // Primary field naming (snake_case, matching must_change_password);
    // fall back to camelCase/plain names if the store rejects them.
    try {
      await store.users.updateUser(user.id, {
        password_hash: newHash,
        must_change_password: 0,
      });
    } catch {
      await store.users.updateUser(user.id, {
        password: newHash,
        mustChangePassword: false,
      });
    }
    // Confirm the new hash actually stuck before rotating the session.
    let fresh = await store.users.getUserByUsername(req.user.username);
    if (!fresh || !verifyPassword(newPassword, storedHash(fresh))) {
      try {
        await store.users.updateUser(user.id, {
          password: newHash,
          mustChangePassword: false,
        });
        fresh = await store.users.getUserByUsername(req.user.username);
      } catch {
        // Ignore; the check below reports the failure.
      }
    }
    if (!fresh || !verifyPassword(newPassword, storedHash(fresh))) {
      return res.status(500).json({ error: 'password update failed' });
    }
    // Rotate the session: revoke the old token, issue a fresh one.
    const oldToken = extractToken(req);
    if (oldToken) await revokeSession(oldToken);
    await issueSession(res, req, fresh);
    return res.json({
      ok: true,
      status: 'success',
      user: publicUser(fresh),
      mustChangePassword: false,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
