from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCandidate, IsEmployer
from matching.services import ranked_jobs_for_candidate

from .models import CandidateProfile
from .serializers import CandidateProfileSerializer


EDU_RANK = {"Diploma": 1, "Bachelor": 2, "Master": 3, "PhD": 4}


def clean_query_value(value):
    value = (value or "").strip()
    return "" if value.lower() in {"undefined", "null"} else value


class CandidateMeView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        profile = request.user.candidate_profile
        return Response(CandidateProfileSerializer(profile, context={"request": request}).data)

    def patch(self, request):
        profile = request.user.candidate_profile
        serializer = CandidateProfileSerializer(profile, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ResumeUploadView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        if not file.name.lower().endswith(".pdf"):
            return Response({"detail": "Please upload a PDF file."}, status=status.HTTP_400_BAD_REQUEST)

        profile = request.user.candidate_profile
        profile.resume = file
        profile.resume_filename = file.name
        profile.save(update_fields=["resume", "resume_filename"])
        resume_url = request.build_absolute_uri(profile.resume.url)
        return Response({"resume_url": resume_url, "resume_filename": profile.resume_filename})


class CandidateRecommendationsView(APIView):
    permission_classes = [IsAuthenticated, IsCandidate]

    def get(self, request):
        k = int(request.query_params.get("k", 10))
        matches = ranked_jobs_for_candidate(request.user.candidate_profile, limit=k)
        return Response(matches)


class CandidateSearchView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        candidates = CandidateProfile.objects.all().order_by("full_name")
        q = clean_query_value(request.query_params.get("q")).lower()
        skills = [s.strip().lower() for s in clean_query_value(request.query_params.get("skills")).split(",") if s.strip()]
        education = clean_query_value(request.query_params.get("education"))
        min_experience = clean_query_value(request.query_params.get("min_experience"))

        if q:
            candidates = [
                c for c in candidates
                if q in " ".join([
                    c.full_name,
                    c.headline,
                    c.bio,
                    c.major,
                    " ".join(c.skills),
                ]).lower()
            ]
        if skills:
            candidates = [
                c for c in candidates
                if all(skill in {candidate_skill.lower() for candidate_skill in c.skills} for skill in skills)
            ]
        if education:
            required_rank = EDU_RANK.get(education, 0)
            candidates = [c for c in candidates if EDU_RANK.get(c.education, 0) >= required_rank]
        if min_experience not in (None, ""):
            candidates = [c for c in candidates if c.years_experience >= int(min_experience)]

        serializer = CandidateProfileSerializer(candidates, many=True, context={"request": request})
        return Response(serializer.data)
