
from django.core.management.base import BaseCommand

from accounts.models import User
from candidates.models import CandidateProfile
from jobs.models import JobApplication, JobPosting


PASSWORD = "password123"


class Command(BaseCommand):
    help = "Create demo employers, candidates, jobs, and applications."

    def handle(self, *args, **options):
        employers = self.create_employers()
        candidates = self.create_candidates()
        jobs = self.create_jobs(employers)
        self.create_applications(jobs, candidates)

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data ready: 3 employers, 10 candidates, 10 jobs, and 9 applications. "
                f"Password for all demo users: {PASSWORD}"
            )
        )

    def create_user(self, email, full_name, role):
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "full_name": full_name,
                "role": role,
            },
        )
        user.username = email
        user.full_name = full_name
        user.role = role
        user.set_password(PASSWORD)
        user.save()
        return user

    def create_employers(self):
        employers = {}

        data = [
            ("hiring@northwind.io", "Northwind Labs"),
            ("talent@brightpath.com", "BrightPath Digital"),
            ("recruitment@cloudnova.ai", "CloudNova AI"),
        ]

        for email, full_name in data:
            employers[email] = self.create_user(email, full_name, User.Role.EMPLOYER)

        return employers

    def create_candidates(self):
        candidates = {}

        data = [
            {
                "email": "aarav.mehta@example.com",
                "full_name": "Aarav Mehta",
                "location": "Singapore",
                "headline": "Senior Full-Stack Engineer",
                "bio": "Six years building React and Django products.",
                "education": CandidateProfile.Education.MASTER,
                "major": "Computer Science",
                "years_experience": 6,
                "skills": ["React", "TypeScript", "Django", "PostgreSQL", "Docker", "Redis"],
            },
            {
                "email": "sophia.chen@example.com",
                "full_name": "Sophia Chen",
                "location": "Sydney",
                "headline": "Frontend Engineer",
                "bio": "Frontend developer focused on accessible React interfaces.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Software Engineering",
                "years_experience": 3,
                "skills": ["React", "TypeScript", "Tailwind CSS", "Vite", "Figma"],
            },
            {
                "email": "liam.tan@example.com",
                "full_name": "Liam Tan",
                "location": "Melbourne",
                "headline": "Backend Developer",
                "bio": "Backend developer experienced in Django APIs and databases.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Information Technology",
                "years_experience": 4,
                "skills": ["Python", "Django", "REST API", "PostgreSQL", "JWT", "Docker"],
            },
            {
                "email": "maya.kumar@example.com",
                "full_name": "Maya Kumar",
                "location": "Singapore",
                "headline": "Data Analyst",
                "bio": "Data analyst experienced in dashboards and business insights.",
                "education": CandidateProfile.Education.MASTER,
                "major": "Data Science",
                "years_experience": 5,
                "skills": ["Python", "SQL", "Power BI", "Tableau", "Machine Learning"],
            },
            {
                "email": "daniel.park@example.com",
                "full_name": "Daniel Park",
                "location": "Brisbane",
                "headline": "Cloud Engineer",
                "bio": "Cloud engineer working with containers, CI/CD, and AWS.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Computer Engineering",
                "years_experience": 5,
                "skills": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD"],
            },
            {
                "email": "emily.wong@example.com",
                "full_name": "Emily Wong",
                "location": "Sydney",
                "headline": "UX Designer",
                "bio": "UX designer creating wireframes, prototypes, and accessible interfaces.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Interaction Design",
                "years_experience": 4,
                "skills": ["Figma", "User Research", "Wireframing", "Prototyping", "Accessibility"],
            },
            {
                "email": "noah.smith@example.com",
                "full_name": "Noah Smith",
                "location": "Perth",
                "headline": "Junior Software Developer",
                "bio": "Junior developer with web application and database experience.",
                "education": CandidateProfile.Education.DIPLOMA,
                "major": "Web Development",
                "years_experience": 1,
                "skills": ["JavaScript", "React", "Node.js", "SQLite", "HTML", "CSS"],
            },
            {
                "email": "olivia.brown@example.com",
                "full_name": "Olivia Brown",
                "location": "Adelaide",
                "headline": "AI Engineer",
                "bio": "AI engineer building recommendation and NLP prototypes.",
                "education": CandidateProfile.Education.MASTER,
                "major": "Artificial Intelligence",
                "years_experience": 4,
                "skills": ["Python", "Machine Learning", "NLP", "FastAPI", "Pandas", "TensorFlow"],
            },
            {
                "email": "ethan.nguyen@example.com",
                "full_name": "Ethan Nguyen",
                "location": "Canberra",
                "headline": "Cybersecurity Analyst",
                "bio": "Security analyst focused on secure systems and vulnerability assessment.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Cybersecurity",
                "years_experience": 3,
                "skills": ["Security", "Python", "Linux", "Risk Assessment", "Networking", "OWASP"],
            },
            {
                "email": "ava.martin@example.com",
                "full_name": "Ava Martin",
                "location": "Remote",
                "headline": "Product Manager",
                "bio": "Product manager translating user needs into agile delivery plans.",
                "education": CandidateProfile.Education.BACHELOR,
                "major": "Business Information Systems",
                "years_experience": 6,
                "skills": ["Agile", "Product Strategy", "User Stories", "Analytics", "Stakeholder Management"],
            },
        ]

        for item in data:
            user = self.create_user(item["email"], item["full_name"], User.Role.CANDIDATE)

            profile, _ = CandidateProfile.objects.update_or_create(
                user=user,
                defaults={
                    "full_name": item["full_name"],
                    "email": item["email"],
                    "location": item["location"],
                    "headline": item["headline"],
                    "bio": item["bio"],
                    "education": item["education"],
                    "major": item["major"],
                    "years_experience": item["years_experience"],
                    "skills": item["skills"],
                },
            )

            candidates[item["email"]] = profile

        return candidates

    def create_jobs(self, employers):
        jobs = {}

        data = [
            {
                "employer": "hiring@northwind.io",
                "title": "Senior Full-Stack Engineer",
                "company": "Northwind Labs",
                "description": "Build analytics features across React, Django, and PostgreSQL.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["React", "TypeScript", "Django", "PostgreSQL", "Docker"],
                "min_years_experience": 4,
                "work_mode": JobPosting.WorkMode.HYBRID,
                "location": "Singapore",
                "salary_min": 9000,
                "salary_max": 13000,
            },
            {
                "employer": "hiring@northwind.io",
                "title": "Backend API Developer",
                "company": "Northwind Labs",
                "description": "Develop secure REST APIs and authentication workflows.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["Python", "Django", "REST API", "JWT", "PostgreSQL"],
                "min_years_experience": 3,
                "work_mode": JobPosting.WorkMode.REMOTE,
                "location": "Remote",
                "salary_min": 7500,
                "salary_max": 11000,
            },
            {
                "employer": "hiring@northwind.io",
                "title": "Cloud DevOps Engineer",
                "company": "Northwind Labs",
                "description": "Maintain cloud infrastructure and deployment pipelines.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
                "min_years_experience": 4,
                "work_mode": JobPosting.WorkMode.HYBRID,
                "location": "Sydney",
                "salary_min": 8500,
                "salary_max": 12500,
            },
            {
                "employer": "talent@brightpath.com",
                "title": "Frontend React Developer",
                "company": "BrightPath Digital",
                "description": "Create responsive dashboards and reusable UI components.",
                "required_education": JobPosting.Education.DIPLOMA,
                "required_skills": ["React", "TypeScript", "Tailwind CSS", "Vite"],
                "min_years_experience": 2,
                "work_mode": JobPosting.WorkMode.HYBRID,
                "location": "Sydney",
                "salary_min": 6500,
                "salary_max": 9500,
            },
            {
                "employer": "talent@brightpath.com",
                "title": "UX/UI Designer",
                "company": "BrightPath Digital",
                "description": "Design user flows, prototypes, and accessible interfaces.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["Figma", "User Research", "Wireframing", "Prototyping", "Accessibility"],
                "min_years_experience": 3,
                "work_mode": JobPosting.WorkMode.ON_SITE,
                "location": "Melbourne",
                "salary_min": 6000,
                "salary_max": 9000,
            },
            {
                "employer": "talent@brightpath.com",
                "title": "Junior Web Developer",
                "company": "BrightPath Digital",
                "description": "Support React pages, Node.js services, and SQLite-backed tools.",
                "required_education": JobPosting.Education.DIPLOMA,
                "required_skills": ["JavaScript", "React", "Node.js", "SQLite", "CSS"],
                "min_years_experience": 1,
                "work_mode": JobPosting.WorkMode.REMOTE,
                "location": "Remote",
                "salary_min": 4500,
                "salary_max": 6500,
            },
            {
                "employer": "talent@brightpath.com",
                "title": "Product Manager",
                "company": "BrightPath Digital",
                "description": "Lead roadmap planning and agile delivery for digital products.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["Agile", "Product Strategy", "User Stories", "Analytics"],
                "min_years_experience": 5,
                "work_mode": JobPosting.WorkMode.HYBRID,
                "location": "Adelaide",
                "salary_min": 8000,
                "salary_max": 12000,
            },
            {
                "employer": "recruitment@cloudnova.ai",
                "title": "Machine Learning Engineer",
                "company": "CloudNova AI",
                "description": "Build ML services for recommendations and NLP processing.",
                "required_education": JobPosting.Education.MASTER,
                "required_skills": ["Python", "Machine Learning", "NLP", "TensorFlow", "Pandas"],
                "min_years_experience": 3,
                "work_mode": JobPosting.WorkMode.REMOTE,
                "location": "Remote",
                "salary_min": 8500,
                "salary_max": 13000,
            },
            {
                "employer": "recruitment@cloudnova.ai",
                "title": "Data Analyst",
                "company": "CloudNova AI",
                "description": "Analyse product data and build dashboards for hiring insights.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["Python", "SQL", "Power BI", "Tableau"],
                "min_years_experience": 2,
                "work_mode": JobPosting.WorkMode.HYBRID,
                "location": "Singapore",
                "salary_min": 6000,
                "salary_max": 9000,
            },
            {
                "employer": "recruitment@cloudnova.ai",
                "title": "Cybersecurity Analyst",
                "company": "CloudNova AI",
                "description": "Review system risks and improve secure development practices.",
                "required_education": JobPosting.Education.BACHELOR,
                "required_skills": ["Security", "Python", "Linux", "Networking", "OWASP"],
                "min_years_experience": 2,
                "work_mode": JobPosting.WorkMode.ON_SITE,
                "location": "Canberra",
                "salary_min": 7000,
                "salary_max": 10000,
            },
        ]

        for item in data:
            employer_email = item.pop("employer")
            job, _ = JobPosting.objects.update_or_create(
                employer=employers[employer_email],
                title=item["title"],
                company=item["company"],
                defaults=item,
            )
            jobs[item["title"]] = job

        return jobs

    def create_applications(self, jobs, candidates):
        data = [
            ("Senior Full-Stack Engineer", "aarav.mehta@example.com"),
            ("Backend API Developer", "liam.tan@example.com"),
            ("Cloud DevOps Engineer", "daniel.park@example.com"),
            ("Frontend React Developer", "sophia.chen@example.com"),
            ("UX/UI Designer", "emily.wong@example.com"),
            ("Junior Web Developer", "noah.smith@example.com"),
            ("Machine Learning Engineer", "olivia.brown@example.com"),
            ("Data Analyst", "maya.kumar@example.com"),
            ("Cybersecurity Analyst", "ethan.nguyen@example.com"),
        ]

        for job_title, candidate_email in data:
            JobApplication.objects.get_or_create(
                job=jobs[job_title],
                candidate=candidates[candidate_email],
            )
