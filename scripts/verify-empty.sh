#!/usr/bin/env bash
# verify-empty.sh — Fresh-store emptiness harness for the rebuilt OpManager Central.
#
# With a FRESH, EMPTY store (no discovery run yet, nothing collected) every
# data endpoint must return empty arrays / zero counts — never seeded values.
# The old server failed this in the seeded-artifact checks even though its
# device/alarm lists happened to be empty: it shipped a seeded probe
# (Central-Probe-01, fake IP 192.168.30.65, "Synchronized"), a seeded SNMP
# credential (community "public"), 4 fictional users (admin, noc_lead,
# sec_audit, probe_sync), a central record claiming PostgreSQL 14.5 with a
# fake apiKey, a DB page claiming 2,841,920 records and a backup file, a
# license page claiming 16 devices / 4 probes used, and 3 CCM configs
# claiming "Synced to 1/1 Probes".
#
# Checks (all authenticated — the script logs in first, same credential
# resolution as verify-auth.sh; see that file's header):
#   devices / alarms / alarm summary / reports / discovery / dashboard:
#     must be empty / zero.
#   probes / credentials / CCM configs: must be empty (no seeded rows).
#   users: must contain no fictional users — only the real setup admin.
#   central: 0 probes, 0 devices, no fake apiKey, DB must not claim PostgreSQL.
#   db: engine must not claim PostgreSQL; totalRecords is real internal rows,
#     so it is bounded (< 1000), not literally 0 — see check 10.
#   license: devicesUsed 0, probesUsed 0.
#
# Deliberately NOT checked: /api/settings/templates (14 device templates).
# Those are a static vendor/catalog definition, not collected site data.
#
# Usage:
#   OPM_ADMIN_PASSWORD='...' ./verify-empty.sh
#   OPM_BASE_URL=http://localhost:8060 OPM_ADMIN_PASSWORD='...' ./verify-empty.sh
#
# Exit code: 0 only if EVERY check passes; 1 otherwise.
# Requires: curl, python3. No repo files are touched.
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
  echo "FAIL: no admin password available. Set OPM_ADMIN_PASSWORD (see verify-auth.sh header)."
  exit 1
fi

# ---------- helpers ----------
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
# get <path> <outfile> : authenticated GET, prints HTTP code
get() { curl -s -o "$2" -w '%{http_code}' -m 10 -b "$TMPDIR_WORK/jar.txt" "$BASE_URL$1"; }

echo "== verify-empty against $BASE_URL =="

# 0. Log in first (a fresh store still requires auth; login failure = harness FAIL)
: > "$TMPDIR_WORK/jar.txt"
HTTP=$(curl -s -o "$TMPDIR_WORK/login.json" -w '%{http_code}' -m 10 -c "$TMPDIR_WORK/jar.txt" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  "$BASE_URL/api/auth/login")
LOGIN_STATUS="$(jv "$TMPDIR_WORK/login.json" "d.get('status')")"
if [ "$HTTP" = "200" ] && [ "$LOGIN_STATUS" = "success" ]; then
  check "0. login as $ADMIN_USER succeeds (needed to read the store)" 1
else
  check "0. login as $ADMIN_USER succeeds (needed to read the store)" 0 "HTTP $HTTP status=$LOGIN_STATUS"
  echo "== verify-empty: $PASS passed, $FAIL failed (cannot continue without login) =="
  exit 1
fi

# 1. Devices: empty
HTTP=$(get "/api/devices" "$TMPDIR_WORK/devices.json")
TOTAL="$(jv "$TMPDIR_WORK/devices.json" "d.get('total')")"
N="$(jv "$TMPDIR_WORK/devices.json" "len(d.get('devices') or [])")"
[ "$HTTP" = "200" ] && [ "$TOTAL" = "0" ] && [ "$N" = "0" ] \
  && check "1. GET /api/devices: empty (total=0, devices=[])" 1 \
  || check "1. GET /api/devices: empty (total=0, devices=[])" 0 "HTTP $HTTP total=$TOTAL n=$N"

# 2. Alarms: empty
HTTP=$(get "/api/alarms" "$TMPDIR_WORK/alarms.json")
RECORDS="$(jv "$TMPDIR_WORK/alarms.json" "d.get('records')")"
N="$(jv "$TMPDIR_WORK/alarms.json" "len(d.get('rows') or d.get('alarms') or [])")"
[ "$HTTP" = "200" ] && [ "$RECORDS" = "0" ] && [ "$N" = "0" ] \
  && check "2. GET /api/alarms: empty (records=0, rows=[])" 1 \
  || check "2. GET /api/alarms: empty (records=0, rows=[])" 0 "HTTP $HTTP records=$RECORDS n=$N"

