from django.contrib import admin

from .models import CandidateProfile


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "education", "years_experience", "location")
    search_fields = ("full_name", "email", "headline", "bio", "major")
    list_filter = ("education",)
