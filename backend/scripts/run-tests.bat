@echo off
setlocal enabledelayedexpansion

REM Ensure cleanup runs when the script exits
call :main
call :cleanup
exit /b %ERRORLEVEL%

:main
docker compose -f integration/docker-compose.yml up ^
  --build ^
  --exit-code-from tests ^
  --abort-on-container-exit ^
  tests

REM If docker compose fails, propagate the error
if errorlevel 1 exit /b %ERRORLEVEL%
goto :eof

:cleanup
docker compose -f integration/docker-compose.yml down -v
goto :eof
