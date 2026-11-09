@echo off
title ManageEngine OpManager Central Agent
cd /d "%~dp0"
echo ==================================================================
echo    ManageEngine OpManager Central - Windows Agent Runner
echo    Target Central Server: http://192.168.30.65:8060
echo ==================================================================
echo.
OpManagerAgent.exe
pause
