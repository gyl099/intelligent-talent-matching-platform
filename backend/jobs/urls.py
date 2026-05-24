from django.urls import path

from .views import EmployerJobsView, JobDetailView, JobListCreateView, JobRecommendationsView

urlpatterns = [
    path("jobs/", JobListCreateView.as_view(), name="jobs"),
    path("jobs/<int:pk>/", JobDetailView.as_view(), name="job-detail"),
    path("jobs/<int:pk>/recommendations/", JobRecommendationsView.as_view(), name="job-recommendations"),
    path("employers/me/jobs/", EmployerJobsView.as_view(), name="employer-jobs"),
]
