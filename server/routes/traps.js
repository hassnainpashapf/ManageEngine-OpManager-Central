'use strict';
/**
 * Traps + syslog lists — real stored data only (T1/T2 fix).
 *
 * Both endpoints read ONLY rows persisted by server/services/trapReceiver.js
 * (real UDP 162 SNMP traps and UDP 514 syslog datagrams, stored via
 * store.saveTrap). No in-memory seed arrays, no invented entries: when
 * nothing has arrived, both lists are empty.
 *
 * Traps and syslog share the store's single `traps` table (columns:
 * id, source_ip, oid, value, received_at). They are split here on `oid`:
 * trap rows carry a trap OID, syslog rows carry oid NULL with the message
 * text in `value`. That is a limitation of the current store schema, not
 * of the receiver.
 *
 * Endpoint paths and response shapes are unchanged from before:
 *   GET /api/traps/list  -> { status, total, traps }
 *   GET /api/syslog/list -> { status, total, messages }
 * Row fields are the stored columns (id, source_ip, oid, value,
 * received_at). `?limit=` is honoured (store default 200, max 1000).
 *
 * Receiver startup: this module calls startTrapReceiver() once on load
 * (which happens when server/index.js requires the route at server
 * startup). The same function is exported as router.startTrapReceiver so
 * server/index.js can also call it explicitly; the call is idempotent.
 */
const express = require('express');
const router = express.Router();
const store = require('../services/store');
const { startTrapReceiver } = require('../services/trapReceiver');

// Store API note: store.js exports saveTrap/listTraps as flat functions,
// not under a `store.traps` namespace. Accept either shape.
const listTraps =
  typeof store.listTraps === 'function'
    ? store.listTraps
    : store.traps && typeof store.traps.listTraps === 'function'
      ? store.traps.listTraps
      : null;

function parseLimit(req) {
  const n = Number(req.query.limit);
  return Number.isFinite(n) ? n : undefined;
}

// Traps and syslog share one table, so the store's limit applies to the
// combined rows. Fetch a wider window than requested, then filter by kind
// and slice — otherwise `?limit=1` could return 0 traps just because the
// single newest row happened to be a syslog message (and vice versa).
function listByKind(kind, req) {
  const limit = parseLimit(req);
  const rows = listTraps(1000);
  const filtered = rows.filter((r) =>
    kind === 'trap' ? r.oid !== null && r.oid !== undefined : r.oid === null || r.oid === undefined
  );
  // No ?limit= means the store default of 200 per kind.
  return filtered.slice(0, limit === undefined ? 200 : Math.max(limit, 0));
}

router.get('/api/traps/list', (req, res) => {
  if (!listTraps) {
    return res
      .status(500)
      .json({ status: 'error', total: 0, traps: [], error: 'trap store unavailable' });
  }
  const traps = listByKind('trap', req);
  res.json({
    status: 'success',
    total: traps.length,
    traps,
  });
});

router.get('/api/syslog/list', (req, res) => {
  if (!listTraps) {
    return res
      .status(500)
      .json({ status: 'error', total: 0, messages: [], error: 'trap store unavailable' });
  }
  const messages = listByKind('syslog', req);
  res.json({
    status: 'success',
    total: messages.length,
    messages,
  });
});

router.startTrapReceiver = startTrapReceiver;

module.exports = router;

// Start ingestion once when the route module is loaded (server startup).
startTrapReceiver();
