@echo off
echo.
echo 🚀 JPvano - Quick Start Script
echo ==============================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

echo ✅ Node.js is installed

REM Check PostgreSQL
psql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  PostgreSQL not found in PATH
)

REM Backend setup
echo.
echo 📦 Setting up Backend...
cd jpvano-backend

if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo ⚠️  Please configure .env file with your settings
)

echo Installing backend dependencies...
call npm install

REM Frontend setup
echo.
echo 🎨 Setting up Frontend...
cd ..\jpvano-frontend

if not exist .env.local (
    echo Creating .env.local file...
    copy .env.example .env.local
)

echo Installing frontend dependencies...
call npm install

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start development:
echo    Terminal 1: cd jpvano-backend ^&^& npm run dev
echo    Terminal 2: cd jpvano-frontend ^&^& npm run dev
echo.
echo 🌐 Access:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
pause
