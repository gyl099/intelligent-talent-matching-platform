from django.contrib import admin

from .models import JobApplication, JobPosting


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ("title", "company", "work_mode", "location", "posted_at")
    search_fields = ("title", "company", "description", "location")
    list_filter = ("work_mode", "required_education")


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("candidate", "job", "applied_at")
    search_fields = ("candidate__full_name", "candidate__email", "job__title", "job__company")
    list_filter = ("applied_at",)
