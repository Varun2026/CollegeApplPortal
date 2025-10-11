@echo off
echo Starting College Application Encryption System...
echo.
echo Current directory: %CD%
echo Node version:
node --version
echo.
echo Installing dependencies...
call npm install --legacy-peer-deps
echo.
echo Starting backend server...
call npx tsx backend/working-app.js
pause
