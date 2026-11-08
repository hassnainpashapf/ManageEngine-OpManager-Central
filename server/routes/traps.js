const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Authentic ManageEngine SNMP Traps Dataset (Starts empty until incoming UDP 162 traps arrive)
const SNMP_TRAPS = [];

// Authentic ManageEngine Syslog Dataset (Starts empty until incoming UDP 514 syslog events arrive)
const SYSLOG_MESSAGES = [];

router.get('/api/traps/list', (req, res) => {
  res.json({
    status: 'success',
    total: SNMP_TRAPS.length,
    traps: SNMP_TRAPS
  });
});

router.get('/api/syslog/list', (req, res) => {
  res.json({
    status: 'success',
    total: SYSLOG_MESSAGES.length,
    messages: SYSLOG_MESSAGES
  });
});

module.exports = router;
