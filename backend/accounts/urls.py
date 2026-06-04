from django.urls import path

from .views import LoginView, MembershipView, SignupView

urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("membership/", MembershipView.as_view(), name="membership"),
]
