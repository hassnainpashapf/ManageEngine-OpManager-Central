@echo off
title ManageEngine OpManager Central Agent Service Installer
cd /d "%~dp0"
echo ==================================================================
echo    ManageEngine OpManager Central - Background Service Installer
echo ==================================================================
echo.
echo Installing OpManagerCentralAgent service...
OpManagerAgent.exe -install
echo.
echo Starting service...
net start OpManagerCentralAgent
echo.
echo OpManager Agent service installed and running!
pause
