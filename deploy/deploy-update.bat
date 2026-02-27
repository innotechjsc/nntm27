@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0..")
cd /d "%ROOT%"
echo [NNTM] Deploy update - pull and install...
git pull origin main
if errorlevel 1 (echo Git pull failed. && pause && exit /b 1)
echo.
echo [NNTM] API: install + Prisma...
cd api
call npm install
call npx prisma generate
call npx prisma migrate deploy
cd ..
echo.
echo [NNTM] CMS: install...
cd cms
call npm install
cd ..
echo [NNTM] Web: install + build...
cd web
call npm install
call npm run build
cd ..
echo.
echo [NNTM] Done. Restart services: run deploy\run-all.bat (or PM2 restart).
pause
