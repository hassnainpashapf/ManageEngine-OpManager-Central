const express = require('express');
const compression = require('compression');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const probesRoute = require('./routes/probes');
const devicesRoute = require('./routes/devices');
const alarmsRoute = require('./routes/alarms');
const discoveryRoute = require('./routes/discovery');
const ccmRoute = require('./routes/ccm');
const settingsRoute = require('./routes/settings');
const reportsRoute = require('./routes/reports');
const ncmclientRoute = require('./routes/ncmclient');
const toolsRoute = require('./routes/tools');
const ziaRoute = require('./routes/zia');
const agentsRoute = require('./routes/agents');
const authRoute = require('./routes/auth');
const samlRoute = require('./routes/saml');
const racksRoute = require('./routes/racks');
const workflowsRoute = require('./routes/workflows');
const trapsRoute = require('./routes/traps');
const hardwareRoute = require('./routes/hardware');
const diffRoute = require('./routes/diff');
const poller = require('./services/poller');
// NOTE: the old JSON store (server/services/db.js) was deleted by the store
// track and replaced by server/services/store.js (SQLite). index.js reads
// live data through the store API (listProbes/listDevices/listAlarms).
const store = require('./services/store');

// ---------------------------------------------------------------------------
// Auth wiring (real-data rebuild).
// server/services/session.js is owned by the auth track and exports
// requireAuth, requireRole and ensureFirstAdmin. It may not have landed yet
// while the tracks run in parallel, so load it defensively: if it is missing
// or does not export requireAuth, every protected route fails CLOSED (401 /
// login redirect) instead of failing open.
// ---------------------------------------------------------------------------
let session = null;
try {
  session = require('./services/session');
} catch (err) {
  console.error('[Auth] server/services/session.js could not be loaded (%s). Auth-guarded routes will fail closed until it lands.', err.message);
}
const requireAuth = (session && typeof session.requireAuth === 'function')
  ? session.requireAuth
  : (req, res, next) => res.status(401).json({ error: 'unauthorized', message: 'Authentication service unavailable' });
// Must-change-password guard (server/services/session.js): a session flagged
// must-change may only call the password-change route and the session/status
// route; every other API route 403s until the password is changed. If the
// session service is missing requirePasswordChanged, fail CLOSED (403) — a
// flag that cannot be verified must never be treated as cleared. (When the
// session service itself is missing, requireAuth above already 401s, so
// this fallback is only reached with a stale session.js.)
const requirePasswordChanged = (session && typeof session.requirePasswordChanged === 'function')
  ? session.requirePasswordChanged
  : (req, res, next) => res.status(403).json({ error: 'password change required', message: 'Authentication service unavailable' });

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const name = part.slice(0, idx).trim();
    if (!name) return;
    try { out[name] = decodeURIComponent(part.slice(idx + 1).trim()); }
    catch (e) { out[name] = part.slice(idx + 1).trim(); }
  });
  return out;
}

// Validate a request the same way requireAuth does, without mounting the
// middleware: run requireAuth against the request with a sink response and
// report whether it called next() (authenticated) or rejected (401).
// Used for WebSocket upgrades (no Express res exists) and for browser page
// routes, which must redirect to /login.html instead of answering 401.
function checkSession(req) {
  return new Promise((resolve) => {
    if (!session || typeof session.requireAuth !== 'function') return resolve(false);
    let settled = false;
    const done = (ok) => { if (!settled) { settled = true; resolve(ok); } };
    // Some requireAuth implementations read req.cookies; populate it from the
    // Cookie header when it is not already set (no cookie-parser in the app).
    if (!req.cookies) {
      try { req.cookies = parseCookies(req.headers && req.headers.cookie); }
      catch (e) { req.cookies = {}; }
    }
    const sink = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      setHeader() {}, set() {}, getHeader() {}, removeHeader() {},
      cookie() {}, clearCookie() {},
      json() { done(false); return this; },
      send() { done(false); return this; },
      sendStatus(code) { done(code >= 200 && code < 300); return this; },
      end() { done(false); return this; },
      redirect() { done(false); return this; },
    };
    const timer = setTimeout(() => done(false), 3000);
    if (typeof timer.unref === 'function') timer.unref();
    try {
      const out = session.requireAuth(req, sink, (err) => done(!err));
      if (out && typeof out.catch === 'function') out.catch(() => done(false));
    } catch (e) { done(false); }
  });
}

