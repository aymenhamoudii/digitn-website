@echo off
setlocal

set "ROOT=%~dp0"
set "PID_DIR=%ROOT%.runtime"

if not exist "%PID_DIR%" mkdir "%PID_DIR%"

call "%ROOT%stop.bat" >nul 2>nul

echo Starting Django backend on port 8000...
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -WorkingDirectory '%ROOT%backend' -ArgumentList '/k','python manage.py runserver 0.0.0.0:8000' -PassThru; Set-Content -Path '%PID_DIR%\django.pid' -Value $p.Id"

echo Starting Bridge server on port 3001...
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -WorkingDirectory '%ROOT%bridge' -ArgumentList '/k','node server.js' -PassThru; Set-Content -Path '%PID_DIR%\bridge.pid' -Value $p.Id"

echo Starting Next.js frontend on port 3000...
powershell -NoProfile -Command "$p = Start-Process -FilePath 'cmd.exe' -WorkingDirectory '%ROOT%' -ArgumentList '/k','npm run dev' -PassThru; Set-Content -Path '%PID_DIR%\next.pid' -Value $p.Id"

echo.
echo All services started:
echo   Django   -^> http://localhost:8000
echo   Bridge   -^> http://localhost:3001
echo   Next.js  -^> http://localhost:3000
echo.
pause
