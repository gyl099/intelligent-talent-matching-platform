# Intelligent Talent Matching Platform

## Project Overview

The Intelligent Talent Matching Platform is a web-based recruitment system that helps candidates find suitable jobs and helps employers find suitable talent. The platform supports two user roles:

- Candidates can manage profiles, upload resumes, browse jobs, apply for jobs, use fuzzy job search, and receive job recommendations.
- Employers can create and manage job postings, search and filter candidates, view applicants, open candidate resumes, use fuzzy candidate search, and receive candidate recommendations.

The project uses a React/Tailwind CSS frontend and a Django REST Framework backend.

## Features

### Candidate Features

- Register and login
- Create and update candidate profile
- Upload resume PDF
- Browse and search job postings
- Search jobs using keyword, filters, and fuzzy matching
- View recommended jobs based on skills, education, experience, location, and work mode
- Apply for job postings
- Upgrade to membership for unlimited job recommendations

### Employer Features

- Register and login
- Create and publish job postings
- Manage and update own job postings
- Search and filter candidate profiles
- Search candidates using keyword, filters, and fuzzy matching
- View recommended candidates for each job
- View applicants for each job posting
- Open uploaded candidate resumes
- Upgrade to membership for unlimited candidate recommendations and more job posting slots

## Membership Rules

The platform supports membership options for both candidates and employers.

```text
Candidate non-member: Top 10 recommended jobs
Candidate member: Unlimited recommended jobs

Employer non-member: Top 10 recommended candidates per job
Employer member: Unlimited recommended candidates per job
```

Employer job posting limits are also controlled by membership:

```text
Employer non-member: 1 active job posting
Employer member: Up to 3 job postings
```

Membership can be activated or cancelled from the candidate or employer membership page.

## Search Function

The platform supports keyword search, filter search, combined keyword-plus-filter search, and fuzzy search.

### Job Search

Candidates can search job postings by:

```text
keyword
location
work mode
salary range
required education
```

Keyword search checks job title, company, description, location, and required skills.

### Candidate Search

Employers can search candidate profiles by:

```text
keyword
skills
education
minimum years of experience
location
```

Keyword search checks candidate name, headline, bio, major, location, and skills.

### Fuzzy Search

Fuzzy search helps return relevant results even when the search term contains spelling mistakes or approximate wording. The backend uses Python's `difflib.SequenceMatcher` to compare search terms with searchable job and candidate profile text.

## Technologies Used

### Frontend

- React
- TypeScript
- Tailwind CSS
- Vite
- TanStack Router

### Backend

- Django
- Django REST Framework
- SimpleJWT
- django-cors-headers

### Database

- SQLite for local development
- PostgreSQL-ready for future deployment

## System Architecture

```text
React + Tailwind frontend
        |
Django REST API backend
        |
SQLite database
```

## Project Structure

```text
frontend/   React frontend application
backend/    Django REST API, database models, search, and matching logic
Start.bat   Automatic local setup and startup script for Windows
```

## Automatic Setup With Start.bat

The project includes `Start.bat`, which can set up and start both the backend and frontend servers automatically.

Before running it, make sure these are installed:

```text
Python
Node.js
npm
```

To check npm:

```powershell
npm -v
```

If PowerShell blocks npm scripts with an execution policy error, run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run:

```text
Start.bat
```

The batch file will:

1. Create the backend virtual environment
2. Install backend Python dependencies
3. Run database migrations
4. Seed demo data
5. Install frontend npm dependencies
6. Start the Django backend server
7. Start the Vite frontend server
8. Open the frontend in the browser

The servers run at:

```text
Backend: http://127.0.0.1:8000
Frontend: http://127.0.0.1:5173
```

## Manual Backend Setup

Run these commands from the project root in PowerShell:

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

The backend API runs at:

```text
http://127.0.0.1:8000/api
```

The `seed_demo` command creates a ready-to-test SQLite demo database with employer accounts, candidate accounts, job postings, and sample job applications.

All seeded demo accounts use the same password:

```text
password123
```

Useful demo accounts after seeding:

```text
Employer: hiring@northwind.io
Employer: talent@brightpath.com
Employer: recruitment@cloudnova.ai

Candidate: aarav.mehta@example.com
Candidate: sophia.chen@example.com
Candidate: liam.tan@example.com
```

## Django Administration

To create an admin user:

```powershell
cd backend
venv\Scripts\activate
python manage.py createsuperuser
```

Then open:

```text
http://127.0.0.1:8000/admin/
```

## Manual Frontend Setup

Create `frontend/.env` using the example file:

```powershell
cd frontend
copy .env.example .env
```

The file should contain:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Install dependencies and start the frontend:

```powershell
npm install
npm run dev
```

The frontend runs at:

```text
http://127.0.0.1:5173
```

## Running The Project Manually

Use two terminals:

```powershell
# Terminal 1 - backend
cd backend
venv\Scripts\activate
python manage.py runserver
```

```powershell
# Terminal 2 - frontend
cd frontend
npm run dev
```

## Main Workflow

1. Login as an employer and create a job posting.
2. Use the employer dashboard to manage or update the job posting.
3. Login as a candidate and browse, search, or view recommended jobs.
4. Apply for a job from the job detail page.
5. Login as the employer again.
6. Open the employer dashboard, select the job, and view applicants.
7. Click the candidate resume filename to open the uploaded PDF.
8. Upgrade candidate or employer membership to view unlimited recommendations.

## API Contract

The frontend communicates with the Django backend through the API client in:

```text
frontend/src/lib/api.ts
```

Important API endpoints include:

```text
POST   /api/auth/signup/
POST   /api/auth/login/
POST   /api/auth/membership/
DELETE /api/auth/membership/

GET    /api/jobs/
POST   /api/jobs/
GET    /api/jobs/{id}/
PATCH  /api/jobs/{id}/
DELETE /api/jobs/{id}/
POST   /api/jobs/{id}/apply/
GET    /api/jobs/{id}/applications/
GET    /api/jobs/{id}/recommendations/

GET    /api/candidates/me/
PATCH  /api/candidates/me/
POST   /api/candidates/me/resume/
GET    /api/candidates/me/recommendations/
GET    /api/candidates/search/

GET    /api/employers/me/jobs/
```

The expected endpoint contract is documented in:

```text
frontend/API_CONTRACT.md
```

## Notes For Reviewers

- `db.sqlite3`, virtual environments, `node_modules`, `.env`, and uploaded media files are intentionally ignored by Git.
- Run `python manage.py migrate` and `python manage.py seed_demo` to recreate the local database.
- Use `Start.bat` for the fastest Windows setup, or follow the manual backend/frontend setup commands above.
