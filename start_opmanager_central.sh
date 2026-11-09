#!/bin/bash
# ==============================================================================
# ManageEngine OpManager Central (Version 12.9.204-GA)
# One-Click Unified Launcher (Server + Live Monitoring Agent + Desktop GUI Window)
# ==============================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=========================================================="
echo " Starting ManageEngine OpManager Central Enterprise Suite "
echo " Version 12.9.204-GA                      "
echo "=========================================================="

# 1. Kill any existing instances on port 8060 or agent
lsof -ti:8060 | xargs kill -9 2>/dev/null
pkill -f "OpManagerAgent" 2>/dev/null

# 2. Start Central Backend Server
echo "-> Starting OpManager Central Server on port 8060..."
nohup node server/index.js > server.log 2>&1 &
SERVER_PID=$!
echo "   Server started (PID: $SERVER_PID)"

# Wait for server to come up
for i in {1..15}; do
  if curl -s http://localhost:8060/api/devices >/dev/null 2>&1; then
    echo "   Server is UP and HEALTHY (HTTP 200 OK)"
    break
  fi
  sleep 0.5
done

# 3. Start Native Host Monitoring Agent
echo "-> Starting OpManager Host Monitoring Agent (AGT-DARWIN-1-D52F)..."
# Agent binary: macOS build on Darwin (per-arch), Linux build elsewhere.
# Shared selection logic — see scripts/select_agent_bin.sh.
. "$DIR/scripts/select_agent_bin.sh"
AGENT_BIN="$(select_agent_bin)"
if [ -f "$AGENT_BIN" ]; then
  nohup "$AGENT_BIN" -server http://localhost:8060 -probe 1 -interval 5 > agent.log 2>&1 &
  AGENT_PID=$!
  echo "   Agent started (PID: $AGENT_PID) streaming live telemetry every 5s"
fi

# 4. Launch Desktop GUI Window (Clean standalone window without browser chrome)
echo "-> Launching OpManager Central GUI in Desktop App Window..."
APP_URL="http://localhost:8060/apiclient/fluidicv3/itom/index.html#/dashboard"

if [ "$(uname -s)" = "Darwin" ]; then
  if [ -d "/Applications/Google Chrome.app" ]; then
    open -n -a "/Applications/Google Chrome.app" --args --app="$APP_URL" --window-size=1920,1080
  elif [ -d "/Applications/Brave Browser.app" ]; then
    open -n -a "/Applications/Brave Browser.app" --args --app="$APP_URL" --window-size=1920,1080
  elif [ -d "/Applications/Microsoft Edge.app" ]; then
    open -n -a "/Applications/Microsoft Edge.app" --args --app="$APP_URL" --window-size=1920,1080
  else
    open "$APP_URL"
  fi
elif command -v google-chrome >/dev/null 2>&1; then
  google-chrome --app="$APP_URL" --window-size=1920,1080 >/dev/null 2>&1 &
elif command -v chromium-browser >/dev/null 2>&1; then
  chromium-browser --app="$APP_URL" --window-size=1920,1080 >/dev/null 2>&1 &
elif command -v chromium >/dev/null 2>&1; then
  chromium --app="$APP_URL" --window-size=1920,1080 >/dev/null 2>&1 &
else
  echo "   No Chrome/Chromium found — open this URL manually: $APP_URL"
fi

echo "=========================================================="
echo " OpManager Central is running at: $APP_URL"
echo " To stop everything, run: ./stop_opmanager_central.sh     "
echo "=========================================================="
