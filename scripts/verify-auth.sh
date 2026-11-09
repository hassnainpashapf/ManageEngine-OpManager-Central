#!/usr/bin/env bash
# verify-auth.sh — Authentication harness for the rebuilt OpManager Central server.
#
# What "real" means here (from the audit of the old fake server):
#   * GET /api/auth/session with NO cookie must NOT report authenticated=true
#     (old server always returned authenticated=true, admin/SuperAdmin).
#   * POST /api/auth/login with a wrong password, an unknown user, or an empty
#     password must fail with HTTP 401 (or 400/403) and must NOT set a session
#     cookie. The old server accepted ANY non-empty username/password and
#     returned a predictable token "OPM_CENTRAL_SESSION_<timestamp>".
#   * POST /api/auth/login with the real admin credentials must succeed AND
#     set a real server-side session cookie (any cookie name EXCEPT the old
#     hardcoded fake CSRF cookie "opmcsrfcookie"). The cookie must then work
#     for authenticated requests.
#   * POST /api/auth/logout must invalidate the session: a later session check
#     with the same cookie must NOT report authenticated=true.
#   * Error responses must NOT advertise default credentials (old server said
#     "Default credentials are admin / admin.").
#
# Credentials: NEVER hardcoded. The real admin password comes from:
#   1. $OPM_ADMIN_PASSWORD (preferred), or
#   2. $OPM_ADMIN_PASSWORD_FILE (file whose first line is the password), or
#   3. a setup file the build writes, checked in this order under $OPM_REPO
#      (default ~/workspace/opmanager-central-check):
#        server/data/.admin.json  ({"username": "...", "password": "..."})
#        .opm-admin.json          (same shape)
#        server/.setup-credentials.json (same shape)
#   If none is found the script FAILS with instructions instead of guessing.
#   $OPM_ADMIN_USER defaults to "admin".
#
# Usage:
#   OPM_ADMIN_PASSWORD='...' ./verify-auth.sh
#   OPM_BASE_URL=http://localhost:8060 OPM_ADMIN_PASSWORD='...' ./verify-auth.sh
#
# Exit code: 0 only if EVERY check passes; 1 otherwise.
# Requires: curl, python3 (for JSON parsing). No repo files are touched.
set -u
BASE_URL="${OPM_BASE_URL:-http://localhost:8060}"
BASE_URL="${BASE_URL%/}"
REPO="${OPM_REPO:-$HOME/workspace/opmanager-central-check}"
ADMIN_USER="${OPM_ADMIN_USER:-admin}"

PASS=0; FAIL=0
TMPDIR_WORK="$(mktemp -d)"
trap 'rm -rf "$TMPDIR_WORK"' EXIT

# ---------- credential resolution (env/file only, never hardcoded) ----------
resolve_password() {
  if [ -n "${OPM_ADMIN_PASSWORD:-}" ]; then printf '%s' "$OPM_ADMIN_PASSWORD"; return 0; fi
  if [ -n "${OPM_ADMIN_PASSWORD_FILE:-}" ] && [ -f "$OPM_ADMIN_PASSWORD_FILE" ]; then
    head -n 1 "$OPM_ADMIN_PASSWORD_FILE" | tr -d '\r\n'; return 0
  fi
  for f in "$REPO/server/data/.admin.json" "$REPO/.opm-admin.json" "$REPO/server/.setup-credentials.json"; do
    if [ -f "$f" ]; then
      python3 -c 'import sys,json; print(json.load(open(sys.argv[1])).get("password",""))' "$f" 2>/dev/null | grep -q . \
        && { python3 -c 'import sys,json; print(json.load(open(sys.argv[1])).get("password",""))' "$f"; return 0; }
    fi
  done
  return 1
}
if ! ADMIN_PASS="$(resolve_password)"; then
  echo "FAIL: no admin password available."
  echo "  Set OPM_ADMIN_PASSWORD, OPM_ADMIN_PASSWORD_FILE, or have the build write"
  echo "  server/data/.admin.json ({\"username\":..., \"password\":...}) under \$OPM_REPO ($REPO)."
  exit 1
fi

