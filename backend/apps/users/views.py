from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomUserSerializer, RegisterUserSerializer, LoginUserSerializer
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken
from .utils import generate_and_send_2fa
from .models import User
from django.core.cache import cache
import secrets
from .permissions import IsAdminGroup

class UserInfoView(RetrieveUpdateAPIView):
    
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer
    
    def get_object(self):
        return self.request.user
    
class AllUsersView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdminGroup
    ]

class UserRegistrationView(CreateAPIView):

    authentication_classes = []
    permission_classes = []
    serializer_class = RegisterUserSerializer


class LoginView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data
            temp_token = secrets.token_urlsafe(32)

            generate_and_send_2fa(user)

            cache.set(
                f"temp_token_{temp_token}",
                user.pk,
                timeout=300
            )

            return Response({
                "message": "2FA code sent",
                "temp_token": temp_token
            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        
class LogoutView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        
        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception as e:
                return Response({"error":"Error invalidating token:" + str(e) }, status=status.HTTP_400_BAD_REQUEST)
        
        response = Response({"message": "Successfully logged out!"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        
        return response    

class CookieTokenRefreshView(TokenRefreshView):
    authentication_classes = []
    permission_classes = []
    def post(self, request):
        
        refresh_token = request.COOKIES.get("refresh_token")
        lax = 'Lax'
        print(lax)
        
        if not refresh_token:
            return Response({"error":"Refresh token not provided"}, status= status.HTTP_401_UNAUTHORIZED)
    
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({"message": "Access token token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(key="access_token", 
                                value=access_token,
                                httponly=True,
                                secure=False, 
                                samesite=lax)
            return response
        except InvalidToken:
            return Response({"error":"Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

class Verify2FAView(APIView):

    authentication_classes = []
    permission_classes = []

    def post(self, request):

        temp_token = request.data.get("temp_token")
        code = request.data.get("code")

        if not temp_token or not code:
            return Response(
                {"error": "Missing temp_token or code"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user_id from cache
        user_id = cache.get(f"temp_token_{temp_token}")

        if not user_id:
            return Response(
                {"error": "Invalid or expired temp token"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user object
        try:
            user = User.objects.get(id=user_id)

        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify 2FA code
        cached_code = cache.get(f"2fa_{user.pk}")

        if cached_code != code:
            return Response(
                {"error": "Invalid or expired code"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove used data
        cache.delete(f"2fa_{user.pk}")
        cache.delete(f"temp_token_{temp_token}")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response(
            {"user": CustomUserSerializer(user).data},
            status=status.HTTP_200_OK
        )

        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        response.set_cookie(
            "refresh_token",
            str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        return response