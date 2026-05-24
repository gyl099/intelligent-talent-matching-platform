# Intelligent Talent Matching Platform

## Project Overview
The Intelligent Talent Matching Platform is a web-based recruitment system designed to improve the efficiency of job searching and talent acquisition. The platform provides a two-way matching mechanism that recommends jobs to candidates and candidates to employers based on skills, education, experience, work mode, and location.

The repository contains a React/Tailwind frontend and a Django REST API backend.

## Features

### Candidate Features
- Register and login
- Create and manage candidate profile
- Upload resume
- Search for jobs
- Browse job listings
- Receive Top-K recommended jobs

### Employer Features
- Register and login
- Create and publish job postings
- Search candidate profiles
- Filter candidates by skills, education, and experience
- Receive Top-N recommended candidates

## Technologies Used

### Frontend
- React
- Tailwind CSS
- Vite

### Backend
- Django
- Django REST Framework
- SimpleJWT

### Database
- SQLite for local development
- PostgreSQL-ready for deployment

## System Architecture

```text
React + Tailwind frontend
        |
Django REST API backend
        |
Database
```

## Project Structure

```text
frontend/   React frontend generated from the UI prototype
backend/    Django REST backend and matching algorithm
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
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

## Frontend Setup

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Then run:

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

## API Contract

The frontend expects the Django backend endpoints documented in:

```text
frontend/API_CONTRACT.md
```