# ---------- helpers ----------
# jv <file> <python-expr-on-d> : print value (true/false/null/JSON/scalar), "" on error
jv() { python3 -c '
import sys, json
try: d = json.load(open(sys.argv[1]))
except Exception: print(""); sys.exit(0)
try: v = eval(sys.argv[2], {}, {"d": d})
except Exception: print(""); sys.exit(0)
if isinstance(v, bool): print("true" if v else "false")
elif v is None: print("null")
elif isinstance(v, (list, dict)): print(json.dumps(v))
else: print(v)
' "$1" "$2" 2>/dev/null; }
check() { # check <name> <ok: 1|0> [detail]
  if [ "$2" = "1" ]; then PASS=$((PASS+1)); echo "PASS: $1";
  else FAIL=$((FAIL+1)); echo "FAIL: $1${3:+  -- $3}"; fi
}
# cookie names in a curl Netscape jar, one per line.
# curl writes HttpOnly cookies as "#HttpOnly_<domain> ..." lines; strip that
# prefix so the cookie is seen, but keep excluding real "#" comment lines
# (e.g. "# Netscape HTTP Cookie File"), which carry no cookie fields.
jar_names() { sed 's/^#HttpOnly_//' "$1" 2>/dev/null | awk '$1 !~ /^#/ && NF >= 6 {print $6}' | sort -u; }
# true if jar holds any cookie other than the old fake CSRF cookie
has_real_session_cookie() { jar_names "$1" | grep -v '^opmcsrfcookie$' | grep -q .; }

echo "== verify-auth against $BASE_URL (user: $ADMIN_USER) =="

# 1. Unauthenticated session must NOT be authenticated
HTTP=$(curl -s -o "$TMPDIR_WORK/sess_noauth.json" -w '%{http_code}' -m 10 "$BASE_URL/api/auth/session")
AUTHED="$(jv "$TMPDIR_WORK/sess_noauth.json" "d.get('authenticated')")"
if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ] || [ "$AUTHED" != "true" ]; then
  check "1. unauthenticated GET /api/auth/session is not authenticated (HTTP $HTTP, authenticated=$AUTHED)" 1
else
  check "1. unauthenticated GET /api/auth/session is not authenticated (HTTP $HTTP, authenticated=$AUTHED)" 0 "server reports authenticated=true with no cookie"
fi

