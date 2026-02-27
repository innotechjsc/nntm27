@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0.")
title NNTM CMS (port 4202)
echo [NNTM] Checking port 4202...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 4202 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }"
timeout /t 1 /nobreak >nul
cd /d "%ROOT%\cms"
echo [NNTM] Starting CMS on http://localhost:4202
echo.
call npm run dev
