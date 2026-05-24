from django.conf import settings
from django.db import models


class JobPosting(models.Model):
    class Education(models.TextChoices):
        DIPLOMA = "Diploma", "Diploma"
        BACHELOR = "Bachelor", "Bachelor"
        MASTER = "Master", "Master"
        PHD = "PhD", "PhD"

    class WorkMode(models.TextChoices):
        REMOTE = "Remote", "Remote"
        HYBRID = "Hybrid", "Hybrid"
        ON_SITE = "On-site", "On-site"

    employer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="job_postings")
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    company_logo = models.URLField(blank=True)
    description = models.TextField()
    required_education = models.CharField(max_length=20, choices=Education.choices)
    required_skills = models.JSONField(default=list)
    min_years_experience = models.PositiveIntegerField(default=0)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices)
    location = models.CharField(max_length=255)
    salary_min = models.PositiveIntegerField(blank=True, null=True)
    salary_max = models.PositiveIntegerField(blank=True, null=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} at {self.company}"
