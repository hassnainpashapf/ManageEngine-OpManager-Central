'use strict';
/**
 * Phase 3 — ha-ui track: High Availability STATUS view.
 *
 * Shows the live HA state of THIS node: current role, registered peers
 * with last-seen timestamps, heartbeat health (live TCP probe + heartbeat
 * liveness), failover decision state, and a "Test failover" button that
 * calls the real dry-run endpoint. Nothing here is invented: every value
 * comes from GET /api/ha/status (and GET /api/ha/peers); when the HA
 * service has not landed, the view says so instead of rendering demo
 * rows.
 *
 * WIRING (close-out agent — this file is self-contained and does NOT edit
 * client/js/app.js):
 *   1. Script tag: add `<script src="/js/p3/ha-ui.js"></script>` to
 *      `client/noc.html` AFTER the existing
 *      `<script src="/js/app.js"></script>` line.
 *   2. Sub-tab: in `client/js/app.js`, `MENU_DEFINITIONS.settings.subTabs`,
 *      add the string `'High Availability'` (once — it is shared with
 *      the settings-ui-ha.js form below).
 *   3. Branch: in `client/js/app.js`, `renderSettingsView()`, add BEFORE
 *      the default settings render (same pattern as the existing
 *      'Workflow Automation' / 'Probe Mutual Auth' / 'Central System Info'
 *      branches):
 *        if (state.currentSubTab === 'High Availability') {
 *          window.OpManager.renderHaStatusView();
 *          return;
 *        }
 *      This renders the STATUS view. OWNERSHIP (Phase 4 merge p4m-ha,
 *      decided): ha-ui.js OWNS the 'High Availability' sub-tab (this
 *      status view); settings-ui-ha.js owns ONLY the settings form,
 *      opened on demand by the "HA settings" button at the bottom of
 *      this view. The close-out agent must NOT call both renders
 *      back-to-back (each one writes `workspaceContent` and would
 *      overwrite the other). The button shows an honest note when the
 *      form partial is not loaded. That keeps one HA page with the
 *      live status on top and the editor one click away.
 *   4. This file registers itself below
 *      (`window.OpManager.renderHaStatusView = renderHaStatusView`),
 *      so step 3 works with no other app.js change.
 *
 * ENDPOINTS (canonical, Phase 4 merge — server/routes/ha.js on
 * server/services/ha.js):
 *   GET  /api/ha/status         — { status: 'success', ha: {
 *          status: 'single-node'|'healthy'|'degraded'|'unavailable',
 *          role, nodeId, promotedByFailover, heartbeatSec,
 *          missThreshold, graceMs, leaseTermMs, primaryAlive,
 *          standbyAlive, primaryUrl,
 *          peers: [{ peerId, role, url, lastSeenAt (epoch ms),
 *          msSinceSeen, missed, heartbeatCount, alive, status }],
 *          lease: { holder, acquired_at, expires_at } | null,
 *          probes: [{ url, reachable, latencyMs, error }],
 *          checkedAt } }
 *   GET  /api/ha/peers          — { status: 'success', peers, count }
 *   GET  /api/ha/decisions      — { status: 'success', decisions: [{
 *          id, at (ISO), action, type, detail, gapMs }], count }
 *   POST /api/ha/failover/test  — { status: 'success', failover: {
 *          wouldTrigger, decision, reason, role, primaryUrl,
 *          primaryPeerId, msSinceSeen, graceMs, leaseHolder,
 *          leaseExpiresAt, checkedAt } }
 *        DRY RUN ONLY: it reports whether failover WOULD trigger given
 *        current liveness. It never promotes, never changes role, never
 *        touches a device or firewall. The button below calls it and
 *        renders the verdict + per-check detail verbatim.
 *   If the routes have not landed yet, GET /api/ha/status answers 404
 *   and POST /api/ha/failover/test answers 404; if the service has not
 *   landed, both answer 501. Both cases render an honest "HA service
 *   not available in this build" state — never a fake status.
 *
 * SHAPE TOLERANCE: older Phase 3 shapes are normalised where they
 * differ (ha-proof's effectiveRole/promoted/peerUrl/events[] fields
 * and ha-routes' missedBeats/peerProbe fields). The canonical fields
 * above win when present; derived rows are labelled as such. No value
 * is shown that the server did not return. Canonical differences
 * patched in the Phase 4 merge: peers carry `missed` (not
 * missedBeats), probes arrive as a `probes[]` array (not a single
 * peerProbe), the failover lease is shown, the decision log is read
 * from GET /api/ha/decisions, and the badges cover the canonical
 * 'single-node' and 'unavailable' statuses.
 *
 * NO-STANDBY STATE: when no peer URL is configured and no peer has
 * ever sent a heartbeat, the status is 'single-node' and the view
 * renders the honest banner "No standby configured — this node is
 * running standalone" with the next step (set settings.ha.standbyUrl
 * / the HA settings form). No standby node, heartbeat, or failover
 * verdict is ever invented for that state.
 *
 * SECRETS: none. No password, token, key or peer secret is accepted,
 * displayed, or sent by this view. The peer secret is never part of any
 * status payload.
 */
