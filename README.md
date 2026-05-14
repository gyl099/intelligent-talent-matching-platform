# intelligent-talent-matching-platform
An Intelligent Talent Matching Platform developed using Django, HTML, CSS, and PostgreSQL to improve the recruitment process through candidate-employer matching, profile management, job posting, search and filtering functions, and recommendation-based job matching.


# Intelligent Talent Matching Platform

## Project Overview
The Intelligent Talent Matching Platform is a web-based recruitment system designed to improve the efficiency of job searching and talent acquisition. The platform provides a two-way intelligent matching mechanism that allows candidates to search for jobs while enabling employers to identify suitable candidates based on job requirements and candidate qualifications.

The system aims to simplify and enhance the recruitment process through profile management, job posting, search functionality, filtering, and recommendation features.

---

## Features

### Candidate Features
- Register and login
- Create and manage candidate profile
- Upload resume
- Search for jobs
- Browse job listings
- Receive Top-K recommended jobs
- Apply for jobs

### Employer Features
- Register and login
- Create and manage employer profile
- Create and publish job postings
- Search candidate profiles
- Filter candidates by skills, education, and experience
- Receive Top-N recommended candidates

---

## Technologies Used

### Frontend
- HTML5
- CSS3

### Backend
- Django (Python)

### Database
- PostgreSQL

### Version Control & Project Management
- GitHub
- Taiga

---

## System Architecture

```text
HTML/CSS Frontend
        ↓
Django Backend Logic
        ↓
PostgreSQL Database
```

# Intelligent Talent Matching Platform

## Installation and Setup Guide

### 1. Clone Repository

```bash
git clone <repository link>
```

### 1. Navigate to Project Directory
```bash
cd intelligent-talent-matching-platform
```

### 2. Create Virtual Environment
```bash
## Windows
python -m venv venv

OR

## macOS
python3 -m venv venv
```

### 3. Activate Virtual Environment
```bash
## Windows
venv\Scripts\activate

OR

## macOS
source venv/bin/activate
```

### 4. Install Required Packages
```bash
pip install -r requirements.txt
```

### 5. Install PostgreSQL Driver
```bash
pip install psycopg2-binary
```

### 6. Apply Database Migrations
```bash
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
```

### 8. Run Development Server
```bash
python manage.py runserver
```