# 3. Alarm summary: all zero
HTTP=$(get "/api/alarms/summary" "$TMPDIR_WORK/alarm_summary.json")
TOT="$(jv "$TMPDIR_WORK/alarm_summary.json" "d.get('summary',{}).get('total')")"
CRIT="$(jv "$TMPDIR_WORK/alarm_summary.json" "d.get('summary',{}).get('critical')")"
[ "$HTTP" = "200" ] && [ "$TOT" = "0" ] && [ "$CRIT" = "0" ] \
  && check "3. GET /api/alarms/summary: total=0, critical=0" 1 \
  || check "3. GET /api/alarms/summary: total=0, critical=0" 0 "HTTP $HTTP total=$TOT critical=$CRIT"

# 4. Reports summary: zero devices/alarms, empty top lists
HTTP=$(get "/api/reports/summary" "$TMPDIR_WORK/reports.json")
TD="$(jv "$TMPDIR_WORK/reports.json" "d.get('metrics',{}).get('totalDevices')")"
TA="$(jv "$TMPDIR_WORK/reports.json" "d.get('metrics',{}).get('totalAlarms')")"
TC="$(jv "$TMPDIR_WORK/reports.json" "len(d.get('metrics',{}).get('topCpu') or [])")"
[ "$HTTP" = "200" ] && [ "$TD" = "0" ] && [ "$TA" = "0" ] && [ "$TC" = "0" ] \
  && check "4. GET /api/reports/summary: totalDevices=0, totalAlarms=0, topCpu=[]" 1 \
  || check "4. GET /api/reports/summary: totalDevices=0, totalAlarms=0, topCpu=[]" 0 "HTTP $HTTP devices=$TD alarms=$TA topCpu_n=$TC"

# 5. Reports availability: zero devices
HTTP=$(get "/api/reports/availability" "$TMPDIR_WORK/avail.json")
TD="$(jv "$TMPDIR_WORK/avail.json" "d.get('metrics',{}).get('totalDevices')")"
[ "$HTTP" = "200" ] && [ "$TD" = "0" ] \
  && check "5. GET /api/reports/availability: totalDevices=0" 1 \
  || check "5. GET /api/reports/availability: totalDevices=0" 0 "HTTP $HTTP devices=$TD"

# 6. Probes: none seeded
HTTP=$(get "/api/probes" "$TMPDIR_WORK/probes.json")
TP="$(jv "$TMPDIR_WORK/probes.json" "d.get('totalProbes')")"
N="$(jv "$TMPDIR_WORK/probes.json" "len(d.get('result') or d.get('probes') or [])")"
[ "$HTTP" = "200" ] && { [ "$TP" = "0" ] || [ "$TP" = "" ]; } && [ "$N" = "0" ] \
  && check "6. GET /api/probes: no seeded probe (totalProbes=0, result=[])" 1 \
  || check "6. GET /api/probes: no seeded probe (totalProbes=0, result=[])" 0 "HTTP $HTTP totalProbes=$TP n=$N body: $(head -c 220 "$TMPDIR_WORK/probes.json")"

# 7. Credentials: none seeded (old server shipped community "public")
HTTP=$(get "/api/settings/credentials" "$TMPDIR_WORK/creds.json")
N="$(jv "$TMPDIR_WORK/creds.json" "len(d.get('credentials') or [])")"
[ "$HTTP" = "200" ] && [ "$N" = "0" ] \
  && check "7. GET /api/settings/credentials: empty (no seeded community)" 1 \
  || check "7. GET /api/settings/credentials: empty (no seeded community)" 0 "HTTP $HTTP n=$N body: $(head -c 220 "$TMPDIR_WORK/creds.json")"

# 8. Users: no fictional users, only the real setup admin
HTTP=$(get "/api/settings/users" "$TMPDIR_WORK/users.json")
USERS="$(jv "$TMPDIR_WORK/users.json" "sorted([u.get('username','') for u in (d.get('users') or [])])")"
if [ "$HTTP" = "200" ] && ! printf '%s' "$USERS" | grep -Eq 'noc_lead|sec_audit|probe_sync'; then
  check "8. GET /api/settings/users: no fictional users (users=$USERS)" 1
else
  check "8. GET /api/settings/users: no fictional users (users=$USERS)" 0 "HTTP $HTTP"
fi

# 9. Central: 0/0, no fake apiKey, DB is not PostgreSQL
HTTP=$(get "/api/settings/central" "$TMPDIR_WORK/central.json")
MP="$(jv "$TMPDIR_WORK/central.json" "d.get('central',{}).get('managedProbesCount')")"
TD="$(jv "$TMPDIR_WORK/central.json" "d.get('central',{}).get('totalDevicesCount')")"
DBT="$(jv "$TMPDIR_WORK/central.json" "d.get('central',{}).get('dbType','')")"
KEY="$(jv "$TMPDIR_WORK/central.json" "d.get('central',{}).get('apiKey','')")"
if [ "$HTTP" = "200" ] && [ "$MP" = "0" ] && [ "$TD" = "0" ] \
   && ! printf '%s' "$DBT" | grep -qi 'postgres' \
   && ! printf '%s' "$KEY" | grep -q 'ee-central-auth'; then
  check "9. GET /api/settings/central: 0 probes/0 devices, no fake apiKey, dbType='$DBT'" 1
