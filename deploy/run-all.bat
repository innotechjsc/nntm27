@echo off
chcp 65001 >nul
rem Duong dan: uu tien NNTM_ROOT (dat truoc khi chay tren server), khong thi dung thu muc chua file .bat
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%\") else (set "ROOT=%~dp0")
echo [NNTM] Starting API, CMS, Web...
echo   Root: %ROOT%
echo   API:  http://localhost:4201
echo   CMS:  http://localhost:4202
echo   Web:  http://localhost:4203
echo.

powershell -NoProfile -Command "foreach($port in 4201,4202,4203){ Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} } }"
timeout /t 1 /nobreak >nul

start "NNTM API (4201)" cmd /k "cd /d "%ROOT%api" && set PORT=4201 && npm run dev"
timeout /t 3 /nobreak >nul

start "NNTM CMS (4202)" cmd /k "cd /d "%ROOT%cms" && npm run dev"
timeout /t 2 /nobreak >nul

start "NNTM Web (4203)" cmd /k "cd /d "%ROOT%web" && npm run dev"

echo.
echo [NNTM] All dev servers started in separate windows.
echo [NNTM] Tren server: set NNTM_ROOT=C:\duong\dan\toi\NNTM truoc khi chay
pause
