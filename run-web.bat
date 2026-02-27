@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0.")
title NNTM Web (port 4203)
echo [NNTM] Checking port 4203...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4203 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }"
timeout /t 1 /nobreak >nul
cd /d "%ROOT%\web"
echo [NNTM] Starting Web landing on http://localhost:4203
echo.
call npm run dev
