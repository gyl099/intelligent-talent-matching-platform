from django.conf import settings
from django.db import models


class CandidateProfile(models.Model):
    class Education(models.TextChoices):
        DIPLOMA = "Diploma", "Diploma"
        BACHELOR = "Bachelor", "Bachelor"
        MASTER = "Master", "Master"
        PHD = "PhD", "PhD"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="candidate_profile")
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    headline = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    education = models.CharField(max_length=20, choices=Education.choices, default=Education.BACHELOR)
    major = models.CharField(max_length=255, blank=True)
    years_experience = models.PositiveIntegerField(default=0)
    skills = models.JSONField(default=list, blank=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    resume_filename = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.full_name
