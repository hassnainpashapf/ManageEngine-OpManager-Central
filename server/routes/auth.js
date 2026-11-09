const express = require('express');
const router = express.Router();
const sessions = require('../services/sessions');

// Credentials are configurable via environment so this isn't a hardcoded
// backdoor in a real deployment; default stays admin/admin for local use.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// Authentic ManageEngine OpManager Login Endpoint
router.post('/api/auth/login', (req, res) => {
  const { username, password, domain } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = sessions.createSession(username);
    return res.json({
      status: 'success',
      responseCode: 200,
      token,
      user: {
        userId: 1,
        username: username || 'admin',
        displayName: username === 'admin' ? 'Enterprise Administrator' : username,
        role: 'SuperAdmin',
        email: 'admin@opmanager-central.enterprise.corp',
        domain: domain || 'Local Authentication',
        lastLogin: new Date().toISOString(),
        productName: 'ManageEngine OpManager Central',
        productVersion: '12.9.203',
        buildNumber: '129203'
      }
    });
  }

  res.status(401).json({
    status: 'error',
    message: 'Invalid username or password. Default credentials are admin / admin.'
  });
});

router.post('/api/auth/logout', (req, res) => {
  const token = sessions.extractToken(req);
  if (token) sessions.invalidate(token);
  res.json({ status: 'success', message: 'Logged out successfully' });
});

// Real session check: the enforceAuth middleware (server/index.js) already
// rejects this call with 401 if the bearer token is missing/expired, so
// reaching this handler means the token is genuinely valid.
router.get('/api/auth/session', (req, res) => {
  res.json({
    status: 'success',
    authenticated: true,
    user: {
      username: req.session.username,
      displayName: req.session.username === 'admin' ? 'Enterprise Administrator' : req.session.username,
      role: 'SuperAdmin'
    }
  });
});

module.exports = router;
