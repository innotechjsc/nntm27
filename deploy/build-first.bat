@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0..")
cd /d "%ROOT%"
echo [NNTM] Build API...
cd api
call npm install
call npx prisma generate
call npx prisma migrate deploy
cd ..
echo [NNTM] Build CMS...
cd cms
call npm install
cd ..
echo [NNTM] Build Web...
cd web
call npm install
call npm run build
cd ..
echo [NNTM] Build xong. Tao api\.env neu chua co. Sau do chay: deploy\run-all.bat
pause
