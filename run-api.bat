@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0.")
title NNTM API (port 4201)
echo [NNTM] Checking port 4201...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4201 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }"
timeout /t 1 /nobreak >nul
cd /d "%ROOT%\api"
echo [NNTM] Starting API on http://localhost:4201
echo.
set PORT=4201
call npm run dev