// Page guard: serve the console only to authenticated sessions; everyone
// else goes to the login page.
async function requireConsoleSession(req, res, next) {
  let ok = false;
  try { ok = await checkSession(req); } catch (e) { ok = false; }
  if (ok) return next();
  return res.redirect('/login.html');
}

// Build the request shape checkSession needs from a WebSocket upgrade
// request. The session token comes from the opm_session cookie, or from a
// ?token= query param (folded into the cookie header); validation itself is
// still done by requireAuth, exactly as for HTTP requests.
function wsSessionReq(request) {
  const headers = Object.assign({}, request.headers);
  try {
    const u = new URL(request.url, 'http://localhost');
    const token = u.searchParams.get('token');
    if (token && !/opm_session=/.test(headers.cookie || '')) {
      headers.cookie = headers.cookie
        ? `${headers.cookie}; opm_session=${token}`
        : `opm_session=${token}`;
    }
  } catch (e) { /* keep headers as-is */ }
  return { method: 'GET', url: request.url, headers, cookies: parseCookies(headers.cookie || '') };
}

// --- API auth guard ---------------------------------------------------------
// Public API endpoints (no session required).
const PUBLIC_API_ROUTES = new Set([
  'POST /api/auth/login',
  'POST /api/auth/setup',
  'GET /api/auth/session', // reports its own status; must stay public
  // SAML 2.0 SP entry points: the IdP and the browser arriving from it
  // carry no OpManager session by definition. ACS validates the signed
  // Response itself before minting a session; metadata is public by design.
  'GET /api/auth/saml/metadata',
  'GET /api/auth/saml/login',
  'POST /api/auth/saml/acs',
]);

// Agent telemetry ingestion. These do NOT take the user session: agents.js
// authenticates them with its own per-agent auth-key check (SHA-256 of the
// presented eeauthkey/authKey against the store's api_keys table or a probe
// key hash; unknown agent or bad/missing key => 401). They are the ONLY
// /api/* paths exempt from requireAuth besides the public auth endpoints.
//  - POST /api/agent/register is kept exempt because the task names it, but
//    agents.js now answers it 410 (self-registration closed; an admin
//    enrolls agents via POST /api/agents/register, which takes requireAuth).
//  - POST /api/agent/deregister is key-authenticated the same way as
//    telemetry, so it is exempt on the same basis.
//  - GET /api/agent/list is exempt because the Go agent's -test flow GETs
//    it with only its eeauthkey. agents.js enforces the key check itself
//    (valid agent one-time key or probe key hash, else a valid admin
//    session for console callers) — the route is never open. Missing or
//    wrong key and no session => 401. GET /api/agents stays session-only
//    (not exempt) as the console alias.
// Probe sync endpoints (/api/probes/:id/sync, /api/probes/sync-all,
// /api/json/enterprise/sync*) are NOT exempt: they perform no key check and
// are console operations, so they stay behind requireAuth.
const KEY_AUTH_API_ROUTES = new Set([
  'POST /api/agent/register',
  'POST /api/agent/telemetry',
  'POST /api/agent/deregister',
  'GET /api/agent/list',
]);

// Password-change route: the ONLY session-authenticated API route a
// must-change-password session may call (besides GET /api/auth/session,
// already public-exempt above). It must stay reachable or a flagged
// session could never clear its own flag.
const PASSWORD_CHANGE_ROUTES = new Set([
  'POST /api/auth/change-password',
]);

// Legacy ManageEngine paths served by the same routers without an /api
// prefix. They are API endpoints too — leaving them open would defeat the
// /api/* guard, since e.g. /admin/listProbes and /api/admin/listProbes are
// the same handler. (Page routes /dashboard, /itom, / are NOT in this list;
// only /dashboard/* JSON endpoints are.)
const LEGACY_API_PREFIXES = [
  '/admin/', '/alarm/', '/device/', '/enterprise/', '/fwaenterprise/',
  '/maps/', '/ncmclient/', '/ncmcompliance/', '/ncmconfig/',
  '/ncmdashboard/', '/ncmeol/', '/ncmreports/', '/nfaee/', '/reports/',
  '/tab/', '/user/', '/v2/', '/dashboard/',
];

