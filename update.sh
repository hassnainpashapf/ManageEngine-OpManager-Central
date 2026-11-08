#!/bin/bash
# ManageEngine OpManager Central Auto-Updater & Deployment Sync
set -e

REPO_DIR="/opt/opmanager-central"
if [ ! -d "$REPO_DIR" ]; then
  REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

cd "$REPO_DIR"

# Ensure git remote uses HTTPS without interactive prompt
git config --local pull.rebase false

# Fetch remote status from GitHub
git fetch origin main > /dev/null 2>&1 || exit 0

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Auto-Updater] New commit detected on GitHub: $REMOTE_HASH"
    git pull origin main
    npm install --production --silent
    if command -v systemctl > /dev/null 2>&1; then
        systemctl restart opmanager-central
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Auto-Updater] opmanager-central.service successfully restarted!"
    fi
fi
