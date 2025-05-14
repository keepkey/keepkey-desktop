@echo off
REM Setup script for Windows development environment
REM This file is meant to be double-clicked to run

powershell -ExecutionPolicy Bypass -File ".circleci\setup-windows-dev.ps1"

echo.
echo Setup completed! Press any key to exit...
pause > nul 