(function () {
  var NS = 'p3-ha-ui-';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function val(v) {
    return v == null || v === '' ? '—' : String(v);
  }

  function fmtTime(v) {
    if (v == null || v === '') return '—';
    var d = new Date(typeof v === 'number' ? v : v);
    return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  }

  // "12s ago" / "3m ago" / "2h ago" from an ISO timestamp or an age in ms.
  function fmtAge(v, ageMs) {
    var ms = ageMs;
    if (ms == null) {
      if (v == null || v === '') return '—';
      var d = new Date(typeof v === 'number' ? v : v);
      if (Number.isNaN(d.getTime())) return String(v);
      ms = Date.now() - d.getTime();
    }
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60);
    if (h < 48) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }

  function fmtDurationSec(sec) {
    if (sec == null || sec === '' || !Number.isFinite(Number(sec))) return '—';
    var s = Math.floor(Number(sec));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + r + 's';
    return r + 's';
  }

  async function apiJson(url, options) {
    var res = await fetch(url, Object.assign({ credentials: 'include' }, options || {}));
    var data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (!res.ok) {
      var err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function $(id) { return document.getElementById(NS + id); }

  function badgeForStatus(statusText) {
    if (statusText === 'healthy') return '<span class="badge-me clear">● Healthy</span>';
    if (statusText === 'degraded') return '<span class="badge-me trouble">● Degraded</span>';
    if (statusText === 'standalone') return '<span class="badge-me attention">● Standalone</span>';
    if (statusText === 'single-node') return '<span class="badge-me attention">● Single node</span>';
    if (statusText === 'unavailable') return '<span class="badge-me critical">● Unavailable</span>';
    if (statusText === 'promoted') return '<span class="badge-me critical">● Promoted (failover)</span>';
    return '<span class="badge-me">● ' + esc(statusText || 'Unknown') + '</span>';
  }

  /**
   * Normalise the status shapes into one view model. Canonical
   * (Phase 4 merge): peers carry `missed` (not missedBeats), probes
   * arrive as a `probes[]` array, the failover lease is on `lease`,
   * promotion is `promotedByFailover`, and status is one of
   * single-node|healthy|degraded|unavailable. Older Phase 3 fields
   * (missedBeats, peerProbe, effectiveRole/promoted, events[]) are
   * still read as fallbacks. Fields the server did not return stay
   * null — never defaulted to a plausible-looking value.
   */
  function normalizeStatus(ha) {
    ha = ha || {};
    var peers = Array.isArray(ha.peers) ? ha.peers : [];
    // Canonical peers use `missed`; older shapes used `missedBeats`.
    peers = peers.map(function (p) {
      var q = Object.assign({}, p);
      if (q.missedBeats == null && q.missed != null) q.missedBeats = q.missed;
      return q;
    });
    var derivedPeer = false;
    if (!peers.length && (ha.peerUrl || ha.lastHeartbeatAt || ha.lastRegisteredFrom)) {
      derivedPeer = true;
      peers = [{
        peerId: ha.lastHeartbeatFrom || ha.lastRegisteredFrom || 'peer',
        role: ha.role === 'primary' ? 'standby' : 'primary',
        url: ha.peerUrl || null,
        lastSeenAt: ha.lastHeartbeatAt || ha.registeredAt || null,
        ageMs: null,
        ageSeconds: null,
        missedBeats: ha.missedAcks != null ? ha.missedAcks : null,
        heartbeatCount: ha.heartbeatsReceived != null ? ha.heartbeatsReceived : null,
        alive: ha.peerAlive != null ? ha.peerAlive : null,
        _derived: true,
      }];
    }
    var statusText = ha.status || null;
    if (!statusText) {
      if (ha.promoted) statusText = 'promoted';
      else if (ha.configured) statusText = 'configured';
      else statusText = 'standalone';
    }
    // Canonical probes[] array; older shapes had a single peerProbe.
    var probes = Array.isArray(ha.probes) ? ha.probes : null;
    var peerProbe = ha.peerProbe || null;
    if (!peerProbe && probes && probes.length) {
      var standbyUrl = ha.standbyUrl || ha.primaryUrl || ha.peerUrl || null;
      peerProbe = probes.filter(function (pr) { return pr.url === standbyUrl; })[0] || probes[0];
    }
    return {
      statusText: statusText,
      role: ha.role || null,
      effectiveRole: ha.effectiveRole || null,
      promoted: Boolean(ha.promotedByFailover != null ? ha.promotedByFailover : ha.promoted),
      configured: Boolean(ha.configured != null ? ha.configured : (ha.standbyUrl || ha.primaryUrl || peers.length)),
      standbyUrl: ha.standbyUrl || ha.primaryUrl || ha.peerUrl || null,
      heartbeatSec: ha.heartbeatSec != null ? ha.heartbeatSec : null,
      missThreshold: ha.missThreshold != null ? ha.missThreshold : null,
      leaseTermMs: ha.leaseTermMs != null ? ha.leaseTermMs : null,
      graceMs: ha.graceMs != null ? ha.graceMs : null,
      lease: ha.lease || null,
      self: ha.self || null,
      nodeId: ha.nodeId || null,
      peers: peers,
      derivedPeer: derivedPeer,
      livePeerCount: ha.livePeerCount != null ? ha.livePeerCount : peers.filter(function (p) { return p.alive; }).length,
      peerCount: ha.peerCount != null ? ha.peerCount : peers.length,
      peerProbe: peerProbe,
      probes: probes,
      heartbeatsReceived: ha.heartbeatsReceived != null ? ha.heartbeatsReceived : null,
      heartbeatsSent: ha.heartbeatsSent != null ? ha.heartbeatsSent : null,
      lastHeartbeatAt: ha.lastHeartbeatAt || null,
      lastHeartbeatAckAt: ha.lastHeartbeatAckAt || null,
      missedAcks: ha.missedAcks != null ? ha.missedAcks : null,
      lastFailoverAt: ha.lastFailoverAt || null,
      failoverReason: ha.failoverReason || null,
      lastReRegistrationAt: ha.lastReRegistrationAt || null,
      events: Array.isArray(ha.events) ? ha.events : [],
      evaluatedAt: ha.evaluatedAt || (ha.checkedAt != null ? ha.checkedAt : null),
      note: ha.note || null,
    };
  }

  function peerRowHtml(p) {
    var aliveBadge = p.alive == null
      ? '<span class="badge-me">unknown</span>'
      : (p.alive ? '<span class="badge-me clear">● Alive</span>' : '<span class="badge-me critical">● Stale</span>');
    return '<tr>' +
      '<td style="font-weight: 700;">' + esc(p.peerId || '—') + (p._derived ? ' <span style="color: var(--text-muted); font-weight: 400;">(from heartbeat state)</span>' : '') + '</td>' +
      '<td>' + esc(p.role || '—') + '</td>' +
      '<td>' + esc(p.url || '—') + '</td>' +
      '<td>' + esc(fmtTime(p.lastSeenAt)) + '<div style="color: var(--text-muted); font-size: 11px;">' + esc(fmtAge(p.lastSeenAt, p.ageMs)) + '</div></td>' +
      '<td>' + esc(p.missedBeats == null ? '—' : String(p.missedBeats)) + '</td>' +
      '<td>' + esc(p.heartbeatCount == null ? '—' : String(p.heartbeatCount)) + '</td>' +
      '<td>' + aliveBadge + '</td>' +
    '</tr>';
  }

  function peersHtml(model) {
    if (!model.peers.length) {
      return '<div style="padding: 30px 14px; text-align: center;">' +
        '<div style="font-size: 24px;">📭</div>' +
        '<div style="font-size: 14px; font-weight: 700; margin-top: 6px;">No peers registered</div>' +
        '<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">No peer node has sent a heartbeat to this node yet. A standby registers by heartbeating to the primary; until then this node has no peer to show.</div>' +
      '</div>';
    }
    return '<div style="overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: 12px;">' +
      '<thead><tr style="text-align: left; color: var(--text-muted); border-bottom: 1px solid var(--border-color);">' +
      '<th style="padding: 6px 8px;">Peer</th><th style="padding: 6px 8px;">Role</th><th style="padding: 6px 8px;">URL</th>' +
      '<th style="padding: 6px 8px;">Last seen</th><th style="padding: 6px 8px;">Missed beats</th>' +
      '<th style="padding: 6px 8px;">Heartbeats</th><th style="padding: 6px 8px;">Liveness</th></tr></thead>' +
      '<tbody>' + model.peers.map(peerRowHtml).join('') + '</tbody></table></div>';
  }

  function heartbeatHtml(model) {
    var rows = [];
    var probe = model.peerProbe;
    if (probe) {
      rows.push('<div><strong>Configured peer:</strong> ' + esc(probe.url || '—') + '</div>');
      rows.push('<div><strong>TCP probe (just now):</strong> ' + (probe.reachable
        ? 'reachable' + (probe.latencyMs != null ? ' — ' + esc(probe.latencyMs) + ' ms' : '')
        : 'NOT reachable' + (probe.error ? ' — ' + esc(probe.error) : '')) + '</div>');
    } else if (model.standbyUrl) {
      rows.push('<div><strong>Configured peer:</strong> ' + esc(model.standbyUrl) + '</div>');
      rows.push('<div><strong>TCP probe:</strong> not reported by this build</div>');
    } else {
      rows.push('<div><strong>Configured peer:</strong> none — no peer URL is configured, so there is no heartbeat target to probe.</div>');
    }
    rows.push('<div><strong>Heartbeat interval:</strong> ' + esc(model.heartbeatSec == null ? '—' : model.heartbeatSec + 's') +
      (model.missThreshold != null ? ' • peer treated as stale after ' + esc(model.missThreshold) + ' missed beats' : '') + '</div>');
    if (model.lastHeartbeatAt) rows.push('<div><strong>Last heartbeat received:</strong> ' + esc(fmtTime(model.lastHeartbeatAt)) + ' (' + esc(fmtAge(model.lastHeartbeatAt)) + ')</div>');
    if (model.lastHeartbeatAckAt) rows.push('<div><strong>Last heartbeat acknowledged:</strong> ' + esc(fmtTime(model.lastHeartbeatAckAt)) + ' (' + esc(fmtAge(model.lastHeartbeatAckAt)) + ')</div>');
    if (model.heartbeatsReceived != null) rows.push('<div><strong>Heartbeats received:</strong> ' + esc(model.heartbeatsReceived) + '</div>');
    if (model.heartbeatsSent != null) rows.push('<div><strong>Heartbeats sent:</strong> ' + esc(model.heartbeatsSent) + '</div>');
    if (model.missedAcks != null) rows.push('<div><strong>Missed heartbeat acks:</strong> ' + esc(model.missedAcks) + '</div>');
    rows.push('<div><strong>Live peers:</strong> ' + esc(model.livePeerCount) + ' of ' + esc(model.peerCount) + ' registered</div>');
    return rows.join('');
  }

  function decisionHtml(model) {
    var rows = [];
    rows.push('<div><strong>Failover decision state:</strong> ' + esc(model.statusText) + '</div>');
    if (model.lease) {
      rows.push('<div><strong>Failover lease:</strong> held by ' + esc(model.lease.holder || '—') +
        ' • expires ' + esc(fmtTime(model.lease.expires_at)) +
        (model.lease.expires_at != null && model.lease.expires_at <= Date.now() ? ' (expired)' : ' (live)') + '</div>');
    } else if (model.role === 'primary') {
      rows.push('<div><strong>Failover lease:</strong> none held — this primary has not taken the lease yet.</div>');
    }
    if (model.graceMs != null) rows.push('<div><strong>Missed-heartbeat budget:</strong> ' + esc(model.graceMs / 1000) + 's (' + esc(model.heartbeatSec == null ? '—' : model.heartbeatSec + 's') + ' × ' + esc(model.missThreshold == null ? '—' : String(model.missThreshold)) + ' missed beats)</div>');
    if (model.promoted) {
      rows.push('<div><strong>This node was PROMOTED to active by failover</strong>' + (model.lastFailoverAt ? ' at ' + esc(fmtTime(model.lastFailoverAt)) : '') + '.</div>');
    } else if (model.role === 'standby') {
      rows.push('<div>This node is on standby. It promotes itself to active only if the primary misses its heartbeat budget — use “Test failover” below to see whether that would trigger right now.</div>');
    } else if (!model.configured) {
      rows.push('<div>Failover cannot trigger: no standby is configured, so there is no node to take over.</div>');
    } else {
      rows.push('<div>This node is the primary. Failover is the standby\u2019s decision, not this node\u2019s — the standby promotes itself when this node stops heartbeating.</div>');
    }
    if (model.lastFailoverAt) rows.push('<div><strong>Last failover:</strong> ' + esc(fmtTime(model.lastFailoverAt)) + '</div>');
    if (model.failoverReason) rows.push('<div><strong>Failover reason:</strong> ' + esc(model.failoverReason) + '</div>');
    if (model.lastReRegistrationAt) rows.push('<div><strong>Primary re-registered:</strong> ' + esc(fmtTime(model.lastReRegistrationAt)) + ' (standby demoted back)</div>');
    if (model.events.length) {
      rows.push('<div style="margin-top: 10px;"><strong>Decision log (last ' + esc(model.events.length) + '):</strong></div>');
      rows.push('<div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">' + model.events.slice(-20).map(function (ev) {
        var when = ev.at || ev.time || ev.timestamp || null;
        var what = ev.type || ev.event || ev.action || 'event';
        var detail = ev.reason || ev.detail || '';
        return '<div style="padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px;">' +
          '<strong>' + esc(what) + '</strong> — ' + esc(fmtTime(when)) +
          (detail ? '<div style="color: var(--text-muted);">' + esc(typeof detail === 'string' ? detail : JSON.stringify(detail)) + '</div>' : '') +
        '</div>';
      }).join('') + '</div>');
    }
    return rows.join('');
  }

  function testResultHtml(f) {
    if (!f) return '';
    var verdict = f.wouldTrigger
      ? '<span class="badge-me critical">WOULD TRIGGER</span>'
      : '<span class="badge-me clear">Would NOT trigger</span>';
    var html = '<div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">' + verdict +
      '<span style="font-size: 12px; color: var(--text-muted);">Dry run — no failover was triggered, no role was changed.</span></div>';
    var evaluatedAt = f.evaluatedAt != null ? f.evaluatedAt : f.checkedAt;
    var missThreshold = f.missThreshold != null ? f.missThreshold : f.missedBeatsThreshold;
    html += '<div style="margin-top: 8px;"><strong>Evaluated:</strong> ' + esc(fmtTime(evaluatedAt)) +
      ' • <strong>This node\u2019s role:</strong> ' + esc(f.role || '—') +
      ' • <strong>Heartbeat interval:</strong> ' + esc(f.heartbeatSec == null ? '—' : f.heartbeatSec + 's') +
      ' • <strong>Missed-beat threshold:</strong> ' + esc(missThreshold == null ? '—' : String(missThreshold)) + '</div>';
    if (f.reason) html += '<div><strong>Reason:</strong> ' + esc(f.reason) + '</div>';
    if (f.primaryPeerId) html += '<div><strong>Primary peer:</strong> ' + esc(f.primaryPeerId) + '</div>';
    if (f.msSinceSeen != null) html += '<div><strong>Primary last seen:</strong> ' + esc(f.msSinceSeen) + ' ms ago (budget ' + esc(f.graceMs == null ? '—' : f.graceMs + ' ms') + ')</div>';
    if (f.leaseHolder) html += '<div><strong>Lease holder:</strong> ' + esc(f.leaseHolder) + (f.leaseExpiresAt != null ? ' • expires ' + esc(fmtTime(f.leaseExpiresAt)) : '') + '</div>';
    if (f.primaryUrl) html += '<div><strong>Primary watched:</strong> ' + esc(f.primaryUrl) + '</div>';
    if (f.primaryProbe) {
      html += '<div><strong>Primary TCP probe:</strong> ' + (f.primaryProbe.reachable
        ? 'reachable' + (f.primaryProbe.latencyMs != null ? ' — ' + esc(f.primaryProbe.latencyMs) + ' ms' : '')
        : 'NOT reachable' + (f.primaryProbe.error ? ' — ' + esc(f.primaryProbe.error) : '')) + '</div>';
    }
    if (f.missedBeats != null) html += '<div><strong>Primary missed beats:</strong> ' + esc(f.missedBeats) + '</div>';
    if (f.actionIfTriggered) html += '<div style="margin-top: 6px;"><strong>If triggered:</strong> ' + esc(f.actionIfTriggered) + '</div>';
    if (f.note) html += '<div style="color: var(--text-muted); margin-top: 6px;">' + esc(f.note) + '</div>';
    if (Array.isArray(f.checks) && f.checks.length) {
      html += '<div style="margin-top: 10px;"><strong>Decision checks:</strong></div>' +
        '<div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">' +
        f.checks.map(function (c) {
          return '<div style="padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px;">' +
            (c.passed ? '<span class="badge-me clear">PASS</span>' : '<span class="badge-me critical">FAIL</span>') +
            ' <strong>' + esc(c.check || 'check') + '</strong>' +
            (c.detail ? '<div style="color: var(--text-muted); margin-top: 2px;">' + esc(c.detail) + '</div>' : '') +
          '</div>';
        }).join('') + '</div>';
    }
    return html;
  }

  async function runTestFailover() {
    var box = $('test-result');
    var btn = $('test-btn');
    if (!box) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Evaluating…'; }
    box.style.display = 'block';
    box.style.borderColor = 'var(--border-color)';
    box.innerHTML = 'Evaluating failover decision… (dry run — nothing will be triggered.)';
    try {
      var res = await apiJson('/api/ha/failover/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      var f = res.failover || res || {};
      box.style.borderColor = f.wouldTrigger ? '#dc2626' : '#16a34a';
      box.innerHTML = testResultHtml(f);
    } catch (e) {
      box.style.borderColor = '#dc2626';
      if (e && (e.status === 404 || e.status === 501)) {
        box.innerHTML = '<strong>Failover test is not available in this build.</strong><br>' +
          'POST /api/ha/failover/test answered HTTP ' + esc(e.status) + ' — ' + esc(e.message) +
          '<br>The dry-run endpoint has not landed yet (ha-routes track). No failover was triggered and no verdict is shown, because none was computed.';
      } else {
        box.innerHTML = '<strong>Failover test failed:</strong> ' + esc(e.message);
      }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = '🧪 Test failover (dry run)'; }
    }
  }

  async function renderHaStatusView() {
    var ws = document.getElementById('workspaceContent');
    if (!ws) return;
    ws.innerHTML =
      '<div class="me-card">' +
        '<div class="me-card-header"><span class="me-card-title">🔁 High Availability</span>' +
        '<span id="' + NS + 'badge" class="badge-me" style="font-size: 10px;">Loading…</span>' +
        '<button id="' + NS + 'refresh" class="btn-me-secondary" style="padding: 4px 10px; font-size: 11px; margin-left: auto;">↻ Refresh</button></div>' +
        '<div class="me-card-body" style="font-size: 12px; line-height: 1.8;">' +
          '<div id="' + NS + 'banner" style="display: none; padding: 8px 10px; border: 1px solid var(--border-color); border-radius: 4px; margin-bottom: 12px;"></div>' +
          '<div id="' + NS + 'role"></div>' +
        '</div>' +
      '</div>' +
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">' +
        '<div class="me-card"><div class="me-card-header"><span class="me-card-title">👥 Peers</span></div>' +
        '<div class="me-card-body" id="' + NS + 'peers"></div></div>' +
        '<div class="me-card"><div class="me-card-header"><span class="me-card-title">💓 Heartbeat health</span></div>' +
        '<div class="me-card-body" id="' + NS + 'heartbeat" style="font-size: 12px; line-height: 1.8;"></div></div>' +
      '</div>' +
      '<div class="me-card" style="margin-top: 16px;"><div class="me-card-header"><span class="me-card-title">⚖️ Failover decision</span></div>' +
        '<div class="me-card-body" style="font-size: 12px; line-height: 1.8;">' +
          '<div id="' + NS + 'decision"></div>' +
          '<div style="display: flex; gap: 8px; margin-top: 14px; align-items: center; flex-wrap: wrap;">' +
            '<button id="' + NS + 'test-btn" class="btn-me-primary">🧪 Test failover (dry run)</button>' +
            '<span style="color: var(--text-muted);">Reports what WOULD happen. Never triggers failover, never changes role.</span>' +
          '</div>' +
          '<div id="' + NS + 'test-result" style="display: none; margin-top: 14px; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; line-height: 1.7;"></div>' +
        '</div>' +
      '</div>' +
      '<div style="margin-top: 16px; display: flex; gap: 8px; align-items: center;">' +
        '<button id="' + NS + 'settings-btn" class="btn-me-secondary">⚙️ HA settings</button>' +
        '<span id="' + NS + 'settings-note" style="font-size: 12px; color: var(--text-muted);"></span>' +
      '</div>';

    $('refresh').addEventListener('click', renderHaStatusView);
    $('test-btn').addEventListener('click', runTestFailover);
    $('settings-btn').addEventListener('click', function () {
      // Companion editor (settings-ui-ha.js). It renders into
      // workspaceContent itself, so it is opened on demand — never
      // auto-called, or it would overwrite this status view.
      if (typeof window !== 'undefined' && window.OpManager && typeof window.OpManager.renderHaSettingsView === 'function') {
        window.OpManager.renderHaSettingsView();
      } else {
        var note = $('settings-note');
        if (note) note.textContent = 'HA settings form is not loaded in this build (settings-ui-ha.js).';
      }
    });

    var badge = $('badge');
    var banner = $('banner');
    var statusData;
    try {
      statusData = await apiJson('/api/ha/status');
    } catch (e) {
      badge.textContent = 'Unavailable';
      banner.style.display = 'block';
      if (e && (e.status === 404 || e.status === 501)) {
        banner.textContent = 'HA service is not available in this build (GET /api/ha/status answered HTTP ' + e.status + '). No role, peer, or heartbeat data exists to show — the HA routes/service have not landed yet (ha-routes / ha-service tracks).';
      } else if (e && e.status === 401) {
        banner.textContent = 'Not signed in (HTTP 401). Sign in to view HA status.';
      } else if (e && e.status === 403) {
        banner.textContent = 'Access denied (HTTP 403): ' + e.message;
      } else {
        banner.textContent = 'Failed to load HA status: ' + e.message;
      }
      $('role').innerHTML = '<div style="color: var(--text-muted);">Role, peers, heartbeat health and failover state are unknown until the HA status endpoint answers.</div>';
      $('peers').innerHTML = '';
      $('heartbeat').innerHTML = '';
      $('decision').innerHTML = '';
      return;
    }

    var model = normalizeStatus(statusData.ha || statusData || {});
    // Decision log lives on GET /api/ha/decisions in the canonical
    // build (not inside the status payload); best-effort, never fatal.
    try {
      var decData = await apiJson('/api/ha/decisions?limit=20');
      if (decData && Array.isArray(decData.decisions) && decData.decisions.length) {
        model.events = decData.decisions;
        var lastPromote = decData.decisions.filter(function (d) { return d.action === 'ha.promote'; })[0];
        if (lastPromote) {
          model.lastFailoverAt = lastPromote.at;
          if (lastPromote.detail && lastPromote.detail.reason) model.failoverReason = lastPromote.detail.reason;
        }
        var lastRejoin = decData.decisions.filter(function (d) {
          return d.action === 'ha.demote' && d.detail && d.detail.reason &&
            String(d.detail.reason).indexOf('primary-rejoined') === 0;
        })[0];
        if (lastRejoin) model.lastReRegistrationAt = lastRejoin.at;
      }
    } catch (e) { /* the status payload's own events (if any) stand */ }
    badge.textContent = model.statusText.charAt(0).toUpperCase() + model.statusText.slice(1);
    if (!model.configured && !model.peers.length) {
      banner.style.display = 'block';
      banner.textContent = 'No standby configured — this node is running standalone. Set a standby URL in the HA settings (settings.ha.standbyUrl) and make sure the standby node is running, then a peer will appear below once it heartbeats in.';
    } else if (model.note) {
      banner.style.display = 'block';
      banner.textContent = model.note;
    }

    var roleRows = '<div><strong>Current role:</strong> ' + esc(model.role || '—') +
      (model.effectiveRole && model.effectiveRole !== model.role ? ' (effective: ' + esc(model.effectiveRole) + ')' : '') +
      (model.promoted ? ' — <span class="badge-me critical">PROMOTED to active by failover</span>' : '') + '</div>';
    if (model.nodeId) roleRows += '<div><strong>Node:</strong> ' + esc(model.nodeId) + '</div>';
    if (model.self) {
      roleRows += '<div><strong>This node:</strong> ' + esc(model.self.hostname || '—') +
        ' • uptime ' + esc(fmtDurationSec(model.self.uptimeSeconds)) +
        ' • started ' + esc(fmtTime(model.self.startedAt)) + '</div>';
    }
    roleRows += '<div><strong>Standby URL:</strong> ' + esc(model.standbyUrl || '—') + '</div>';
    roleRows += '<div><strong>Heartbeat interval:</strong> ' + esc(model.heartbeatSec == null ? '—' : model.heartbeatSec + 's') + '</div>';
    if (model.evaluatedAt) roleRows += '<div style="color: var(--text-muted);"><strong>Status evaluated:</strong> ' + esc(fmtTime(model.evaluatedAt)) + '</div>';
    $('role').innerHTML = roleRows;
    $('peers').innerHTML = peersHtml(model);
    $('heartbeat').innerHTML = heartbeatHtml(model);
    $('decision').innerHTML = decisionHtml(model);
  }

  if (typeof window !== 'undefined') {
    if (window.OpManager) window.OpManager.renderHaStatusView = renderHaStatusView;
    window.OpManagerHaUi = window.OpManagerHaUi || {};
    window.OpManagerHaUi.renderHaStatusView = renderHaStatusView;
    window.OpManagerHaUi.testFailover = runTestFailover;
    window.OpManagerHaUi.refresh = renderHaStatusView;
  }
})();
