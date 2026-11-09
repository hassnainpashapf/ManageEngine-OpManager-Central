/**
 * p3/ncm-drift.js — drift-resolution approval-gate UI (Phase 3, ncm-drift).
 *
 * WIRE-IN (close-out agent): client/js/app.js, function `openConfigDiff`
 * (~line 3170). Its `DOM.btnResolveDrift.onclick` handler (~line 3212)
 * currently POSTs /api/ccm/resolve-drift and, on ANY success, alerts
 * "Config drift resolved." and closes the modal. That is WRONG now:
 * resolve-drift returns 202 with a PENDING approval — nothing is resolved
 * and nothing was sent to the device. Replace that handler with:
 *
 *   DOM.btnResolveDrift.onclick = () => window.NcmDrift.stageDriftResolution(deviceId, {
 *     onStaged: (payload) => { // 202: show approval panel, keep modal open
 *       document.getElementById('diffApprovalPanel').innerHTML =
 *         window.NcmDrift.renderApprovalPanel(payload);
 *       window.NcmDrift.bindApprovalPanel(payload, { onDone: () => renderCurrentView() });
 *     },
 *     onNoDrift: (payload) => alert(payload.message),
 *     onError: (err) => alert('Could not resolve drift: ' + err.message),
 *   });
 *
 * and add `<div id="diffApprovalPanel"></div>` inside the config-diff modal
 * markup. app.js is NOT edited by this track (merge collisions); this file
 * is self-contained on purpose: app.js lives inside an IIFE, so its
 * apiJson/escapeHtml/DOM helpers are not reachable here — the equivalents
 * below are duplicated, not imported.
 *
 * Flow (matches server/routes/diff.js):
 *   1. stageDriftResolution() POSTs /api/ccm/resolve-drift { deviceId }.
 *      202 -> approval pending: renderApprovalPanel() shows the EXACT diff
 *      (added/removed lines) and the EXACT remediation commands plus the
 *      approval id, with Approve / Reject / Dry-run execute buttons.
 *      200 + hasDrift false -> onNoDrift (nothing staged, nothing sent).
 *      422 -> onError with the server's message naming the missing side
 *      (baseline or current config); 404 -> unknown device.
 *   2. Approve calls POST /api/ccm/drift-approvals/:id/approve.
 *      Approving alone executes NOTHING.
 *   3. Dry-run execute calls POST /api/ccm/drift-approvals/:id/execute
 *      { dryRun: true } and ONLY ever with dryRun true: this phase has no
 *      live push. The server answers dryRun:true, sentToDevice:false.
 *      Executing before approval is refused by the server (409).
 *   4. Reject calls POST /api/ccm/drift-approvals/:id/reject.
 *
 * No UI path in this file ever sends a non-dry-run execute.
 */
