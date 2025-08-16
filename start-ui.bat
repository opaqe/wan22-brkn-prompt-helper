@echo off
setlocal enabledelayedexpansion
title Video Prompt Generator - Development Server

:: Colors for better UX
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "RED=%ESC%[31m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "CYAN=%ESC%[36m"
set "RESET=%ESC%[0m"

echo %CYAN%========================================%RESET%
echo %CYAN%   Video Prompt Generator - Start UI   %RESET%
echo %CYAN%========================================%RESET%
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo %RED%Error: package.json not found!%RESET%
    echo %YELLOW%Please run this from the project root directory.%RESET%
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo %RED%Error: Dependencies not installed!%RESET%
    echo %YELLOW%Please run install-windows.bat first to install dependencies.%RESET%
    echo.
    pause
    exit /b 1
)

:: Check for Bun first, then npm
echo %BLUE%Detecting package manager...%RESET%
bun --version >nul 2>&1
if !errorlevel! equ 0 (
    set PACKAGE_MANAGER=bun
    set RUN_CMD=bun run dev
    echo %GREEN%✓ Using Bun%RESET%
) else (
    npm --version >nul 2>&1
    if !errorlevel! equ 0 (
        set PACKAGE_MANAGER=npm
        set RUN_CMD=npm run dev
        echo %GREEN%✓ Using npm%RESET%
    ) else (
        echo %RED%Error: Neither npm nor Bun found!%RESET%
        echo %YELLOW%Please install Node.js or Bun first.%RESET%
        echo.
        pause
        exit /b 1
    )
)

echo.
echo %BLUE%Starting development server...%RESET%
echo %YELLOW%Command: !RUN_CMD!%RESET%
echo.
echo %GREEN%The app will be available at: http://localhost:8080%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.

:: Wait a moment then open browser
echo %CYAN%Opening browser in 3 seconds...%RESET%
timeout /t 3 /nobreak >nul
start http://localhost:8080

:: Start the development server
!RUN_CMD!