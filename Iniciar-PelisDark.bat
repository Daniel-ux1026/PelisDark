@echo off
setlocal
title Iniciar PelisDark
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\Manage-Services.ps1" -Action Start %*
set "RESULT=%ERRORLEVEL%"
echo.
if not "%PELISDARK_NO_PAUSE%"=="1" pause
exit /b %RESULT%
