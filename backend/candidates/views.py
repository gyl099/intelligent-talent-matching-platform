from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsCandidate, IsEmployer
from matching.search import fuzzy_match
from matching.services import ranked_jobs_for_candidate

from .models import CandidateProfile
from .serializers import CandidateProfileSerializer


EDU_RANK = {"Diploma": 1, "Bachelor": 2, "Master": 3, "PhD": 4}

NON_MEMBER_LIMIT = 10


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
        # Members get unlimited recommendations; non-members capped at NON_MEMBER_LIMIT.
        if request.user.is_member:
            limit = None
        else:
            limit = int(request.query_params.get("k", NON_MEMBER_LIMIT))
            limit = min(limit, NON_MEMBER_LIMIT)
        matches = ranked_jobs_for_candidate(request.user.candidate_profile, limit=limit)
        return Response(matches)


class CandidateSearchView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        candidates = list(CandidateProfile.objects.all().order_by("full_name"))
        q = clean_query_value(request.query_params.get("q"))
        skills = [s.strip().lower() for s in clean_query_value(request.query_params.get("skills")).split(",") if s.strip()]
        education = clean_query_value(request.query_params.get("education"))
        min_experience = clean_query_value(request.query_params.get("min_experience"))
        location = clean_query_value(request.query_params.get("location")).lower()

        # Fuzzy keyword search across all profile text fields
        if q:
            candidates = [
                c for c in candidates
                if fuzzy_match(q, " ".join(filter(None, [
                    c.full_name,
                    c.headline,
                    c.bio,
                    c.major,
                    c.location,
                    " ".join(c.skills),
                ])))
            ]

        # Skills filter: all listed skills must be present (exact, case-insensitive)
        if skills:
            candidates = [
                c for c in candidates
                if all(skill in {s.lower() for s in c.skills} for skill in skills)
            ]

        # Education filter: candidate must meet or exceed the required level
        if education:
            required_rank = EDU_RANK.get(education, 0)
            candidates = [c for c in candidates if EDU_RANK.get(c.education, 0) >= required_rank]

        # Minimum experience filter
        if min_experience not in (None, ""):
            try:
                candidates = [c for c in candidates if c.years_experience >= int(min_experience)]
            except ValueError:
                pass

        # Location filter (substring match)
        if location:
            candidates = [c for c in candidates if location in (c.location or "").lower()]

        serializer = CandidateProfileSerializer(candidates, many=True, context={"request": request})
        return Response(serializer.data)
