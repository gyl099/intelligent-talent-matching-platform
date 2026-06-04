from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCandidate, IsEmployer
from matching.search import fuzzy_match
from matching.services import ranked_candidates_for_job

from .models import JobApplication, JobPosting
from .serializers import JobApplicationSerializer, JobPostingSerializer

NON_MEMBER_LIMIT = 10
JOB_LIMIT_NON_MEMBER = 1
JOB_LIMIT_MEMBER = 3


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

        # --- Filters (DB-level where possible) ---
        work_mode = clean_query_value(request.query_params.get("work_mode"))
        location = clean_query_value(request.query_params.get("location")).lower()
        salary_min = clean_query_value(request.query_params.get("salary_min"))
        salary_max = clean_query_value(request.query_params.get("salary_max"))
        required_education = clean_query_value(request.query_params.get("required_education"))

        if work_mode:
            jobs = jobs.filter(work_mode=work_mode)
        if location:
            jobs = jobs.filter(location__icontains=location)
        if salary_min:
            try:
                jobs = jobs.filter(salary_max__gte=int(salary_min))
            except ValueError:
                pass
        if salary_max:
            try:
                jobs = jobs.filter(salary_min__lte=int(salary_max))
            except ValueError:
                pass
        if required_education:
            jobs = jobs.filter(required_education=required_education)

        # --- Fuzzy keyword search (in-Python after DB filters) ---
        q = clean_query_value(request.query_params.get("q"))
        if q:
            jobs = [
                job for job in jobs
                if fuzzy_match(q, " ".join(filter(None, [
                    job.title,
                    job.company,
                    job.description,
                    job.location,
                    " ".join(job.required_skills),
                ])))
            ]

        return Response(JobPostingSerializer(jobs, many=True).data)

    def post(self, request):
        job_limit = JOB_LIMIT_MEMBER if request.user.is_member else JOB_LIMIT_NON_MEMBER
        current_count = request.user.job_postings.count()
        if current_count >= job_limit:
            label = "member" if request.user.is_member else "non-member"
            return Response(
                {"detail": f"Job posting limit reached. {label.capitalize()} accounts may post up to {job_limit} job{'s' if job_limit > 1 else ''}."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = JobPostingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        job = serializer.save(employer=request.user)
        return Response(JobPostingSerializer(job).data)


class JobDetailView(APIView):
    def get_permissions(self):
        if self.request.method in ("PATCH", "DELETE"):
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

    def delete(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk, employer=request.user)
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmployerJobsView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        jobs = request.user.job_postings.all().order_by("-posted_at")
        return Response(JobPostingSerializer(jobs, many=True).data)


class JobRecommendationsView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, pk):
        job = get_object_or_404(JobPosting, pk=pk, employer=request.user)
        # Members get unlimited recommendations; non-members capped at NON_MEMBER_LIMIT.
        if request.user.is_member:
            limit = None
        else:
            limit = int(request.query_params.get("n", NON_MEMBER_LIMIT))
            limit = min(limit, NON_MEMBER_LIMIT)
        return Response(ranked_candidates_for_job(job, limit=limit))


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
