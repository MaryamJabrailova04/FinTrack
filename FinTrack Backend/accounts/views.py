from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer
from profiles.models import Streak
from settingsapp.models import UserSettings
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            User = get_user_model()
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('name', ''),
            )
            # Initialize user-specific records
            Streak.objects.get_or_create(user=user)
            UserSettings.objects.get_or_create(user=user)
            return Response({"detail": "Registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WhoAmIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh = request.data.get('refresh')
        if not refresh:
            return Response({"refresh": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_205_RESET_CONTENT)

from django.shortcuts import render

# Create your views here.


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Accepts Google ID token, verifies it, creates (or fetches) the user and returns JWT tokens.
        Body: { "id_token": "..." }
        """
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({"id_token": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        # Verify ID token
        try:
            from google.oauth2 import id_token as google_id_token
            from google.auth.transport import requests as google_requests
            request_adapter = google_requests.Request()
            # Verify signature and expiry first (no audience filter here)
            info = google_id_token.verify_oauth2_token(id_token, request_adapter)
            # info contains fields like: iss, sub, email, email_verified, name, picture, given_name, family_name
            if info.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
                return Response({"detail": "Invalid token issuer."}, status=status.HTTP_400_BAD_REQUEST)
            # Enforce audience (client_id) if configured
            allowed_client_ids = []
            cid_single = getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', '') or ''
            if cid_single:
                allowed_client_ids.append(cid_single)
            cid_multi = getattr(settings, 'GOOGLE_OAUTH_CLIENT_IDS', '') or ''
            if cid_multi:
                allowed_client_ids.extend([c.strip() for c in cid_multi.split(',') if c.strip()])
            aud = info.get('aud')
            if allowed_client_ids:
                if not aud or aud not in allowed_client_ids:
                    return Response({"detail": "Invalid audience for Google token."}, status=status.HTTP_400_BAD_REQUEST)
            else:
                # If no client id configured and not in DEBUG, reject to avoid accepting any audience in production
                if not getattr(settings, 'DEBUG', False):
                    return Response({"detail": "Server not configured with GOOGLE_OAUTH_CLIENT_ID."}, status=status.HTTP_400_BAD_REQUEST)
            email: Optional[str] = info.get('email')
            sub: str = info.get('sub')
            name: str = info.get('name') or ''
            if not email:
                # Use sub as a fallback-derived username if email not present (rare)
                email = f'{sub}@users.google.local'
        except Exception as e:
            logger.exception('Failed to verify Google ID token')
            return Response({"detail": "Invalid Google token."}, status=status.HTTP_400_BAD_REQUEST)

        User = get_user_model()
        user = User.objects.filter(email=email).first()
        if not user:
            # Create a username from email
            username = email.split('@')[0]
            base_username = username
            i = 1
            while User.objects.filter(username=username).exists():
                username = f'{base_username}{i}'
                i += 1
            user = User.objects.create_user(
                username=username,
                email=email,
                password=None,
                first_name=name,
            )
            # Initialize related records
            Streak.objects.get_or_create(user=user)
            UserSettings.objects.get_or_create(user=user)

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
            }
        })
