@echo off
chcp 65001 >nul
if defined NNTM_ROOT (set "ROOT=%NNTM_ROOT%") else (set "ROOT=%~dp0..")
cd /d "%ROOT%"

set "TARGET=%~1"
if "%TARGET%"=="" set "TARGET=all"
echo [NNTM] Deploy update - target: %TARGET%
echo [NNTM] Pull from origin main...
git pull origin main
if errorlevel 1 (echo Git pull failed. && pause && exit /b 1)
echo.

if "%TARGET%"=="all" goto :do_all
if "%TARGET%"=="api" goto :do_api
if "%TARGET%"=="cms" goto :do_cms
if "%TARGET%"=="web" goto :do_web
echo Unknown target: %TARGET%. Use: api ^| cms ^| web ^| all
pause
exit /b 1

:do_all
echo [NNTM] API: install + Prisma...
cd api
call npm install
call npx prisma generate
call npx prisma migrate deploy
cd ..
echo [NNTM] CMS: install...
cd cms
call npm install
cd ..
echo [NNTM] Web: install + build...
cd web
call npm install
call npm run build
cd ..
goto :done

:do_api
echo [NNTM] API: install + Prisma...
cd api
call npm install
call npx prisma generate
call npx prisma migrate deploy
cd ..
goto :done

:do_cms
echo [NNTM] CMS: install...
cd cms
call npm install
cd ..
goto :done

:do_web
echo [NNTM] Web: install + build...
cd web
call npm install
call npm run build
cd ..
goto :done

:done
echo.
echo [NNTM] Done. Restart: run deploy\run-all.bat (or PM2: pm2 restart nntm-api / nntm-cms / nntm-web).
pause
