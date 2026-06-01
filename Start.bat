@echo off
set ROOT=%~dp0
 
echo === Setting up backend ===
cd /d "%ROOT%backend"
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
 
echo === Setting up frontend ===
cd /d "%ROOT%frontend"
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
 
