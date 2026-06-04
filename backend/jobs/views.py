from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCandidate, IsEmployer
from matching.services import ranked_candidates_for_job

from .models import JobApplication, JobPosting
from .serializers import JobApplicationSerializer, JobPostingSerializer


def clean_query_value(value):
    value = (value or "").strip()
    return "" if value.lower() in {"undefined", "null"} else value


class JobListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsEmployer()]
        return []

    def get(self, request):
        jobs = JobPosting.objects.all().order_by("-posted_at")
        q = clean_query_value(request.query_params.get("q")).lower()
        work_mode = clean_query_value(request.query_params.get("work_mode"))
        location = clean_query_value(request.query_params.get("location")).lower()

        if work_mode:
            jobs = jobs.filter(work_mode=work_mode)
        if location:
            jobs = jobs.filter(location__icontains=location)
        if q:
            jobs = [
                job for job in jobs
                if q in " ".join([
                    job.title,
                    job.company,
                    job.description,
                    " ".join(job.required_skills),
                ]).lower()
            ]

        return Response(JobPostingSerializer(jobs, many=True).data)

    def post(self, request):
        serializer = JobPostingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save(employer=request.user)
        return Response(JobPostingSerializer(job).data)


class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method == "PATCH":
            return [IsAuthenticated(), IsEmployer()]
        return []

    def get(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk)
        return Response(JobPostingSerializer(job).data)

    def patch(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk, employer=request.user)
        serializer = JobPostingSerializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class EmployerJobsView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        jobs = request.user.job_postings.all().order_by("-posted_at")
        return Response(JobPostingSerializer(jobs, many=True).data)


class JobRecommendationsView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk, employer=request.user)
        n = int(request.query_params.get("n", 10))
        return Response(ranked_candidates_for_job(job, limit=n))


class JobApplyView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def post(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk)
        application, _ = JobApplication.objects.get_or_create(
            job=job,
            candidate=request.user.candidate_profile,
        )
        return Response(JobApplicationSerializer(application, context={"request": request}).data)


class JobApplicationsView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk, employer=request.user)
        applications = job.applications.select_related("candidate", "candidate__user")
        serializer = JobApplicationSerializer(applications, many=True, context={"request": request})
        return Response(serializer.data)
