@echo off
setlocal enabledelayedexpansion
title Video Prompt Generator - Windows Installer

:: Colors for better UX
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "GREEN=%ESC%[32m"
set "RED=%ESC%[31m"
set "YELLOW=%ESC%[33m"
set "BLUE=%ESC%[34m"
set "CYAN=%ESC%[36m"
set "RESET=%ESC%[0m"

echo %CYAN%========================================%RESET%
echo %CYAN%   Video Prompt Generator Installer    %RESET%
echo %CYAN%========================================%RESET%
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo %RED%Error: package.json not found!%RESET%
    echo %YELLOW%Please run this installer from the project root directory.%RESET%
    echo.
    pause
    exit /b 1
)

:: Check Node.js installation
echo %BLUE%[1/6] Checking Node.js installation...%RESET%
node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%Error: Node.js is not installed or not in PATH!%RESET%
    echo %YELLOW%Please install Node.js 18+ from: https://nodejs.org%RESET%
    echo.
    pause
    exit /b 1
)

:: Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%✓ Node.js found: !NODE_VERSION!%RESET%

:: Check npm
echo %BLUE%[2/6] Checking npm installation...%RESET%
npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo %RED%Error: npm is not available!%RESET%
    echo %YELLOW%npm should come with Node.js. Please reinstall Node.js.%RESET%
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%✓ npm found: !NPM_VERSION!%RESET%

:: Check for Bun (optional)
echo %BLUE%[3/6] Checking for Bun (optional)...%RESET%
bun --version >nul 2>&1
if !errorlevel! equ 0 (
    for /f "tokens=*" %%i in ('bun --version') do set BUN_VERSION=%%i
    echo %GREEN%✓ Bun found: !BUN_VERSION!%RESET%
    set HAS_BUN=1
) else (
    echo %YELLOW%• Bun not found (npm will be used)%RESET%
    set HAS_BUN=0
)

:: Choose package manager
echo.
echo %BLUE%[4/6] Choose package manager:%RESET%
if !HAS_BUN! equ 1 (
    echo %CYAN%1) npm (recommended for beginners)%RESET%
    echo %CYAN%2) Bun (faster, for advanced users)%RESET%
    echo.
    set /p choice=%YELLOW%Enter your choice (1 or 2, default: 1): %RESET%
    if "!choice!"=="" set choice=1
    if "!choice!"=="2" (
        set PACKAGE_MANAGER=bun
        set INSTALL_CMD=bun install
        set RUN_CMD=bun run dev
    ) else (
        set PACKAGE_MANAGER=npm
        set INSTALL_CMD=npm install
        set RUN_CMD=npm run dev
    )
) else (
    set PACKAGE_MANAGER=npm
    set INSTALL_CMD=npm install
    set RUN_CMD=npm run dev
)

echo %GREEN%✓ Using !PACKAGE_MANAGER! for installation%RESET%

:: Install dependencies
echo.
echo %BLUE%[5/6] Installing dependencies...%RESET%
echo %YELLOW%Running: !INSTALL_CMD!%RESET%
echo %YELLOW%This may take a few minutes...%RESET%
echo.

!INSTALL_CMD!

if !errorlevel! neq 0 (
    echo.
    echo %RED%Error: Failed to install dependencies!%RESET%
    echo %YELLOW%Common solutions:%RESET%
    echo %YELLOW%• Check your internet connection%RESET%
    echo %YELLOW%• Clear npm cache: npm cache clean --force%RESET%
    echo %YELLOW%• Delete node_modules and try again%RESET%
    echo %YELLOW%• Try using npm instead of Bun%RESET%
    echo.
    pause
    exit /b 1
)

echo.
echo %GREEN%✓ Dependencies installed successfully!%RESET%

:: Launch options
echo.
echo %BLUE%[6/6] Installation complete!%RESET%
echo.
echo %CYAN%========================================%RESET%
echo %CYAN%         🎉 SUCCESS! 🎉                %RESET%
echo %CYAN%========================================%RESET%
echo.
echo %GREEN%The Video Prompt Generator is ready to use!%RESET%
echo.
echo %YELLOW%Next steps:%RESET%
echo %CYAN%1. Configure AI providers (in-app settings):%RESET%
echo    • Google Gemini API key
echo    • DashScope (Qwen) API key  
echo    • Ollama local server (http://localhost:11434)
echo.
echo %CYAN%2. Launch the application:%RESET%
echo    • Development server: %YELLOW%!RUN_CMD!%RESET%
echo    • Production build: %YELLOW%!PACKAGE_MANAGER! run build%RESET%
echo.

:: Ask if user wants to start immediately
set /p start=%CYAN%Start the development server now? (Y/n): %RESET%
if /i "!start!"=="n" goto :end
if /i "!start!"=="no" goto :end

echo.
echo %BLUE%Starting development server...%RESET%
echo %YELLOW%The app will open at: http://localhost:8080%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.

:: Wait a moment then open browser
timeout /t 3 /nobreak >nul
start http://localhost:8080

:: Start the development server
!RUN_CMD!

:end
echo.
echo %GREEN%Installation completed successfully!%RESET%
echo %CYAN%To start later, run: !RUN_CMD!%RESET%
echo.
pause