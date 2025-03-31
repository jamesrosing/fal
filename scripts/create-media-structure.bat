@echo off
echo Creating media structure...
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-media-structure.ps1"
echo.
echo If successful, you should see a fal-media-structure.zip file in the root directory.
echo.
pause 