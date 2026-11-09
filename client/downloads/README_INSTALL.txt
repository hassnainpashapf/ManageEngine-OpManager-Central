==================================================================
  ManageEngine OpManager Central - Windows Agent Setup Instructions
==================================================================

QUICK START (3 WAYS TO RUN):

1. Install as a permanent Windows Service (recommended):
   - Right-click "install_service.bat" and choose "Run as Administrator".
   - The service runs in the background and starts automatically on boot.
   - Before installing, set your Central server in agent.conf
     (SERVER_URL) and the per-agent key issued by Central for this
     host (AUTH_KEY). There is no default server or key.

2. Double-click "start_agent.bat" (foreground run):
   - Runs the agent in a console window, streaming real CPU, RAM,
     Disk, and Process stats to Central. Uses agent.conf next to the
     executable; edit SERVER_URL / AUTH_KEY there first.

3. Run "OpManagerAgent.exe" directly:
   - Double-click OpManagerAgent.exe or run from PowerShell:
     .\OpManagerAgent.exe -server http://<central-server>:8060 -probe 101 -key <key>

CONFIGURATION (agent.conf, next to the executable):
- SERVER_URL: URL of this Central server, e.g. http://<central-server>:8060
- PROBE_ID: Enterprise Probe identifier (e.g. 101)
- AUTH_KEY: the one-time key issued by Central for this host
- POLL_INTERVAL: telemetry interval in seconds (default 5)
- CUSTOM_NAME: display name (defaults to the system hostname)

The agent refuses to start without a server URL and an auth key.
==================================================================
