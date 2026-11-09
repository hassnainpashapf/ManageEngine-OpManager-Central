/**
 * snmpv3-ui.js — Phase 4 merge (branch p4m-snmpv3) of the Phase 3
 * `snmpv3-ui` partial (port 8105).
 *
 * Device SNMPv3 credentials UI (self-contained partial), re-pointed at
 * the canonical server: device.snmp columns snmp_v3_* (tools names),
 * mask '******' (6 chars), PUT /api/devices/:id is admin-only, and all
 * three USM security levels are supported (noAuthNoPriv / authNoPriv /
 * authPriv — the Phase 3 form required both passphrases).
 *
 * WIRING (for the close-out agent — this file does NOT edit app.js):
 *   1. Add-Device modal: in `client/js/app.js`, inside the Add Device modal
 *      markup / `DOM.addDeviceForm` submit handler (the handler registered
 *      near `DOM.addDeviceForm.addEventListener('submit', ...)` that today
 *      POSTs `{ probeId, ip, name, category, credential }` to
 *      `/api/json/device/add`), add a container `<div id="devSnmpFields">`
 *      inside the form and call:
 *        `Snmpv3UI.renderSnmpFields(document.getElementById('devSnmpFields'))`
 *      when the modal opens, and replace the submit payload with:
 *        `Snmpv3UI.buildDevicePayload({ ip, name, category, probeId },
 *                                      Snmpv3UI.collectSnmp(container))`
 *      then `await Snmpv3UI.createDevice(payload)`.
 *   2. Device edit / snapshot view: same two calls, then
 *      `await Snmpv3UI.updateDeviceSnmp(deviceId, snmp)` for an existing
 *      device, and `Snmpv3UI.pollDevice(deviceId)` + 
 *      `Snmpv3UI.renderPollStatus(el, result)` to show the v3 poll status.
 *   3. Include this file AFTER `client/js/app.js` in the console shell
 *      (`client/itom.html` script list) — it only defines the global
 *      `Snmpv3UI` namespace and touches no app.js state on load.
 *
 * SECURITY:
 *   - Auth/priv passphrases use `<input type="password">` and are NEVER
 *     written back into the DOM, never rendered in any status view, and
 *     never passed to `console.log` (this file logs no credential values
 *     at all — only field-presence booleans on validation errors).
 *   - The server masks secrets in every device response (`snmp.community`,
 *     `snmp.v3.authPass`, `snmp.v3.privPass` come back as `******`);
 *     this file treats any `******` value as "unchanged — do not resend".
 *   - Canonical shape (SHARED.md): `device.snmp = { version: 'v2c'|'v3',
 *     community, v3: { user, authProtocol: 'md5'|'sha', authPass,
 *     privProtocol: 'des'|'aes', privPass } }`. The payload also carries
 *     the flat legacy fields (`snmpVersion`, `community`) so the pre-v3
 *     server still stores version/community.
 *   - Security levels (Phase 4 merge): the form offers all three USM
 *     levels — noAuthNoPriv (user only), authNoPriv (user + auth), and
 *     authPriv (user + auth + priv). The old form required BOTH
 *     passphrases; a v3 device that only needs authNoPriv or noAuthNoPriv
 *     can now be created/edited from this UI.
 */
