from django.core.management.base import BaseCommand

from accounts.models import User
from candidates.models import CandidateProfile
from jobs.models import JobPosting


class Command(BaseCommand):
    help = "Create demo employers, candidates, and jobs for local testing."

    def handle(self, *args, **options):
        employer, _ = User.objects.get_or_create(
            email="hiring@northwind.io",
            defaults={
                "full_name": "Northwind Labs",
                "role": User.Role.EMPLOYER,
                "username": "hiring@northwind.io",
            },
        )
        employer.set_password("password123")
        employer.save()

        candidate_user, _ = User.objects.get_or_create(
            email="aarav.mehta@example.com",
            defaults={
                "full_name": "Aarav Mehta",
                "role": User.Role.CANDIDATE,
                "username": "aarav.mehta@example.com",
            },
        )
        candidate_user.set_password("password123")
        candidate_user.save()

        CandidateProfile.objects.update_or_create(
            user=candidate_user,
            defaults={
                "full_name": "Aarav Mehta",
                "email": "aarav.mehta@example.com",
                "location": "Singapore",
                "headline": "Senior Full-Stack Engineer",
                "bio": "Six years building React and Django products.",
                "education": "Master",
                "major": "Computer Science",
                "years_experience": 6,
                "skills": ["React", "TypeScript", "Django", "PostgreSQL", "Docker", "Redis"],
            },
        )

        JobPosting.objects.update_or_create(
            employer=employer,
            title="Senior Full-Stack Engineer",
            company="Northwind Labs",
            defaults={
                "description": "Build analytics features across React, Django, and PostgreSQL.",
                "required_education": "Bachelor",
                "required_skills": ["React", "TypeScript", "Django", "PostgreSQL", "Docker"],
                "min_years_experience": 4,
                "work_mode": "Hybrid",
                "location": "Singapore",
                "salary_min": 9000,
                "salary_max": 13000,
            },
        )

        self.stdout.write(self.style.SUCCESS("Demo data ready. Password for demo users: password123"))