function apiPathname(req) {
  return ((req.originalUrl || req.url || '').split('?')[0]);
}

function isApiPath(pathname) {
  if (pathname === '/api' || pathname.startsWith('/api/')) return true;
  if (pathname === '/client/api' || pathname.startsWith('/client/api/')) return true;
  return LEGACY_API_PREFIXES.some((p) => pathname.startsWith(p));
}

function normalizeApiPath(pathname) {
  return pathname
    .replace(/^\/(client\/)?api\/json\//, '/api/')
    .replace(/^\/client\/api\//, '/api/');
}

function apiAuthGuard(req, res, next) {
  const pathname = apiPathname(req);
  if (!isApiPath(pathname)) return next();
  const key = `${req.method} ${pathname}`;
  const normalizedKey = `${req.method} ${normalizeApiPath(pathname)}`;
  if (PUBLIC_API_ROUTES.has(key) || PUBLIC_API_ROUTES.has(normalizedKey)) return next();
  if (KEY_AUTH_API_ROUTES.has(key) || KEY_AUTH_API_ROUTES.has(normalizedKey)) return next();
  // The password-change route still needs a valid session, but must not be
  // blocked by the must-change guard — it is the way out of the flag.
  if (PASSWORD_CHANGE_ROUTES.has(key) || PASSWORD_CHANGE_ROUTES.has(normalizedKey)) {
    return requireAuth(req, res, next);
  }
  // Every other API route: valid session AND no pending forced password
  // change. requireAuth sets req.user; requirePasswordChanged answers 403
  // while that user is flagged must-change-password.
  return requireAuth(req, res, (err) => {
    if (err) return next(err);
    return requirePasswordChanged(req, res, next);
  });
}

const app = express();
const server = http.createServer(app);

// WebSocket server supporting both authentic ManageEngine /PNSHandler and /ws
const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', async (request, socket, head) => {
  const pathname = request.url.split('?')[0];
  if (pathname !== '/PNSHandler' && pathname !== '/ws') {
    socket.destroy();
    return;
  }
  // WebSocket streams carry live inventory/telemetry: only authenticated
  // sessions may upgrade. The token comes from the opm_session cookie or a
  // ?token= query param, validated exactly like requireAuth validates it.
  let ok = false;
  try { ok = await checkSession(wsSessionReq(request)); } catch (e) { ok = false; }
  if (!ok) {
    try { socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); } catch (e) {}
    socket.destroy();
    return;
  }
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['text/*', 'application/xml', 'application/x-www-form-urlencoded'] }));

// NOTE: no cors() middleware — same-origin only. The app is served from the
// same origin as its API, so cross-origin access is not needed.
// NOTE: the hardcoded CSRF cookie is removed entirely, with no replacement
// cookie. (The two remaining set sites in server/routes/ncmclient.js belong
// to that route file's owner; see report.)

// Rewrite /client/api/json requests to root so that both /client/api/json/... and /api/json/... match routes
app.use((req, res, next) => {
  if (req.url.startsWith('/client/api/json/') || req.url.startsWith('/api/json/') || req.url.startsWith('/client/api/') || req.url.startsWith('/api/')) {
    req.isApiRequest = true;
  }
  if (req.url.startsWith('/client/api/json/')) {
    req.url = req.url.replace('/client/api/json', '');
  } else if (req.url.startsWith('/api/json/')) {
    req.url = req.url.replace('/api/json', '');
  } else if (req.url.startsWith('/client/api/')) {
    req.url = req.url.replace('/client/api', '');
  }
  next();
});

// Auth guard for every API route (all 17 route files mount below this).
// requireAuth applies to /api/* and the legacy non-/api API prefixes, except
// the public auth endpoints and the key-authenticated agent telemetry
// ingestion endpoints (see PUBLIC_API_ROUTES / KEY_AUTH_API_ROUTES above).
app.use(apiAuthGuard);