# 2. Unauthenticated device list must be rejected
HTTP=$(curl -s -o "$TMPDIR_WORK/dev_noauth.json" -w '%{http_code}' -m 10 "$BASE_URL/api/devices")
if [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
  check "2. unauthenticated GET /api/devices rejected (HTTP $HTTP)" 1
else
  check "2. unauthenticated GET /api/devices rejected (HTTP $HTTP)" 0 "protected data served without login"
fi

# 3. Wrong password must fail, set no session cookie, leak no default creds
: > "$TMPDIR_WORK/jar_wrong.txt"
HTTP=$(curl -s -o "$TMPDIR_WORK/login_wrong.json" -w '%{http_code}' -m 10 -c "$TMPDIR_WORK/jar_wrong.txt" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"definitely-wrong-password-9f3a7c\"}" \
  "$BASE_URL/api/auth/login")
BODY="$(cat "$TMPDIR_WORK/login_wrong.json" 2>/dev/null)"
if { [ "$HTTP" = "401" ] || [ "$HTTP" = "400" ] || [ "$HTTP" = "403" ]; } && ! has_real_session_cookie "$TMPDIR_WORK/jar_wrong.txt"; then
  check "3. login with wrong password fails (HTTP $HTTP, no session cookie)" 1
else
  check "3. login with wrong password fails (HTTP $HTTP, no session cookie)" 0 "body: $(printf '%s' "$BODY" | head -c 200)"
fi
if printf '%s' "$BODY" | grep -qi 'default credentials\|admin / admin'; then
  check "3b. wrong-password error does not advertise default credentials" 0 "error leaks defaults: $(printf '%s' "$BODY" | head -c 160)"
else
  check "3b. wrong-password error does not advertise default credentials" 1
fi

# 4. Unknown user must fail
HTTP=$(curl -s -o "$TMPDIR_WORK/login_nouser.json" -w '%{http_code}' -m 10 \
  -H 'Content-Type: application/json' \
  -d '{"username":"no-such-user-xyz","password":"whatever-password-1"}' \
  "$BASE_URL/api/auth/login")
if [ "$HTTP" = "401" ] || [ "$HTTP" = "400" ] || [ "$HTTP" = "403" ]; then
  check "4. login with unknown user fails (HTTP $HTTP)" 1
else
  check "4. login with unknown user fails (HTTP $HTTP)" 0 "body: $(head -c 200 "$TMPDIR_WORK/login_nouser.json")"
fi

# 5. Empty password must fail
HTTP=$(curl -s -o "$TMPDIR_WORK/login_empty.json" -w '%{http_code}' -m 10 \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"\"}" \
  "$BASE_URL/api/auth/login")
if [ "$HTTP" = "401" ] || [ "$HTTP" = "400" ] || [ "$HTTP" = "403" ]; then
  check "5. login with empty password fails (HTTP $HTTP)" 1
else
  check "5. login with empty password fails (HTTP $HTTP)" 0 "body: $(head -c 200 "$TMPDIR_WORK/login_empty.json")"
fi

# 6. Real admin login must succeed AND set a real session cookie
: > "$TMPDIR_WORK/jar.txt"
HTTP=$(curl -s -o "$TMPDIR_WORK/login_ok.json" -w '%{http_code}' -m 10 -c "$TMPDIR_WORK/jar.txt" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  "$BASE_URL/api/auth/login")
LOGIN_STATUS="$(jv "$TMPDIR_WORK/login_ok.json" "d.get('status')")"
TOKEN="$(jv "$TMPDIR_WORK/login_ok.json" "d.get('token','')")"
COOKIE_NAMES="$(jar_names "$TMPDIR_WORK/jar.txt" | tr '\n' ',' | sed 's/,$//')"
if { [ "$HTTP" = "200" ] && [ "$LOGIN_STATUS" = "success" ]; } && has_real_session_cookie "$TMPDIR_WORK/jar.txt"; then
  check "6. real admin login succeeds and sets a session cookie (HTTP $HTTP, cookies: $COOKIE_NAMES)" 1
else
  check "6. real admin login succeeds and sets a session cookie (HTTP $HTTP, cookies: ${COOKIE_NAMES:-none})" 0 "status=$LOGIN_STATUS token=${TOKEN:0:40}"
fi
# 6b. the session token must not be the old predictable pattern
if printf '%s' "$TOKEN" | grep -q '^OPM_CENTRAL_SESSION_[0-9]*$'; then
  check "6b. login token is not the old predictable OPM_CENTRAL_SESSION_<timestamp> pattern" 0 "token=$TOKEN"
else
  check "6b. login token is not the old predictable OPM_CENTRAL_SESSION_<timestamp> pattern" 1
fi

# 7. Authed session check with the cookie must work
HTTP=$(curl -s -o "$TMPDIR_WORK/sess_auth.json" -w '%{http_code}' -m 10 -b "$TMPDIR_WORK/jar.txt" "$BASE_URL/api/auth/session")
AUTHED="$(jv "$TMPDIR_WORK/sess_auth.json" "d.get('authenticated')")"
SESS_USER="$(jv "$TMPDIR_WORK/sess_auth.json" "d.get('user',{}).get('username','')")"
if [ "$HTTP" = "200" ] && [ "$AUTHED" = "true" ]; then
  check "7. authed GET /api/auth/session works (HTTP $HTTP, user=$SESS_USER)" 1
else
  check "7. authed GET /api/auth/session works (HTTP $HTTP, authenticated=$AUTHED)" 0 "$(head -c 200 "$TMPDIR_WORK/sess_auth.json")"
fi

# 8. Authed data request with the cookie must work
HTTP=$(curl -s -o "$TMPDIR_WORK/dev_auth.json" -w '%{http_code}' -m 10 -b "$TMPDIR_WORK/jar.txt" "$BASE_URL/api/devices")
if [ "$HTTP" = "200" ]; then
  check "8. authed GET /api/devices works (HTTP $HTTP)" 1
else
  check "8. authed GET /api/devices works (HTTP $HTTP)" 0 "$(head -c 200 "$TMPDIR_WORK/dev_auth.json")"
fi

# 9. Logout must invalidate the session
HTTP_LOGOUT=$(curl -s -o "$TMPDIR_WORK/logout.json" -w '%{http_code}' -m 10 -b "$TMPDIR_WORK/jar.txt" -c "$TMPDIR_WORK/jar.txt" -X POST "$BASE_URL/api/auth/logout")
HTTP=$(curl -s -o "$TMPDIR_WORK/sess_after_logout.json" -w '%{http_code}' -m 10 -b "$TMPDIR_WORK/jar.txt" "$BASE_URL/api/auth/session")
AUTHED="$(jv "$TMPDIR_WORK/sess_after_logout.json" "d.get('authenticated')")"
if [ "$AUTHED" != "true" ] || [ "$HTTP" = "401" ] || [ "$HTTP" = "403" ]; then
  check "9. logout invalidates the session (logout HTTP $HTTP_LOGOUT, session after logout: HTTP $HTTP, authenticated=$AUTHED)" 1
else
  check "9. logout invalidates the session (logout HTTP $HTTP_LOGOUT, session after logout: HTTP $HTTP, authenticated=$AUTHED)" 0 "old cookie still reports authenticated=true"
fi

echo "== verify-auth: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
