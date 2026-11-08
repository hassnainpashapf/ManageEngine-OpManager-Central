#!/bin/bash
# ManageEngine OpManager Central Agent - macOS launchd Installer
set -e
echo "Installing ManageEngine OpManager Central Agent as system daemon..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
sudo mkdir -p /Library/Application\ Support/ManageEngine/OpManagerAgent/

sudo cp -R "$SCRIPT_DIR/OpManagerAgent.app" /Applications/
sudo cp "$SCRIPT_DIR/agent.conf" "/Library/Application Support/ManageEngine/OpManagerAgent/"

PLIST="/Library/LaunchDaemons/com.manageengine.opmanager.agent.plist"
sudo tee "$PLIST" > /dev/null << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.manageengine.opmanager.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Applications/OpManagerAgent.app/Contents/MacOS/OpManagerAgent</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/opmanager_agent.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/opmanager_agent.err</string>
</dict>
</plist>
EOF

sudo chmod 644 "$PLIST"
sudo chown root:wheel "$PLIST"
sudo launchctl load "$PLIST" 2>/dev/null || true

echo "ManageEngine OpManager Central Agent daemon installed and started!"
echo "Check status: sudo launchctl list | grep opmanager"