// Set MIME types and caching headers for static files
const staticOptions = {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jsp') || filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.includes('opmanager-suite.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else if (filePath.match(/\.(png|jpe?g|gif|svg|ico|woff2?|ttf|wav|mp3|msi|exe)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
};

// Helper to serve clean ITOM shell with dynamic cache busting on the suite bundle
function renderItomShell(res) {
  const itomPath = path.join(__dirname, '../client/itom.html');
  if (fs.existsSync(itomPath)) {
    let html = fs.readFileSync(itomPath, 'utf8');
    const buster = Date.now();
    html = html.replace(/opmanager-suite\.js(\?v=[^"']*)?/g, `opmanager-suite.js?v=${buster}`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.send(html);
  }
  return res.sendFile(itomPath);
}

// The bundled Ember shell is incomplete in this local clone and throws hundreds
// of errors before the working Central suite mounts. Serve the supported suite
// shell directly so every rendered screen starts cleanly.
app.get([
  '/apiclient/fluidicv3/itom/index.html',
  '/apiclient/fluidicv3/itom/',
  '/apiclient/fluidicv3/itom',
  '/itom.html',
  '/'
], requireConsoleSession, (req, res) => {
  renderItomShell(res);
});

// ---- Page / console routes (registered BEFORE the API mounts) --------
// ncmclient.js has a router-level guard that 401s any request without
// req.user; it is mounted at root, so it would intercept these non-API
// routes before their own guards could run. These routes carry their
// own guards (requireConsoleSession / requireAuth) or are public
// (/login), so they are registered here, ahead of the mounts.
// Route for authentic ManageEngine Fluidic client
app.get(['/apiclient/ember/index.jsp', '/apiclient/ember', '/apiclient/fluidicv3/index.jsp'], (req, res) => {
  res.redirect('/apiclient/fluidicv3/itom/index.html#/dashboard');
});

// Redirect classic module routes to fluidic hash routes
app.get(['/Inventory*', '/Home*', '/Settings*', '/NCM*', '/Maps*', '/Reports*'], (req, res) => {
  res.redirect('/apiclient/fluidicv3/itom/index.html#' + req.originalUrl);
});

// Dedicated route for authentic ManageEngine Fluidic v3 Log Viewer files
// (log lines expose probe/device names — authenticated sessions only).
// Reads the tail of a REAL .log file under server/logs or
// server/data/logs. No lines are synthesised: when the file does not exist
// (or no logs directory exists yet) this answers 404 with an honest
// message instead of inventing log content.
app.get('/logs/:file', requireAuth, requirePasswordChanged, (req, res) => {
  const base = path.basename(String(req.params.file || 'opmanager_server.log'));
  const logDirs = [
    path.join(__dirname, 'logs'),
    path.join(__dirname, 'data', 'logs'),
  ];
  let found = null;
  for (const dir of logDirs) {
    const candidate = path.join(dir, base);
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) { found = candidate; break; }
    } catch (e) { /* unreadable candidate — keep looking */ }
  }
  if (!found) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(404).send(`Log file not found: ${base} — no such log file exists under server/logs or server/data/logs.`);
  }
  let content;
  try {
    content = fs.readFileSync(found, 'utf8');
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(500).send(`Could not read log file: ${base}`);
  }
  const lines = content.split('\n');
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  const tail = lines.slice(-200);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(tail.join('\n'));
});

// Route for authentic ManageEngine Login screen
app.get(['/login', '/login.html'], (req, res) => {
  res.sendFile(path.join(clientPath, 'login.html'));
});

// Dedicated route for classic NOC view
app.get('/noc', requireConsoleSession, (req, res) => {
  res.sendFile(path.join(clientPath, 'noc.html'));
});

// Default root redirect to authentic ManageEngine Dashboard
app.get(['/', '/dashboard'], requireConsoleSession, (req, res) => {
  res.redirect('/apiclient/fluidicv3/itom/index.html#/dashboard');
});

// Dedicated direct route for Ember ITOM client
app.get('/itom', requireConsoleSession, (req, res) => {
  res.redirect('/apiclient/fluidicv3/itom/index.html#/dashboard');
});

// Serve product home static directory directly if present (all stylesheets, images, scripts, apiclient)
const productHomePath = path.join(__dirname, '../../opmanager-extracted/product_home');
if (fs.existsSync(productHomePath)) {
  app.use(express.static(productHomePath, staticOptions));
}

// Serve client directory (custom assets, downloads, fallback UI)
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath, staticOptions));
app.use('/agents', express.static(path.join(__dirname, '../client/downloads'), staticOptions));
app.use('/downloads', express.static(path.join(__dirname, '../client/downloads'), staticOptions));

