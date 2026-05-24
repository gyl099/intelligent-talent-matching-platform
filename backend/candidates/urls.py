from django.urls import path

from .views import CandidateMeView, CandidateRecommendationsView, CandidateSearchView, ResumeUploadView

urlpatterns = [
    path("candidates/me/", CandidateMeView.as_view(), name="candidate-me"),
    path("candidates/me/resume/", ResumeUploadView.as_view(), name="candidate-resume"),
    path("candidates/me/recommendations/", CandidateRecommendationsView.as_view(), name="candidate-recommendations"),
    path("candidates/search/", CandidateSearchView.as_view(), name="candidate-search"),
]
