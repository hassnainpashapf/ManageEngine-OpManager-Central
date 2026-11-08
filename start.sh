#!/usr/bin/env bash
cd "$(dirname "$0")"
echo "Starting ManageEngine OpManager Central on http://localhost:8060 ..."
node server/index.js
