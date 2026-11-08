const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Racks dataset (empty by default until real racks/devices are mapped)
const RACKS = [];

// GET /api/racks/list
router.get('/api/racks/list', (req, res) => {
  const { probeId } = req.query;
  let list = RACKS;
  if (probeId && probeId !== 'all') {
    list = list.filter(r => r.probeId === String(probeId));
  }
  res.json({
    status: 'success',
    racks: list
  });
});

module.exports = router;
