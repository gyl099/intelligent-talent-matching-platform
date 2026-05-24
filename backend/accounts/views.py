from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from candidates.models import CandidateProfile

from .models import User
from .serializers import LoginSerializer, SignupSerializer, UserSerializer


def token_for(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class SignupView(APIView):
    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if User.objects.filter(email=data["email"]).exists():
            return Response({"detail": "This email is already registered."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            full_name=data["full_name"],
            role=data["role"],
        )
        if user.role == User.Role.CANDIDATE:
            CandidateProfile.objects.create(
                user=user,
                full_name=user.full_name,
                email=user.email,
                education=CandidateProfile.Education.BACHELOR,
                years_experience=0,
                skills=[],
            )

        return Response({"token": token_for(user), "user": UserSerializer(user).data})


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = authenticate(request, username=data["email"], password=data["password"])
        if not user:
            return Response({"detail": "Credentials invalid. Please try again."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"token": token_for(user), "user": UserSerializer(user).data})
