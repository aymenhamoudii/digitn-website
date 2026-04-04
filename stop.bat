@echo off
setlocal

set "ROOT=%~dp0"
set "PID_DIR=%ROOT%.runtime"

echo Stopping DIGITN services...

call :stop_service django
call :stop_service bridge
call :stop_service next

echo Done.
exit /b 0

:stop_service
set "NAME=%~1"
set "PID_FILE=%PID_DIR%\%NAME%.pid"

if not exist "%PID_FILE%" (
  echo   %NAME%: not running
  exit /b 0
)

set /p PID=<"%PID_FILE%"
if not defined PID (
  del /q "%PID_FILE%" >nul 2>nul
  echo   %NAME%: stale pid file removed
  exit /b 0
)

taskkill /F /T /PID %PID% >nul 2>nul
if errorlevel 1 (
  echo   %NAME%: process not found
) else (
  echo   %NAME%: stopped
)

del /q "%PID_FILE%" >nul 2>nul
exit /b 0
