from rest_framework import serializers

from .models import JobPosting


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
