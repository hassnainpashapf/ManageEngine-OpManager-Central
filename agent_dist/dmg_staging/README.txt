ManageEngine OpManager Central - Host Monitoring Agent for macOS
==================================================================
Version: 12.9.204-GA (Universal Binary for Apple Silicon & Intel)
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
  AUTH_KEY=<per-agent key issued by OpManager Central for this host>