// Mount API routes
app.use(authRoute);
app.use(samlRoute);
// agentsRoute mounts BEFORE ncmclientRoute: ncmclient.js has a router-level
// guard that 401s any request without req.user, and the agents' telemetry /
// deregister endpoints authenticate by per-agent key (not a user session),
// so they must reach agentsRoute before ncmclient's guard can reject them.
// No path overlap: agentsRoute only serves /api/agent* and /api/agents*.
app.use(agentsRoute);
app.use(ncmclientRoute);
app.use(toolsRoute);
app.use(ziaRoute);
app.use(probesRoute);
app.use(devicesRoute);
app.use(alarmsRoute);
app.use(discoveryRoute);
app.use(ccmRoute);
app.use(settingsRoute);
app.use(reportsRoute);
app.use(racksRoute);
app.use(workflowsRoute);
app.use(trapsRoute);
app.use(hardwareRoute);
app.use(diffRoute);

// Catch-all handler for unmapped API endpoints to prevent hanging or sending HTML
app.use((req, res, next) => {
  if (req.path.endsWith('.jsp') || req.path.endsWith('.html') || req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.svg') || req.path.endsWith('.png') || req.path.endsWith('.ico') || req.path.endsWith('.woff') || req.path.endsWith('.woff2')) {
    return next();
  }
  if (isApiPath(apiPathname(req))) {
    return res.status(404).json({ error: 'not_found' });
  }
  next();
});

// Serve any .jsp request with text/html content-type
app.use((req, res, next) => {
  if (req.path.endsWith('.jsp')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
  }
  next();
});

// WebSocket connection handling for both ManageEngine client and NOC stream
wss.on('connection', async (ws, req) => {
  // The upgrade handler already authenticated this socket; re-verify here
  // so a socket that somehow bypassed the upgrade check never receives
  // data. Unauthenticated sockets are closed with code 1008.
  let ok = false;
  try { ok = await checkSession(wsSessionReq(req)); } catch (e) { ok = false; }
  if (!ok) {
    try { ws.close(1008, 'Unauthorized'); } catch (e) {}
    return;
  }

  const isPNS = req.url.includes('PNSHandler');
  console.log(`[WebSocket] Client connected via ${isPNS ? '/PNSHandler (ManageEngine ITOM)' : '/ws (NOC Stream)'}`);

  // Send authentic ManageEngine session update
  if (isPNS) {
    ws.send(JSON.stringify({
      itomUpdateWS: { wsId: 'WS_OPM_CENTRAL_129203' }
    }));
  } else {
    // Send initial state for NOC subscribers (live store data; central is
    // the server identity, not a polled entity).
    let initialProbes = [];
    let initialDevices = [];
    let initialAlarmsCount = 0;
    try { initialProbes = store.listProbes() || []; } catch (e) { initialProbes = []; }
    try { initialDevices = store.listDevices() || []; } catch (e) { initialDevices = []; }
    try { initialAlarmsCount = (store.listAlarms() || []).length; } catch (e) { initialAlarmsCount = 0; }
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      central: { productName: 'ManageEngine OpManager Central', productVersion: '12.9.204-GA', buildNumber: null },
      probes: initialProbes,
      devices: initialDevices,
      alarmsCount: initialAlarmsCount,
      timestamp: Date.now()
    }));
  }

  // Handle client messages (heartbeat pings etc)
  ws.on('message', (msg) => {
    try {
      const str = msg.toString().trim();
      if (str === '-' || str.includes('-') || str.toLowerCase().includes('ping')) {
        // Authentic ManageEngine ITOM Ping-Pong Pong response
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ '-': '-' }));
        }
      }
    } catch (e) {}
  });

  ws.on('close', () => {
    // client disconnected
  });
});

