@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale o Node.js 22 ou superior em https://nodejs.org e abra este arquivo novamente.
 pause
 exit /b 1
)
node lan-server/start.cjs
pause
