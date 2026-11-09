@echo off
echo Starting ManageEngine OpManager Central Agent in foreground...
cd /d "%~dp0"
"%~dp0OpManagerAgent.exe"
pause
