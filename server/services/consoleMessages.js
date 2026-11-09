'use strict';
/**
 * OpManager Central — console message store (Phase 5, HE-3a).
 *
 * Backs GET /admin/getMessagesForPage: the per-page message cards the
 * console shows (alert banners, "what's new" notes). Messages are NOT
 * invented: the store starts empty, and entries are appended only by real
 * console events — currently every real alarm raised through
 * store.alarms.raiseAlarm() (see the hook at the end of raiseAlarm in
 * server/services/store.js), which records one ALERT message for the
 * 'alarms' page from the alarm's own severity/source/message. No other
 * writer exists yet; a page with no recorded message honestly returns
 * none. The store is capped (oldest entries dropped first) so a noisy
 * poller cannot grow it without bound.
 *
 * Persistence follows the racks.js convention: a JSON array under a
 * settings key (store.getSetting/store.setSetting), so no schema change
 * is needed. All functions are best-effort and never throw — a message
 * failure must never break the event that produced it.
 */

const store = require('./store');

const MESSAGES_KEY = 'console_messages';
const MAX_MESSAGES = 200;

function listMessages(page) {
  let parsed = [];
  try {
    const raw = store.getSetting(MESSAGES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) parsed = arr;
    }
  } catch (e) {
    parsed = [];
  }
  const messages = parsed.filter((m) => m && typeof m === 'object');
  const filtered = page ? messages.filter((m) => m.page === page) : messages;
  // Newest first.
  return filtered.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function recordMessage(entry) {
  try {
    const e = entry || {};
    if (typeof e.message !== 'string' || !e.message.trim()) return null;
    const message = {
      id: Date.now(),
      page: typeof e.page === 'string' && e.page ? e.page : 'dashboard',
      type: typeof e.type === 'string' && e.type ? e.type : 'ALERT',
      title: typeof e.title === 'string' ? e.title : null,
      message: e.message,
      createdAt: Date.now(),
      read: false
    };
    const existing = listMessages();
    existing.push(message);
    const kept = existing
      .slice()
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
      .slice(-MAX_MESSAGES);
    store.setSetting(MESSAGES_KEY, kept);
    return message;
  } catch (err) {
    return null;
  }
}

module.exports = { listMessages, recordMessage, MESSAGES_KEY, MAX_MESSAGES };
