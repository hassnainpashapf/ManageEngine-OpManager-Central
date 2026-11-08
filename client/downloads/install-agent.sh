#!/usr/bin/env bash
set -e

# ManageEngine OpManager Central Linux Agent Installer
# Target Server: http://192.168.30.65:8060

SERVER_URL="${1:-http://192.168.30.65:8060}"
PROBE_ID="${2:-101}"
AUTH_KEY="${3:-OPM_EE_PROBE_SEC_KEY_1}"
INSTALL_DIR="/opt/opmanager-agent"

echo "============================================================"
echo " ManageEngine OpManager Central - Linux Agent Installer"
echo " Server URL: $SERVER_URL"
echo " Probe ID:   $PROBE_ID"
echo "============================================================"

# Check root permissions
if [ "$EUID" -ne 0 ]; then
  echo "Error: Please run as root (use sudo)."
  exit 1
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

echo "[1/4] Downloading OpManager Linux Agent binary..."
if command -v curl >/dev/null 2>&1; then
  curl -sSL "$SERVER_URL/downloads/OpManagerAgent-linux-amd64" -o "$INSTALL_DIR/OpManagerAgent"
elif command -v wget >/dev/null 2>&1; then
  wget -q "$SERVER_URL/downloads/OpManagerAgent-linux-amd64" -O "$INSTALL_DIR/OpManagerAgent"
else
  echo "Error: curl or wget is required."
  exit 1
fi

chmod +x "$INSTALL_DIR/OpManagerAgent"

echo "[2/4] Testing connectivity to OpManager Central..."
"$INSTALL_DIR/OpManagerAgent" -server "$SERVER_URL" -probe "$PROBE_ID" -key "$AUTH_KEY" -test || {
  echo "Warning: Direct test returned non-zero, continuing installation..."
}

echo "[3/4] Creating systemd service..."
cat <<EOF > /etc/systemd/system/opmanager-agent.service
[Unit]
Description=ManageEngine OpManager Central Host Agent
After=network.target

[Service]
Type=simple
ExecStart=$INSTALL_DIR/OpManagerAgent -server $SERVER_URL -probe $PROBE_ID -key $AUTH_KEY -interval 5
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

echo "[4/4] Starting and enabling OpManager Agent service..."
systemctl daemon-reload
systemctl enable opmanager-agent.service
systemctl restart opmanager-agent.service

echo "============================================================"
echo " ✓ OpManager Agent successfully installed and running!"
echo " Check status with: systemctl status opmanager-agent"
echo " View your device at: $SERVER_URL/apiclient/fluidicv3/itom/index.html#/inventory"
echo "============================================================"
