from rest_framework import serializers

from .models import CandidateProfile


class CandidateProfileSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(source="user.id", read_only=True)
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = CandidateProfile
        fields = (
            "id",
            "user_id",
            "full_name",
            "email",
            "phone",
            "location",
            "headline",
            "bio",
            "education",
            "major",
            "years_experience",
            "skills",
            "resume_url",
            "resume_filename",
        )

    def get_resume_url(self, obj):
        request = self.context.get("request")
        if not obj.resume:
            return ""
        url = obj.resume.url
        return request.build_absolute_uri(url) if request else url

    def validate_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list.")
        return [str(skill).strip() for skill in value if str(skill).strip()]