// Proactive Server-Side Heartbeat: broadcast pong response every 3 seconds to all clients
// ensuring client-side failureCheckIntervalId never encounters a missing pong
setInterval(() => {
  const pongMsg = JSON.stringify({ '-': '-' });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(pongMsg);
      } catch (e) {}
    }
  });
}, 3000);

// Broadcast poller updates to all connected clients (all connected clients
// are authenticated — see the upgrade handler above).
if (typeof poller.onUpdate === 'function') {
  poller.onUpdate((payload) => {
    const message = JSON.stringify(payload);

    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
} else {
  console.error('[Poller] poller.onUpdate is not available — live metric broadcasts are disabled.');
}

// Fallback route
app.get('*', async (req, res) => {
  if (req.path.match(/\.(png|jpe?g|gif|svg|ico|css|js|woff2?|ttf|eot|map|wav|mp3|zip|tar\.gz|msi|exe)$/i)) {
    return res.status(404).send('Resource Not Found');
  }
  // Any other path is the console shell: serve it only to authenticated
  // sessions, otherwise redirect to the login page.
  let ok = false;
  try { ok = await checkSession(req); } catch (e) { ok = false; }
  if (!ok) return res.redirect('/login.html');
  renderItomShell(res);
});

const PORT = process.env.PORT || 8060;
server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(` ManageEngine OpManager Central (Version 12.9.204-GA)`);
  console.log(` Authentic Ember ITOM Root: http://localhost:${PORT}/`);
  console.log(` Direct ITOM Client: http://localhost:${PORT}/apiclient/fluidicv3/itom/index.html#/`);
  console.log(` Full NOC Overview: http://localhost:${PORT}/noc`);
  let probeCount = 0;
  try { probeCount = (store.listProbes() || []).length; } catch (e) { probeCount = 0; }
  console.log(` Central Probe Architecture: Active (${probeCount} Enterprise Probes)`);
  console.log(`================================================================`);

  // Startup: seed the first admin (if none exists) and start the poller.
  // Both are guarded so a failure is logged loudly but never fatal.
  try {
    if (session && typeof session.ensureFirstAdmin === 'function') {
      const r = session.ensureFirstAdmin();
      if (r && typeof r.catch === 'function') {
        r.catch((e) => console.error('[Auth] ensureFirstAdmin FAILED (startup continues; no admin was seeded):', e && e.message ? e.message : e));
      }
    } else {
      console.error('[Auth] ensureFirstAdmin NOT AVAILABLE (session service missing) — no first admin was seeded.');
    }
  } catch (e) {
    console.error('[Auth] ensureFirstAdmin FAILED (startup continues; no admin was seeded):', e && e.message ? e.message : e);
  }
  try {
    if (typeof poller.startPoller === 'function') {
      poller.startPoller();
    } else if (typeof poller.start === 'function') {
      // Back-compat with the pre-rebuild poller API.
      poller.start(4000);
    } else {
      console.error('[Poller] startPoller/start NOT AVAILABLE — poller was not started.');
    }
  } catch (e) {
    console.error('[Poller] startPoller FAILED (startup continues; polling is off):', e && e.message ? e.message : e);
  }
});

// Graceful shutdown: checkpoint the WAL into opmanager.db and close the
// database before exiting, so sessions (and all other state) survive a
// restart in the main .db file alone instead of depending on the -wal
// sidecar. Without this, a SIGTERM/SIGINT stop left every recent write —
// including the session row created at login — only in the -wal file.
// All store writes are synchronous (node:sqlite DatabaseSync), so no
// in-flight DB write can be half-done when this runs. The handler is
// idempotent and never blocks the exit: a checkpoint failure is logged
// and the process still exits.
let shuttingDown = false;
function gracefulShutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[Shutdown] ${signal} received — checkpointing database...`);
  try {
    if (store && typeof store.checkpointAndClose === 'function') {
      store.checkpointAndClose();
    }
  } catch (e) {
    console.error('[Shutdown] database checkpoint failed:', e && e.message ? e.message : e);
  }
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
