@echo off
title College Application Encryption System
color 0A

echo.
echo ========================================
echo   College Application Encryption System
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/4] Installing dependencies...
call npm install --legacy-peer-deps --silent
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/4] Starting server...
echo.
echo ========================================
echo   SERVER STARTING...
echo ========================================
echo.
echo Server URL: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

node backend/basic-server.js

echo.
echo Server stopped.
pause
