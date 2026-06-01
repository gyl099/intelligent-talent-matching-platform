# Intelligent Talent Matching Platform

## Project Overview

The Intelligent Talent Matching Platform is a web-based recruitment system that improves job searching and talent acquisition. It supports two user roles:

- Candidates can manage profiles, upload resumes, browse jobs, apply for jobs, and receive Top-K job recommendations.
- Employers can create job postings, search and filter candidates, view applicants, open candidate resumes, and receive Top-N candidate recommendations.

The project uses a React/Tailwind CSS frontend and a Django REST Framework backend.

## Features

### Candidate Features
- Register and login
- Create and update candidate profile
- Upload resume PDF
- Browse and search job postings
- View recommended jobs
- Apply for job postings

### Employer Features
- Register and login
- Create and publish job postings
- Search and filter candidate profiles
- View recommended candidates for each job
- View applicants for each job posting
- Open uploaded candidate resumes

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
backend/    Django REST API, database models, and matching logic
```

# For manual setup via terminal commands, follow the instructions below

## Backend Setup

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

The backend runs at:

```text
http://127.0.0.1:8000/api
```

Demo accounts after seeding:

```text
Candidate: aarav.mehta@example.com / password123
Employer: hiring@northwind.io / password123
```

## Access database (Django Administration):

This command creates a user onto Django administration

```powershell
python manage.py createsuperuser
```

To access Django administration:

```text
http://127.0.0.1:8000/admin/
```

## Frontend Setup

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

## Running The Project

Use two terminals:

```powershell
# Terminal 1
cd backend
venv\Scripts\activate
python manage.py runserver
```

```bash
# Terminal 2
cd frontend
npm run dev
```

## Main Workflow

1. Login as an employer and create a job posting.
2. Login as a candidate and browse or view recommended jobs.
3. Apply for a job from the job detail page.
4. Login as the employer again.
5. Open the employer dashboard, select the job, and view applicants.
6. Click the candidate resume filename to open the uploaded PDF.

## API Contract

The frontend communicates with the Django backend through the API client in:

```text
frontend/src/lib/api.ts
```

The expected endpoint contract is documented in:

```text
frontend/API_CONTRACT.md
```

