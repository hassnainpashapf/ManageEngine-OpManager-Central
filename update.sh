#!/bin/bash
# ManageEngine OpManager Central Update Check (read-only)
# Checks whether origin/main has new commits and reports the result.
# It NEVER resets, pulls, installs, or restarts anything automatically —
# local changes are never discarded. Apply updates manually if you want them.
set -e

REPO_DIR="/opt/opmanager-central"
if [ ! -d "$REPO_DIR" ]; then
  REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
fi

cd "$REPO_DIR"

# Fetch remote status from GitHub (failure is reported, not swallowed)
git fetch origin main

LOCAL_HASH=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse origin/main)

echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Update Check] Local:  $LOCAL_HASH"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Update Check] Remote: $REMOTE_HASH"
git status --short --branch

if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Update Check] New commit(s) available on origin/main ($REMOTE_HASH)."
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Update Check] No changes were applied. To update manually, review with 'git log HEAD..origin/main' and then run 'git pull --ff-only'."
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [OpManager Update Check] Already up to date with origin/main. Nothing to do."
fi
