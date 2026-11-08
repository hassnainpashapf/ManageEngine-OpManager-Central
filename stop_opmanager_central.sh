#!/bin/bash
echo "Stopping ManageEngine OpManager Central & Monitoring Agent..."
lsof -ti:8060 | xargs kill -9 2>/dev/null
pkill -f "OpManagerAgent" 2>/dev/null
echo "All processes stopped cleanly."
