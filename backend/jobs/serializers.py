from rest_framework import serializers

from candidates.serializers import CandidateProfileSerializer

from .models import JobApplication, JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    employer_id = serializers.CharField(source="employer.id", read_only=True)

    class Meta:
        model = JobPosting
        fields = (
            "id",
            "employer_id",
            "title",
            "company",
            "company_logo",
            "description",
            "required_education",
            "required_skills",
            "min_years_experience",
            "work_mode",
            "location",
            "salary_min",
            "salary_max",
            "posted_at",
        )

    def validate_required_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Required skills must be a list.")
        return [str(skill).strip() for skill in value if str(skill).strip()]


class JobApplicationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    job_id = serializers.CharField(source="job.id", read_only=True)
    candidate = CandidateProfileSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = ("id", "job_id", "candidate", "applied_at")
