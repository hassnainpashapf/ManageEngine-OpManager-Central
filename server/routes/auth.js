const express = require('express');
const router = express.Router();

// Authentic ManageEngine OpManager Login Endpoint
router.post('/api/auth/login', (req, res) => {
  const { username, password, domain } = req.body;

  // Accept admin/admin or any valid enterprise credentials
  if ((username === 'admin' && password === 'admin') || (username && password)) {
    return res.json({
      status: 'success',
      responseCode: 200,
      token: 'OPM_CENTRAL_SESSION_' + Date.now(),
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
  res.json({ status: 'success', message: 'Logged out successfully' });
});

router.get('/api/auth/session', (req, res) => {
  res.json({
    status: 'success',
    authenticated: true,
    user: {
      username: 'admin',
      displayName: 'Enterprise Administrator',
      role: 'SuperAdmin'
    }
  });
});

module.exports = router;