else
  check "9. GET /api/settings/central: 0 probes/0 devices, no fake apiKey, dbType='$DBT'" 0 "HTTP $HTTP probes=$MP devices=$TD apiKey=${KEY:0:30}"
fi

# 10. DB info: SQLite engine, no PostgreSQL claim, real row count bounded.
# totalRecords counts REAL internal rows (users, sessions, audit_log,
# settings, api_keys ...), so a literal 0 is wrong for a real store — the
# old fake claimed 2,841,920. A real empty-ish store stays well under 1000.
HTTP=$(get "/api/settings/db" "$TMPDIR_WORK/db.json")
ENG="$(jv "$TMPDIR_WORK/db.json" "d.get('db',{}).get('engine','')")"
REC="$(jv "$TMPDIR_WORK/db.json" "d.get('db',{}).get('totalRecords')")"
if [ "$HTTP" = "200" ] && printf '%s' "$ENG" | grep -qi 'sqlite' && ! printf '%s' "$ENG" | grep -qi 'postgres' \
   && [ -n "$REC" ] && [ "$REC" -lt 1000 ] 2>/dev/null; then
  check "10. GET /api/settings/db: SQLite engine, no PostgreSQL claim, totalRecords=$REC (< 1000)" 1
else
  check "10. GET /api/settings/db: SQLite engine, no PostgreSQL claim, totalRecords < 1000 (engine='$ENG')" 0 "HTTP $HTTP totalRecords=$REC"
fi

# 11. License: 0 devices / 0 probes used
HTTP=$(get "/api/settings/license" "$TMPDIR_WORK/license.json")
DU="$(jv "$TMPDIR_WORK/license.json" "d.get('license',{}).get('devicesUsed')")"
PU="$(jv "$TMPDIR_WORK/license.json" "d.get('license',{}).get('probesUsed')")"
[ "$HTTP" = "200" ] && [ "$DU" = "0" ] && [ "$PU" = "0" ] \
  && check "11. GET /api/settings/license: devicesUsed=0, probesUsed=0" 1 \
  || check "11. GET /api/settings/license: devicesUsed=0, probesUsed=0" 0 "HTTP $HTTP devicesUsed=$DU probesUsed=$PU"

# 12. CCM configs: none seeded
HTTP=$(get "/api/ccm/configs" "$TMPDIR_WORK/ccm.json")
N="$(jv "$TMPDIR_WORK/ccm.json" "len(d.get('configs') or [])")"
[ "$HTTP" = "200" ] && [ "$N" = "0" ] \
  && check "12. GET /api/ccm/configs: empty (no 'Synced to 1/1 Probes' seed)" 1 \
  || check "12. GET /api/ccm/configs: empty (no 'Synced to 1/1 Probes' seed)" 0 "HTTP $HTTP n=$N body: $(head -c 220 "$TMPDIR_WORK/ccm.json")"

# 13. Discovery profiles/history: empty
HTTP=$(get "/api/discovery/profiles" "$TMPDIR_WORK/disc_prof.json")
N1="$(jv "$TMPDIR_WORK/disc_prof.json" "len(d.get('profiles') or [])")"
HTTP2=$(get "/api/discovery/history" "$TMPDIR_WORK/disc_hist.json")
N2="$(jv "$TMPDIR_WORK/disc_hist.json" "len(d.get('history') or [])")"
[ "$HTTP" = "200" ] && [ "$N1" = "0" ] && [ "$HTTP2" = "200" ] && [ "$N2" = "0" ] \
  && check "13. GET /api/discovery/profiles+history: empty" 1 \
  || check "13. GET /api/discovery/profiles+history: empty" 0 "profiles_n=$N1 history_n=$N2"

# 14. Dashboard summary: empty result
HTTP=$(get "/api/dashboard/summary" "$TMPDIR_WORK/dash.json")
N="$(jv "$TMPDIR_WORK/dash.json" "len(d.get('result') or [])")"
[ "$HTTP" = "200" ] && [ "$N" = "0" ] \
  && check "14. GET /api/dashboard/summary: result=[]" 1 \
  || check "14. GET /api/dashboard/summary: result=[]" 0 "HTTP $HTTP n=$N body: $(head -c 200 "$TMPDIR_WORK/dash.json")"

# 15. User notifications: empty
HTTP=$(get "/api/dashboard/getUserNotification" "$TMPDIR_WORK/notif.json")
N="$(jv "$TMPDIR_WORK/notif.json" "len(d.get('webAlarmNotification') or []) + len(d.get('systemAlerts') or [])")"
[ "$HTTP" = "200" ] && [ "$N" = "0" ] \
  && check "15. GET /api/dashboard/getUserNotification: empty" 1 \
  || check "15. GET /api/dashboard/getUserNotification: empty" 0 "HTTP $HTTP n=$N"

echo "== verify-empty: $PASS passed, $FAIL failed =="
[ "$FAIL" -eq 0 ]