(function () {
  'use strict';

  async function apiJson(url, options) {
    const res = await fetch(url, { credentials: 'include', ...(options || {}) });
    let data = null;
    try { data = await res.json(); } catch (e) { /* non-JSON body */ }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.error)) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data || {};
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function postJson(url, body) {
    return apiJson(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
    });
  }

  /**
   * Stage drift resolution for a device. Callbacks:
   *   onStaged(payload) — 202, approval pending (payload.approvalId,
   *     payload.addedLines/removedLines, payload.commands).
   *   onNoDrift(payload) — 200, hasDrift false (or drift with no
   *     remediable commands); nothing was staged.
   *   onError(err) — 400/404/422/409/502 with the server's message.
   */
  async function stageDriftResolution(deviceId, callbacks) {
    const cb = callbacks || {};
    try {
      const payload = await postJson('/api/ccm/resolve-drift', { deviceId });
      if (payload.hasDrift === true && payload.approvalId) {
        if (typeof cb.onStaged === 'function') cb.onStaged(payload);
      } else if (typeof cb.onNoDrift === 'function') {
        cb.onNoDrift(payload);
      }
      return payload;
    } catch (err) {
      if (typeof cb.onError === 'function') cb.onError(err);
      throw err;
    }
  }

  /** HTML for a staged (pending) approval: exact diff + exact commands. */
  function renderApprovalPanel(payload) {
    const approval = payload.approval || {};
    const added = (payload.addedLines || []).map((t) => `<div class="diff-line added"><span>+ ${escapeHtml(t)}</span></div>`).join('');
    const removed = (payload.removedLines || []).map((t) => `<div class="diff-line removed"><span>- ${escapeHtml(t)}</span></div>`).join('');
    const commands = (payload.commands || []).map((c) => `<div><code>${escapeHtml(c)}</code></div>`).join('');
    return `
      <div class="me-card" style="margin-top: 12px;">
        <div class="me-card-header">
          <span class="me-card-title">🛡️ Drift remediation staged — approval required</span>
          <span class="badge-me attention">PENDING</span>
        </div>
        <div class="me-card-body">
          <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
            Approval <code>${escapeHtml(payload.approvalId || '')}</code> •
            Device ${escapeHtml(payload.deviceName || '')} (${escapeHtml(payload.ip || '—')}) •
            Baseline <code>${escapeHtml(payload.baselineType || '—')}</code> vs current
            <code>${escapeHtml(payload.currentType || '—')}</code> •
            ${payload.addedLinesCount || 0} added / ${payload.removedLinesCount || 0} removed lines.
            Nothing has been sent to the device.
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
            <div><strong>Lines to remove (in current, not in baseline)</strong>${added || '<div>—</div>'}</div>
            <div><strong>Lines to restore (in baseline, not in current)</strong>${removed || '<div>—</div>'}</div>
          </div>
          <div style="margin-bottom: 10px;"><strong>Remediation commands (staged, not sent)</strong>${commands || '<div>—</div>'}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn-me-primary" data-ncm-drift-approve="${escapeHtml(payload.approvalId || '')}">✓ Approve</button>
            <button class="btn-me-secondary" data-ncm-drift-reject="${escapeHtml(payload.approvalId || '')}">✕ Reject</button>
            <button class="btn-me-secondary" data-ncm-drift-dryrun="${escapeHtml(payload.approvalId || '')}" disabled title="Approve first — unapproved changes cannot execute">▶ Dry-run execute</button>
          </div>
          <div data-ncm-drift-result style="margin-top: 10px; font-size: 12px;"></div>
        </div>
      </div>`;
  }

  /** Wire the buttons rendered by renderApprovalPanel(). */
  function bindApprovalPanel(payload, opts) {
    const options = opts || {};
    const id = payload.approvalId;
    const resultEl = document.querySelector('[data-ncm-drift-result]');
    const dryRunBtn = document.querySelector('[data-ncm-drift-dryrun]');
    const approveBtn = document.querySelector('[data-ncm-drift-approve]');
    const rejectBtn = document.querySelector('[data-ncm-drift-reject]');
    const say = (html) => { if (resultEl) resultEl.innerHTML = html; };

    if (approveBtn) {
      approveBtn.onclick = async () => {
        approveBtn.disabled = true;
        try {
          const r = await postJson(`/api/ccm/drift-approvals/${encodeURIComponent(id)}/approve`, {});
          say(`<span class="badge-me clear">APPROVED</span> by ${escapeHtml(r.approval.decidedBy || '')} — nothing sent yet. Run the dry-run to preview the commands.`);
          if (dryRunBtn) { dryRunBtn.disabled = false; dryRunBtn.title = ''; }
          approveBtn.disabled = true;
          if (rejectBtn) rejectBtn.disabled = true;
        } catch (e) {
          say(`Approve failed: ${escapeHtml(e.message)}`);
          approveBtn.disabled = false;
        }
      };
    }
    if (rejectBtn) {
      rejectBtn.onclick = async () => {
        rejectBtn.disabled = true;
        try {
          await postJson(`/api/ccm/drift-approvals/${encodeURIComponent(id)}/reject`, {});
          say('<span class="badge-me trouble">REJECTED</span> — the staged remediation will never execute.');
          if (approveBtn) approveBtn.disabled = true;
          if (dryRunBtn) dryRunBtn.disabled = true;
        } catch (e) {
          say(`Reject failed: ${escapeHtml(e.message)}`);
          rejectBtn.disabled = false;
        }
      };
    }
    if (dryRunBtn) {
      dryRunBtn.onclick = async () => {
        dryRunBtn.disabled = true;
        try {
          // Dry-run ONLY — this phase has no live push, and this UI never
          // sends a non-dry-run execute.
          const r = await postJson(`/api/ccm/drift-approvals/${encodeURIComponent(id)}/execute`, { dryRun: true });
          const cmds = (r.wouldSend || []).map((c) => `<div><code>${escapeHtml(c)}</code></div>`).join('');
          say(`<span class="badge-me clear">DRY-RUN</span> — these commands were <strong>NOT</strong> sent to the device (sentToDevice: false):${cmds}`);
          if (typeof options.onDone === 'function') options.onDone(r);
        } catch (e) {
          say(`Dry-run failed: ${escapeHtml(e.message)}`);
          dryRunBtn.disabled = false;
        }
      };
    }
  }

  window.NcmDrift = {
    stageDriftResolution,
    renderApprovalPanel,
    bindApprovalPanel,
  };
})();
