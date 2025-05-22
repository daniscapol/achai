@echo off
echo Starting AchaAI Development Servers...
echo.

REM Set environment variable for development
set VITE_API_BASE_URL=http://localhost:3001/api

REM Change to project directory (adjust path if needed)
cd /d "%~dp0"

REM Start both servers concurrently
echo Starting API Server and Frontend...
start "API Server" cmd /k "node src/api/server.js"
timeout /t 3 /nobreak > nul
start "Frontend" cmd /k "npx vite --host 0.0.0.0 --port 5173"

echo.
echo ===============================================
echo 🚀 Development servers starting...
echo ===============================================
echo 📡 API Server: http://localhost:3001
echo 🌐 Frontend: http://localhost:5173
echo 🔐 Admin Panel: http://localhost:5173/secure-admin
echo ===============================================
echo.
echo Press any key to close this window...
pause > nul 