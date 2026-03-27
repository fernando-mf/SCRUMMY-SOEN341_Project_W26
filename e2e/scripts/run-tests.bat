@echo off
setlocal enabledelayedexpansion

REM Ensure cleanup runs when the script exits
call :main
call :cleanup
exit /b %ERRORLEVEL%

:main
docker compose -f docker-compose.yml up ^
  --build ^
  --exit-code-from e2e ^
  --abort-on-container-exit ^
  e2e

REM If docker compose fails, propagate the error
if errorlevel 1 exit /b %ERRORLEVEL%
goto :eof

:cleanup
docker compose -f docker-compose.yml down -v
goto :eof
