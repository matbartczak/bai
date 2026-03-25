from django.urls import path
from .views import UserInfoView,AllUsersView, UserRegistrationView, LoginView, LogoutView, CookieTokenRefreshView, Verify2FAView

urlpatterns = [
    path("user-info/", UserInfoView.as_view(), name="user-info"),
    path("all-users/", AllUsersView.as_view(), name="all-users"),
    path("register/", UserRegistrationView.as_view(), name="register-user"),
    path("login/", LoginView.as_view(), name="user-login"),
    path("logout/", LogoutView.as_view(), name="user-logout"),
    path("refresh/", CookieTokenRefreshView.as_view(), name="token-refresh"),
    path("verify/", Verify2FAView.as_view(), name="verify-code")
    
]