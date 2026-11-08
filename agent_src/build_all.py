#!/usr/bin/env python3
import os
import subprocess
import shutil
import zipfile

AGENT_SRC_DIR = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/agent_src"
DOWNLOADS_DIR = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/client/downloads"
DIST_DIR = "/Users/hussnainpasha/.gemini/antigravity/scratch/opmanager-central/agent_dist"

os.makedirs(DOWNLOADS_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

env_base = os.environ.copy()
env_base["GOPROXY"] = "off"

print("==================================================================")
print(" Building ManageEngine OpManager Central Agents (Windows & macOS) ")
print("==================================================================")

# -------------------------------------------------------------------------
# 1. Build Windows Agent (.exe & .zip)
# -------------------------------------------------------------------------
print("\n[1/3] Compiling Windows x64 Executable (OpManagerAgent.exe)...")
win_dist = os.path.join(DIST_DIR, "windows")
os.makedirs(win_dist, exist_ok=True)

win_exe_path = os.path.join(win_dist, "OpManagerAgent.exe")

env_win = env_base.copy()
env_win["GOOS"] = "windows"
env_win["GOARCH"] = "amd64"

res = subprocess.run(
    ["go", "build", "-ldflags", "-s -w", "-o", win_exe_path, "main.go"],
    cwd=AGENT_SRC_DIR,
    env=env_win,
    capture_output=True,
    text=True
)

if res.returncode != 0:
    print("[ERROR] Windows build failed:\n", res.stderr)
    exit(1)

print(f"[SUCCESS] Windows binary compiled: {win_exe_path} ({os.path.getsize(win_exe_path)} bytes)")

# Create Windows agent.conf
win_conf = """# ManageEngine OpManager Central Agent Configuration File
SERVER_URL=http://localhost:8060
PROBE_ID=101
AUTH_KEY=OPM_EE_PROBE_SEC_KEY_1
POLL_INTERVAL=5
CUSTOM_NAME=
"""
with open(os.path.join(win_dist, "agent.conf"), "w") as f:
    f.write(win_conf)

# Create install_service.bat
win_install_bat = """@echo off
echo ==================================================================
echo   ManageEngine OpManager Central - Windows Agent Service Installer
echo ==================================================================
cd /d "%~dp0"
echo Registering Windows Service 'OpManagerCentralAgent'...
"%~dp0OpManagerAgent.exe" -install
echo Starting Service...
sc.exe start OpManagerCentralAgent
echo Service installation completed.
pause
"""
with open(os.path.join(win_dist, "install_service.bat"), "w") as f:
    f.write(win_install_bat)

# Create start_agent.bat (foreground runner)
win_start_bat = """@echo off
echo Starting ManageEngine OpManager Central Agent in foreground...
cd /d "%~dp0"
"%~dp0OpManagerAgent.exe"
pause
"""
with open(os.path.join(win_dist, "start_agent.bat"), "w") as f:
    f.write(win_start_bat)

# Create Windows ZIP archive
win_zip_path = os.path.join(DOWNLOADS_DIR, "OpManagerAgent-Windows-x64.zip")
with zipfile.ZipFile(win_zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for filename in ["OpManagerAgent.exe", "agent.conf", "install_service.bat", "start_agent.bat"]:
        filepath = os.path.join(win_dist, filename)
        z.write(filepath, arcname=f"OpManagerAgent/{filename}")

# Copy standalone .exe to downloads
shutil.copy2(win_exe_path, os.path.join(DOWNLOADS_DIR, "OpManagerAgent.exe"))
print(f"[SUCCESS] Windows ZIP bundle created: {win_zip_path}")
print(f"[SUCCESS] Windows standalone EXE copied: {os.path.join(DOWNLOADS_DIR, 'OpManagerAgent.exe')}")

# -------------------------------------------------------------------------
# 2. Build macOS Universal Binary (arm64 + amd64)
# -------------------------------------------------------------------------
print("\n[2/3] Compiling macOS Binaries (Apple Silicon arm64 + Intel x86_64)...")
mac_dist = os.path.join(DIST_DIR, "macos")
os.makedirs(mac_dist, exist_ok=True)

bin_arm64 = os.path.join(mac_dist, "OpManagerAgent-arm64")
bin_amd64 = os.path.join(mac_dist, "OpManagerAgent-amd64")
bin_universal = os.path.join(mac_dist, "OpManagerAgent")

env_mac_arm = env_base.copy()
env_mac_arm["GOOS"] = "darwin"
env_mac_arm["GOARCH"] = "arm64"
subprocess.run(["go", "build", "-ldflags", "-s -w", "-o", bin_arm64, "main.go"], cwd=AGENT_SRC_DIR, env=env_mac_arm, check=True)

env_mac_intel = env_base.copy()
env_mac_intel["GOOS"] = "darwin"
env_mac_intel["GOARCH"] = "amd64"
subprocess.run(["go", "build", "-ldflags", "-s -w", "-o", bin_amd64, "main.go"], cwd=AGENT_SRC_DIR, env=env_mac_intel, check=True)

# Combine into Universal Binary
subprocess.run(["lipo", "-create", bin_arm64, bin_amd64, "-output", bin_universal], check=True)
os.chmod(bin_universal, 0o755)
print(f"[SUCCESS] macOS Universal binary created: {bin_universal}")

# -------------------------------------------------------------------------
# 3. Create macOS .app and .dmg Image
# -------------------------------------------------------------------------
print("\n[3/3] Creating macOS Application Bundle and DMG Disk Image...")
dmg_stage = os.path.join(DIST_DIR, "dmg_staging")
if os.path.exists(dmg_stage):
    shutil.rmtree(dmg_stage)
os.makedirs(dmg_stage, exist_ok=True)

app_dir = os.path.join(dmg_stage, "OpManagerAgent.app")
contents_dir = os.path.join(app_dir, "Contents")
macos_dir = os.path.join(contents_dir, "MacOS")
resources_dir = os.path.join(contents_dir, "Resources")

os.makedirs(macos_dir, exist_ok=True)
os.makedirs(resources_dir, exist_ok=True)

# Copy binary to app bundle
shutil.copy2(bin_universal, os.path.join(macos_dir, "OpManagerAgent"))

# Info.plist
plist_content = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>OpManagerAgent</string>
    <key>CFBundleIdentifier</key>
    <string>com.manageengine.opmanager.agent</string>
    <key>CFBundleName</key>
    <string>OpManager Agent</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>12.9.203</string>
    <key>CFBundleVersion</key>
    <string>20261106</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>LSUIElement</key>
    <true/>
</dict>
</plist>
"""
with open(os.path.join(contents_dir, "Info.plist"), "w") as f:
    f.write(plist_content)

# Applications symlink
os.symlink("/Applications", os.path.join(dmg_stage, "Applications"))

# Configuration file
shutil.copy2(os.path.join(win_dist, "agent.conf"), os.path.join(dmg_stage, "agent.conf"))

# install_daemon.sh
mac_install_sh = """#!/bin/bash
# ManageEngine OpManager Central Agent - macOS launchd Installer
set -e
echo "Installing ManageEngine OpManager Central Agent as system daemon..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
sudo mkdir -p /Library/Application\\ Support/ManageEngine/OpManagerAgent/

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
"""
with open(os.path.join(dmg_stage, "install_daemon.sh"), "w") as f:
    f.write(mac_install_sh)
os.chmod(os.path.join(dmg_stage, "install_daemon.sh"), 0o755)

# README.txt
readme_content = """ManageEngine OpManager Central - Host Monitoring Agent for macOS
==================================================================
Version: 12.9.203-GA (Universal Binary for Apple Silicon & Intel)
Copyright (c) 2026 ZOHO Corporation. All rights reserved.

INSTALLATION OPTIONS:
---------------------
Option 1: Drag & Drop (Interactive User Mode)
  - Drag OpManagerAgent.app to the Applications folder.
  - Launch from Applications or Terminal.

Option 2: System Background Daemon (Production Mode)
  - Open Terminal, navigate to this volume, and run:
      sudo ./install_daemon.sh

CONFIGURATION:
--------------
Edit agent.conf to point to your OpManager Central host:
  SERVER_URL=http://<central-ip>:8060
  PROBE_ID=101
  AUTH_KEY=OPM_EE_PROBE_SEC_KEY_1
"""
with open(os.path.join(dmg_stage, "README.txt"), "w") as f:
    f.write(readme_content)

# Generate DMG using hdiutil
dmg_out_path = os.path.join(DOWNLOADS_DIR, "OpManagerAgent.dmg")
if os.path.exists(dmg_out_path):
    os.remove(dmg_out_path)

res_dmg = subprocess.run(
    ["hdiutil", "create", "-volname", "OpManager Central Agent", "-srcfolder", dmg_stage, "-ov", "-format", "UDZO", dmg_out_path],
    capture_output=True,
    text=True
)

if res_dmg.returncode != 0:
    print("[ERROR] DMG creation failed:\n", res_dmg.stderr)
    exit(1)

print(f"[SUCCESS] macOS DMG created: {dmg_out_path} ({os.path.getsize(dmg_out_path)} bytes)")

print("\n==================================================================")
print(" Build Complete! Artifacts ready in client/downloads/:")
for item in os.listdir(DOWNLOADS_DIR):
    p = os.path.join(DOWNLOADS_DIR, item)
    print(f" - {item} ({os.path.getsize(p):,} bytes)")
print("==================================================================")