(function (global) {
  'use strict';

  var MASKED = '******'; // canonical server mask (store.SECRET_MASK)
  var MIN_PASSPHRASE_LEN = 8; // SNMP USM minimum for auth/priv passphrases

  var VERSIONS = [
    { value: 'v2c', label: 'SNMPv2c (community)' },
    { value: 'v3', label: 'SNMPv3 (user / auth / priv)' }
  ];
  var SECURITY_LEVELS = [
    { value: 'noAuthNoPriv', label: 'noAuthNoPriv (username only)' },
    { value: 'authNoPriv', label: 'authNoPriv (username + auth passphrase)' },
    { value: 'authPriv', label: 'authPriv (username + auth + privacy passphrases)' }
  ];
  var AUTH_PROTOCOLS = [
    { value: 'md5', label: 'MD5' },
    { value: 'sha', label: 'SHA' }
  ];
  var PRIV_PROTOCOLS = [
    { value: 'des', label: 'DES' },
    { value: 'aes', label: 'AES' }
  ];

  // ---------------------------------------------------------------- helpers
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function fieldRow(labelText, input, hint) {
    var row = el('div', { className: 'p3-snmp-row' });
    var label = el('label', { className: 'p3-snmp-label' }, labelText);
    row.appendChild(label);
    row.appendChild(input);
    if (hint) row.appendChild(el('div', { className: 'p3-snmp-hint' }, hint));
    return row;
  }

  function selectWithOptions(id, options, selected) {
    var sel = el('select', { id: id, className: 'p3-snmp-input' });
    options.forEach(function (opt) {
      var o = el('option', { value: opt.value }, opt.label);
      if (opt.value === selected) o.selected = true;
      sel.appendChild(o);
    });
    return sel;
  }

  function isMasked(value) {
    return value === MASKED;
  }

  // ------------------------------------------------------- render the form
  /**
   * Render the SNMP credential fields into `container`.
   * `existing` is an optional device record as returned by the API
   * (masked `snmp` object). Passphrases are never pre-filled from it:
   * password inputs are left blank and a blank value on submit means
   * "keep the stored secret" for updates.
   */
  function renderSnmpFields(container, existing) {
    if (!container) throw new Error('Snmpv3UI.renderSnmpFields: container is required');
    container.innerHTML = '';

    var snmp = (existing && existing.snmp) || {};
    var version = snmp.version === 'v3' ? 'v3' : 'v2c';
    var v3 = snmp.v3 || {};
    // Derive the stored security level from the (unmasked) protocol
    // fields: a stored privProtocol means authPriv, a stored
    // authProtocol means authNoPriv, neither means noAuthNoPriv.
    var level = v3.privProtocol ? 'authPriv'
      : v3.authProtocol ? 'authNoPriv' : 'noAuthNoPriv';

    var wrap = el('div', { className: 'p3-snmp-fields' });
    wrap.appendChild(el('div', { className: 'p3-snmp-title' }, 'SNMP Credentials'));

    var versionSel = selectWithOptions('p3SnmpVersion', VERSIONS, version);
    wrap.appendChild(fieldRow('SNMP version', versionSel));

    var v2cBox = el('div', { className: 'p3-snmp-v2c' });
    var communityInput = el('input', {
      id: 'p3SnmpCommunity', type: 'text', className: 'p3-snmp-input',
      autocomplete: 'off', placeholder: 'public'
    });
    // Community is a secret too: never echo a stored value back.
    // A masked value from the server means "already set"; leave blank.
    communityInput.value = '';
    v2cBox.appendChild(fieldRow('Community string', communityInput,
      'Stored value is never shown. Leave blank to keep the stored community.'));
    wrap.appendChild(v2cBox);

    var v3Box = el('div', { className: 'p3-snmp-v3' });
    var userInput = el('input', {
      id: 'p3SnmpV3User', type: 'text', className: 'p3-snmp-input',
      autocomplete: 'off', placeholder: 'e.g. snmpuser'
    });
    userInput.value = v3.user || '';
    v3Box.appendChild(fieldRow('SNMPv3 username', userInput));

    var levelSel = selectWithOptions('p3SnmpSecurityLevel', SECURITY_LEVELS, level);
    v3Box.appendChild(fieldRow('Security level', levelSel));

    var authBox = el('div', { className: 'p3-snmp-auth' });
    var authProtoSel = selectWithOptions('p3SnmpAuthProtocol', AUTH_PROTOCOLS,
      v3.authProtocol === 'sha' ? 'sha' : 'md5');
    authBox.appendChild(fieldRow('Auth protocol', authProtoSel));

    var authPassInput = el('input', {
      id: 'p3SnmpAuthPass', type: 'password', className: 'p3-snmp-input',
      autocomplete: 'new-password', placeholder: 'Auth passphrase (min 8 chars)'
    });
    authBox.appendChild(fieldRow('Auth passphrase', authPassInput,
      'Never displayed back. Leave blank on edit to keep the stored passphrase.'));
    v3Box.appendChild(authBox);

    var privBox = el('div', { className: 'p3-snmp-priv' });
    var privProtoSel = selectWithOptions('p3SnmpPrivProtocol', PRIV_PROTOCOLS,
      v3.privProtocol === 'aes' ? 'aes' : 'des');
    privBox.appendChild(fieldRow('Privacy protocol', privProtoSel));

    var privPassInput = el('input', {
      id: 'p3SnmpPrivPass', type: 'password', className: 'p3-snmp-input',
      autocomplete: 'new-password', placeholder: 'Privacy passphrase (min 8 chars)'
    });
    privBox.appendChild(fieldRow('Privacy passphrase', privPassInput,
      'Never displayed back. Leave blank on edit to keep the stored passphrase.'));
    v3Box.appendChild(privBox);

    wrap.appendChild(v3Box);

    function syncVisibility() {
      var isV3 = versionSel.value === 'v3';
      v2cBox.style.display = isV3 ? 'none' : '';
      v3Box.style.display = isV3 ? '' : 'none';
      var lvl = levelSel.value;
      authBox.style.display = (isV3 && lvl !== 'noAuthNoPriv') ? '' : 'none';
      privBox.style.display = (isV3 && lvl === 'authPriv') ? '' : 'none';
    }
    versionSel.addEventListener('change', syncVisibility);
    levelSel.addEventListener('change', syncVisibility);
    syncVisibility();

    container.appendChild(wrap);

    return {
      container: container,
      version: versionSel,
      community: communityInput,
      v3User: userInput,
      securityLevel: levelSel,
      authProtocol: authProtoSel,
      authPass: authPassInput,
      privProtocol: privProtoSel,
      privPass: privPassInput
    };
  }

  // ------------------------------------------------------------ collect data
  function byId(container, id) {
    return container.querySelector('#' + id);
  }

  /**
   * Read the rendered fields and return the canonical `snmp` object.
   * Throws an Error naming the problem (no secret values in the message).
   * For updates, pass `isUpdate = true`: blank passphrases mean "unchanged"
   * and are omitted from the returned object.
   *
   * Security level drives which fields are required (Phase 4 merge):
   *   noAuthNoPriv — username only (no passphrases at all)
   *   authNoPriv   — username + auth protocol + auth passphrase
   *   authPriv     — username + auth + privacy protocol + priv passphrase
   * A passphrase supplied at a level that does not use it is an error
   * (privacy without auth is not valid USM); on update, a passphrase
   * left blank keeps the stored one only at a level that uses it.
   */
  function collectSnmp(container, isUpdate) {
    if (!container) throw new Error('Snmpv3UI.collectSnmp: container is required');
    var version = (byId(container, 'p3SnmpVersion') || {}).value || 'v2c';
    if (version !== 'v2c' && version !== 'v3') {
      throw new Error('SNMP version must be v2c or v3.');
    }

    var snmp = { version: version };

    if (version === 'v2c') {
      var community = ((byId(container, 'p3SnmpCommunity') || {}).value || '').trim();
      // A blank community on update means "keep stored"; on create the
      // server defaults to 'public' when nothing is supplied.
      if (community && !isMasked(community)) snmp.community = community;
      return snmp;
    }

    // v3 — level-driven (see header comment).
    var user = ((byId(container, 'p3SnmpV3User') || {}).value || '').trim();
    if (!user) throw new Error('SNMPv3 username is required.');
    var level = (byId(container, 'p3SnmpSecurityLevel') || {}).value || 'authPriv';
    if (level !== 'noAuthNoPriv' && level !== 'authNoPriv' && level !== 'authPriv') {
      throw new Error('SNMPv3 security level must be noAuthNoPriv, authNoPriv or authPriv.');
    }
    var authProtocol = (byId(container, 'p3SnmpAuthProtocol') || {}).value || 'md5';
    if (authProtocol !== 'md5' && authProtocol !== 'sha') {
      throw new Error('SNMPv3 auth protocol must be MD5 or SHA.');
    }
    var authPass = (byId(container, 'p3SnmpAuthPass') || {}).value || '';
    var privProtocol = (byId(container, 'p3SnmpPrivProtocol') || {}).value || 'des';
    if (privProtocol !== 'des' && privProtocol !== 'aes') {
      throw new Error('SNMPv3 privacy protocol must be DES or AES.');
    }
    var privPass = (byId(container, 'p3SnmpPrivPass') || {}).value || '';

    snmp.v3 = { user: user };
    if (level === 'noAuthNoPriv') {
      if (authPass || privPass) {
        throw new Error('SNMPv3 noAuthNoPriv uses no passphrases — clear the auth/privacy fields or pick a higher security level.');
      }
      // Explicit nulls: on update they clear any stored auth/priv
      // credentials (the server merges partial v3 over stored values,
      // so omitting the keys would silently keep the old level).
      snmp.v3.authProtocol = null;
      snmp.v3.authPass = null;
      snmp.v3.privProtocol = null;
      snmp.v3.privPass = null;
      return snmp;
    }
    // authNoPriv and authPriv both need auth.
    snmp.v3.authProtocol = authProtocol;
    if (!isUpdate || authPass) {
      if (authPass.length < MIN_PASSPHRASE_LEN) {
        throw new Error('SNMPv3 auth passphrase must be at least 8 characters.');
      }
      snmp.v3.authPass = authPass;
    }
    if (level === 'authNoPriv') {
      if (privPass) {
        throw new Error('SNMPv3 authNoPriv uses no privacy passphrase — clear it or pick authPriv.');
      }
      // Explicit nulls clear any stored privacy credentials on update
      // (see noAuthNoPriv above).
      snmp.v3.privProtocol = null;
      snmp.v3.privPass = null;
      return snmp;
    }
    // authPriv needs privacy too.
    snmp.v3.privProtocol = privProtocol;
    if (!isUpdate || privPass) {
      if (privPass.length < MIN_PASSPHRASE_LEN) {
        throw new Error('SNMPv3 privacy passphrase must be at least 8 characters.');
      }
      snmp.v3.privPass = privPass;
    }
    return snmp;
  }

  /** Flat legacy fields for the pre-v3 server (version + community only). */
  function snmpToFlat(snmp) {
    var flat = {};
    if (!snmp) return flat;
    if (snmp.version) flat.snmpVersion = snmp.version;
    if (snmp.community) flat.community = snmp.community;
    return flat;
  }

  /**
   * Build the device create payload: canonical `snmp` plus flat compat
   * fields, so the current server stores version/community and the
   * snmpv3-service build stores the full v3 credential.
   */
  function buildDevicePayload(base, snmp) {
    var payload = {
      ip: (base.ip || '').trim(),
      name: (base.name || '').trim(),
      category: base.category,
      probeId: base.probeId,
      snmp: snmp
    };
    var flat = snmpToFlat(snmp);
    if (flat.snmpVersion) payload.snmpVersion = flat.snmpVersion;
    if (flat.community) payload.community = flat.community;
    if (!payload.ip) throw new Error('Device IP is required.');
    return payload;
  }

  // ------------------------------------------------------------- API calls
  function checkResponse(res) {
    return res.json().then(function (body) {
      if (!res.ok || (body && body.status === 'error')) {
        var err = new Error((body && body.message) || ('Request failed (HTTP ' + res.status + ')'));
        err.httpStatus = res.status;
        err.body = body;
        throw err;
      }
      return body;
    });
  }

  function createDevice(payload) {
    return fetch('/api/json/device/add', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(checkResponse);
  }

  function updateDeviceSnmp(deviceId, snmp) {
    if (deviceId === undefined || deviceId === null || deviceId === '') {
      return Promise.reject(new Error('Device id is required to update SNMP credentials.'));
    }
    return fetch('/api/devices/' + encodeURIComponent(deviceId), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snmp: snmp })
    }).then(checkResponse);
  }

  function getDevice(deviceId) {
    return fetch('/api/devices/' + encodeURIComponent(deviceId), {
      credentials: 'include'
    }).then(checkResponse);
  }

  /**
   * Poll the device now and return the server's poll result.
   * Resolves with `{ ok, status, message, poll, device }` — `ok` is false
   * (with the server's reason) when the poll fails, e.g. while the
   * poller has no SNMPv3 support yet. Never invents an Up status.
   */
  function pollDevice(deviceId) {
    return fetch('/api/devices/' + encodeURIComponent(deviceId) + '/poll-now', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: deviceId })
    }).then(function (res) {
      return res.json().then(function (body) {
        var poll = body && body.poll;
        var status = (poll && poll.status) || (body && body.device && body.device.status) || 'Unknown';
        return {
          ok: res.ok && status === 'Up',
          status: status,
          message: (body && body.message) || '',
          poll: poll || null,
          device: (body && body.device) || null,
          httpStatus: res.status
        };
      });
    });
  }

  // ------------------------------------------------------------ render status
  /**
   * Render the poll result into `container`. Shows the server-returned
   * status verbatim; a v3 device on a build without v3 polling shows the
   * real failure reason, not a fake Up.
   */
  function renderPollStatus(container, result) {
    if (!container) throw new Error('Snmpv3UI.renderPollStatus: container is required');
    container.innerHTML = '';
    var box = el('div', {
      className: 'p3-snmp-poll ' + (result.ok ? 'p3-snmp-poll-ok' : 'p3-snmp-poll-bad')
    });
    box.appendChild(el('div', { className: 'p3-snmp-poll-status' },
      'SNMP poll: ' + (result.status || 'Unknown')));
    if (result.message) box.appendChild(el('div', { className: 'p3-snmp-poll-msg' }, result.message));
    if (result.poll && result.poll.error) {
      box.appendChild(el('div', { className: 'p3-snmp-poll-msg' }, 'Poll error: ' + result.poll.error));
    }
    if (!result.ok) {
      box.appendChild(el('div', { className: 'p3-snmp-hint' },
        'If this is an SNMPv3 device, the poller build must support SNMPv3 ' +
        '(snmpv3-poller track). The stored credentials above are unaffected.'));
    }
    container.appendChild(box);
    return box;
  }

  /**
   * Client-side display sanitiser: returns a copy of a device record with
   * every secret replaced by the mask. Use for any view that shows a
   * stored device; never render raw passphrases.
   */
  function sanitizeForDisplay(device) {
    if (!device) return device;
    var copy = JSON.parse(JSON.stringify(device));
    if (copy.snmp_community) copy.snmp_community = MASKED;
    if (copy.snmp) {
      if (copy.snmp.community) copy.snmp.community = MASKED;
      if (copy.snmp.v3) {
        if (copy.snmp.v3.authPass) copy.snmp.v3.authPass = MASKED;
        if (copy.snmp.v3.privPass) copy.snmp.v3.privPass = MASKED;
      }
    }
    return copy;
  }

  global.Snmpv3UI = {
    MASKED: MASKED,
    MIN_PASSPHRASE_LEN: MIN_PASSPHRASE_LEN,
    VERSIONS: VERSIONS,
    SECURITY_LEVELS: SECURITY_LEVELS,
    AUTH_PROTOCOLS: AUTH_PROTOCOLS,
    PRIV_PROTOCOLS: PRIV_PROTOCOLS,
    renderSnmpFields: renderSnmpFields,
    collectSnmp: collectSnmp,
    snmpToFlat: snmpToFlat,
    buildDevicePayload: buildDevicePayload,
    createDevice: createDevice,
    updateDeviceSnmp: updateDeviceSnmp,
    getDevice: getDevice,
    pollDevice: pollDevice,
    renderPollStatus: renderPollStatus,
    sanitizeForDisplay: sanitizeForDisplay,
    isMasked: isMasked
  };
})(typeof window !== 'undefined' ? window : globalThis);
