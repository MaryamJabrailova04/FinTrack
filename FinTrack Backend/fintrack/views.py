from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class MainPageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "message": "Finance Tracker API",
            "endpoints": {
                "auth_token": "/api/auth/token/",
                "auth_token_refresh": "/api/auth/token/refresh/",
                "expenses": "/api/expenses/",
                "subscriptions": "/api/subscriptions/",
                "profile": "/api/profile/",
                "settings": "/api/settings/",
                "rewards": "/api/rewards/",
                "history": "/api/history/",
                "accounts": "/api/accounts/",
            }
        })


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok"})
