from django.contrib import admin

from .models import JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "work_mode", "location", "posted_at")
    search_fields = ("title", "company", "description", "location")
    list_filter = ("work_mode", "required_education")
