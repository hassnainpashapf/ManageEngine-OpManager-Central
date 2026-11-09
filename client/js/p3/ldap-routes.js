/**
 * Phase 3 ldap-routes UI partial — self-contained, do NOT edit app.js.
 *
 * WIRES IN at: client/js/app.js, renderSettingsView() — the settings view.
 * The close-out agent should add an "Active Directory / LDAP" card there
 * and call window.OpManagerLdapRoutes.mount(containerEl) from it. This
 * file only defines the namespace; it touches no other app.js code.
 *
 * What it does: test the AD/LDAP bind (POST /api/settings/auth/ad/test),
 * list directory users (GET /api/ad/users) and groups (GET /api/ad/groups).
 * The bind password is asked per call (prompt) and sent in the request
 * body / header only — it is never stored anywhere by this UI.
 */
(function () {
  'use strict';

  async function apiJson(path, options) {
    const res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
    const text = await res.text();
    let body = null;
    try { body = JSON.parse(text); } catch (e) { body = { raw: text }; }
    if (!res.ok) {
      const err = new Error((body && body.message) || ('Request failed: ' + res.status));
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Ask for the bind password per call. Never persisted, never logged.
  function askBindPassword() {
    const pw = window.prompt('LDAP bind password (used for this call only, never stored):');
    return pw ? pw : null;
  }

  async function testAd(settings) {
    const password = askBindPassword();
    if (!password) return { status: 'error', message: 'Bind test cancelled: no password supplied.' };
    return apiJson('/api/settings/auth/ad/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({}, settings || {}, { password: password })),
    });
  }

  async function listUsers(q) {
    const password = askBindPassword();
    if (!password) return { status: 'error', message: 'User list cancelled: no password supplied.' };
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const suffix = params.toString() ? ('?' + params.toString()) : '';
    return apiJson('/api/ad/users' + suffix, {
      headers: { 'x-ldap-bind-password': password },
    });
  }

  async function listGroups(q) {
    const password = askBindPassword();
    if (!password) return { status: 'error', message: 'Group list cancelled: no password supplied.' };
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    const suffix = params.toString() ? ('?' + params.toString()) : '';
    return apiJson('/api/ad/groups' + suffix, {
      headers: { 'x-ldap-bind-password': password },
    });
  }

  function renderUsers(container, result) {
    if (!result || result.status !== 'success') {
      container.innerHTML = '<div class="me-alert me-alert-error">' + esc((result && result.message) || 'User lookup failed.') + '</div>';
      return;
    }
    const rows = (result.users || []).map(function (u) {
      return '<tr><td>' + esc(u.cn || '') + '</td><td>' + esc(u.sAMAccountName || '') + '</td><td>' + esc(u.displayName || '') + '</td><td>' + esc(u.mail || '') + '</td><td>' + esc(u.userPrincipalName || '') + '</td></tr>';
    }).join('');
    container.innerHTML = '<div style="font-size:12px;margin-bottom:6px;">' + result.count + ' user(s) from ' + esc(result.source.baseDn || '') + ' in ' + esc(result.latencyMs) + ' ms</div>' +
      '<table class="me-table"><thead><tr><th>CN</th><th>sAMAccountName</th><th>Display name</th><th>Mail</th><th>UPN</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function renderGroups(container, result) {
    if (!result || result.status !== 'success') {
      container.innerHTML = '<div class="me-alert me-alert-error">' + esc((result && result.message) || 'Group lookup failed.') + '</div>';
      return;
    }
    const rows = (result.groups || []).map(function (g) {
      return '<tr><td>' + esc(g.cn || '') + '</td><td>' + esc(g.sAMAccountName || '') + '</td><td>' + esc(g.description || '') + '</td><td>' + esc(g.memberCount) + '</td><td>' + esc((g.memberDns || []).join(', ')) + '</td></tr>';
    }).join('');
    container.innerHTML = '<div style="font-size:12px;margin-bottom:6px;">' + result.count + ' group(s) from ' + esc(result.source.baseDn || '') + ' in ' + esc(result.latencyMs) + ' ms</div>' +
      '<table class="me-table"><thead><tr><th>CN</th><th>sAMAccountName</th><th>Description</th><th>Members</th><th>Member DNs</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function mount(container) {
    if (!container) return;
    container.innerHTML =
      '<div class="me-card"><div class="me-card-header"><span class="me-card-title">🔐 Active Directory / LDAP</span></div>' +
      '<div class="me-card-body" style="font-size:12px;">' +
      '<div style="display:flex;gap:8px;margin-bottom:10px;">' +
      '<button type="button" class="me-btn" data-ldap-action="test">Test bind</button>' +
      '<button type="button" class="me-btn" data-ldap-action="users">List users</button>' +
      '<button type="button" class="me-btn" data-ldap-action="groups">List groups</button>' +
      '<input type="search" placeholder="Search (q)…" data-ldap-q style="flex:1;padding:6px;" />' +
      '</div><div data-ldap-out style="font-size:12px;">Bind password is asked per call and never stored.</div>' +
      '</div></div>';
    const out = container.querySelector('[data-ldap-out]');
    const qInput = container.querySelector('[data-ldap-q]');
    container.addEventListener('click', async function (ev) {
      const btn = ev.target.closest('[data-ldap-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-ldap-action');
      const q = qInput ? qInput.value.trim() : '';
      out.innerHTML = 'Working…';
      try {
        if (action === 'test') {
          const r = await testAd();
          out.innerHTML = '<pre style="white-space:pre-wrap;">' + esc(JSON.stringify(r, null, 2)) + '</pre>';
        } else if (action === 'users') {
          renderUsers(out, await listUsers(q));
        } else if (action === 'groups') {
          renderGroups(out, await listGroups(q));
        }
      } catch (err) {
        out.innerHTML = '<div class="me-alert me-alert-error">' + esc(err.message || String(err)) + '</div>';
      }
    });
  }

  window.OpManagerLdapRoutes = { testAd: testAd, listUsers: listUsers, listGroups: listGroups, mount: mount };
})();
