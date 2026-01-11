@echo off
setlocal

REM === Move to this file's folder (web_deck) ===
cd /d "%~dp0"

set PORT=8000
set URL=http://127.0.0.1:%PORT%/

REM === Find Python (python or py) ===
where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting local server with python...
  start "" "%URL%"
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting local server with py...
  start "" "%URL%"
  py -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

echo.
echo [ERROR] Pythonが見つかりません。
echo 担当者PCにPythonが無いと起動できません。
echo 対応案:
echo 1) Pythonをインストールする（推奨）
echo 2) 代替の簡易サーバーexeを同梱する（こちらで用意可能）
echo.
pause
