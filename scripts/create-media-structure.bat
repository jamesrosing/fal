@echo off
echo Creating media structure based on usage map...
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-media-structure.ps1"
echo.
echo If successful, you should see a fal-media-structure-from-map.zip file in the root directory.
echo.
pause 