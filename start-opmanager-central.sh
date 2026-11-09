#!/usr/bin/env bash
# ==============================================================================
# ManageEngine OpManager Central Enterprise v12.9.204-GA (64-Bit)
# Unified Startup Script (Central Web/API Server + Go Host Monitoring Agent)
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

# Host monitoring agent binary: Linux build on Linux, macOS build on Darwin.
case "$(uname -s)" in
  Linux)  AGENT_BIN="./agent_src/OpManagerAgent-linux-amd64" ;;
  Darwin) AGENT_BIN="./agent_src/OpManagerAgent" ;;
  *)      AGENT_BIN="./agent_src/OpManagerAgent-linux-amd64" ;;
esac

echo "[1/3] Building unified OpManager Central v12.9.204-GA frontend suite..."
node scripts/rebuild_bundle.js

echo "[2/3] Checking Port 8060 status..."
if lsof -i :8060 >/dev/null 2>&1; then
  echo "  ✔ OpManager Central Server is already listening on http://localhost:8060"
else
  echo "  Starting OpManager Central Server on http://localhost:8060..."
  nohup node server/index.js > /tmp/opmanager-central-server.log 2>&1 &
  sleep 2
fi

echo "[3/3] Checking OpManager Go Host Monitoring Agent..."
if pgrep -f "OpManagerAgent" >/dev/null 2>&1; then
  echo "  ✔ OpManagerAgent daemon is already running and streaming live telemetry."
else
  echo "  Starting OpManagerAgent daemon..."
  nohup "$AGENT_BIN" -server http://localhost:8060 -probe 1 -interval 5 > /tmp/opmanager-agent.log 2>&1 &
  sleep 1
fi

echo "=============================================================================="
echo " ManageEngine OpManager Central v12.9.204-GA is LIVE!"
echo " • Main ITOM Console : http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard"
echo " • Login Portal      : http://localhost:8060/login.html"
echo " • NOC Wallboard     : http://localhost:8060/noc"
echo " • Executive PDF/HTML: http://localhost:8060/api/reports/print-preview"
echo "=============================================================================="
