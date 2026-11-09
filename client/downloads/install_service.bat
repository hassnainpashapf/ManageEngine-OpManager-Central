@echo off
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
