'use strict';
/**
 * NCM push approval queue — Phase 3 (ncm-push track).
 *
 * WIRE-IN (close-out agent): do NOT edit client/js/app.js directly.
 * In app.js, inside `renderNcmeeDashboard()` (the NCM EE view, which
 * renders the "Push Baseline" button bound to `pushBaselineToProbes()`),
 * after the configs table is rendered, call:
 *   window.OpManagerNcmPush.renderApprovals(DOM.workspace);
 * And in `pushBaselineToProbes()`, after the POST to /api/ccm/push
 * returns 202, the staged approval id is in `res.approvalId` — re-render
 * the queue so the new pending approval is visible immediately.
 *
 * This partial only reads/writes the approval-gate API added by this
 * track: GET /api/ccm/approvals, POST /api/ccm/approvals/:id/approve,
 * /reject, /execute (dry-run only — the server sends nothing anywhere).
 * It uses the same `apiJson` helper and `escapeHtml`/`fmtTime` helpers
 * app.js already defines; it assumes those globals exist on window.
 */
(function () {
  async function apiJson(url, options) {
    const res = await fetch(url, options || {});
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok) {
      const err = new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // Canonical timestamps are ISO strings (createdAt/decidedAt/
  // executedAt); epoch-ms values are still accepted. Phase 4 merge:
  // the old `new Date(Number(ms))` turned ISO strings into NaN.
  function fmt(v) {
    if (!v) return '—';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
  }

  async function renderApprovals(container) {
    if (!container) return;
    let host = container.querySelector('#ncm-push-approvals');
    if (!host) {
      host = document.createElement('div');
      host.id = 'ncm-push-approvals';
      container.appendChild(host);
    }
    let approvals = [];
    try {
      const res = await apiJson('/api/ccm/approvals');
      approvals = res.approvals || [];
    } catch (e) {
      host.innerHTML = `<div class="me-card" style="padding: 16px; color: var(--severity-critical);">Couldn't load push approvals — ${esc(e.message)}</div>`;
      return;
    }
    if (!approvals.length) {
      host.innerHTML = `<div class="me-card" style="padding: 16px; color: var(--text-muted);">No staged config pushes. Pushes staged from “Push Baseline” appear here for approval.</div>`;
      return;
    }
    host.innerHTML = `
      <div class="me-card" style="padding: 16px; margin-top: 16px;">
        <div style="font-weight: 800; margin-bottom: 10px;">🔐 Staged config pushes (approval gate — dry-run only)</div>
        <table class="me-table"><thead><tr>
          <th>Configuration</th><th>Target probe</th><th>Commands</th>
          <th>Status</th><th>Staged by</th><th>Staged</th><th>Actions</th>
        </tr></thead><tbody>
        ${approvals.map((a) => `
          <tr>
            <td><code>${esc(a.configurationType || '—')}</code></td>
            <td><code>${esc(a.targetProbeId || 'all')}</code></td>
            <td>${Array.isArray(a.commands) ? a.commands.length : 0}</td>
            <td>${esc(a.status)}</td>
            <td>${esc(a.createdBy || '—')}</td>
            <td>${fmt(a.createdAt)}</td>
            <td>${a.status === 'pending' ? `
              <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManagerNcmPush.decide('${esc(a.id)}','approve')">Approve</button>
              <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManagerNcmPush.decide('${esc(a.id)}','reject')">Reject</button>` : ''}
              ${a.status === 'approved' ? `
              <button class="btn-me-secondary" style="padding: 2px 8px; font-size: 11px;" onclick="window.OpManagerNcmPush.executeDryRun('${esc(a.id)}')">Dry-run execute</button>` : ''}
              ${a.status === 'dry-run' ? `<span style="color: var(--text-muted); font-size: 11px;">dry-run done — nothing sent</span>` : ''}
            </td>
          </tr>`).join('')}
        </tbody></table>
      </div>`;
  }

  async function decide(id, verb) {
    try {
      await apiJson(`/api/ccm/approvals/${encodeURIComponent(id)}/${verb}`, { method: 'POST' });
      await renderApprovals(document.querySelector('#ncm-push-approvals')?.parentElement || document.body);
    } catch (e) {
      alert(`${verb} failed: ${e.message}`);
    }
  }

  async function executeDryRun(id) {
    try {
      const res = await apiJson(`/api/ccm/approvals/${encodeURIComponent(id)}/execute`, { method: 'POST' });
      const cmds = (res.commands || []).join('\n');
      alert(`Dry run only — nothing was sent.\n\n${cmds}`);
      await renderApprovals(document.querySelector('#ncm-push-approvals')?.parentElement || document.body);
    } catch (e) {
      alert(`Dry-run execute failed: ${e.message}`);
    }
  }

  window.OpManagerNcmPush = { renderApprovals, decide, executeDryRun };
})();
