
@echo off
set ROOT=%~dp0
 
echo === Checking Node.js ===
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Downloading installer...
    curl -o "%TEMP%\node_installer.msi" "https://nodejs.org/dist/v22.13.1/node-v22.13.1-x64.msi"
    echo Installing Node.js - this may take a minute...
    msiexec /i "%TEMP%\node_installer.msi" /quiet /norestart
    del "%TEMP%\node_installer.msi"
    echo Refreshing PATH...
    for /f "tokens=*" %%i in ('powershell -command "[System.Environment]::GetEnvironmentVariable(\"PATH\",\"Machine\")"') do set "PATH=%%i;%PATH%"
    echo Node.js installed.
) else (
    echo Node.js already installed.
)
 
echo === Setting up backend ===
cd /d "%ROOT%backend"
if %errorlevel% neq 0 ( echo ERROR: Could not cd to backend & pause & exit /b 1 )
 
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
 
echo === Setting up frontend ===
cd /d "%ROOT%frontend"
if %errorlevel% neq 0 ( echo ERROR: Could not cd to frontend & pause & exit /b 1 )
 
if not exist .env copy .env.example .env
call npm install
 
echo === Starting servers ===
start "Django Server" cmd /k "cd /d "%ROOT%backend" && call venv\Scripts\activate && python manage.py runserver"
start "Frontend Dev Server" cmd /k "cd /d "%ROOT%frontend" && npm run dev"
 
echo === Opening browser ===
timeout /t 5 /nobreak >nul
start http://localhost:5173
 
echo.
echo Both servers are running in separate windows.
pause
