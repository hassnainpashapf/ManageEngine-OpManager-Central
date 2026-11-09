==================================================================
  ManageEngine OpManager Central - Windows Agent Setup Instructions
==================================================================

Target Central Server: http://192.168.30.65:8060
Probe ID: 101 (Central Site Probe)

QUICK START (3 WAYS TO RUN):

1. Double-click "start_agent.bat" (Easiest):
   - Opens the live console and immediately starts streaming real CPU, RAM, Disk, and Process stats to Central.

2. Run "OpManagerAgent.exe" directly:
   - Double-click OpManagerAgent.exe or run from PowerShell:
     .\OpManagerAgent.exe

3. Install as a permanent Windows Service:
   - Right-click "install_service.bat" and choose "Run as Administrator".
   - The service will run in the background and start automatically on boot.

CONFIGURATION:
- The included 'OPMAgentServerInfo.json' file is automatically detected by OpManagerAgent.exe.
- Even if run standalone without this file, the agent now automatically connects to http://192.168.30.65:8060 by default!
==================================================================
