from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Streak
from .serializers import ProfileSerializer, StreakSerializer


class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = ProfileSerializer(request.user).data
        streak, _ = Streak.objects.get_or_create(user=request.user)
        data['streak'] = StreakSerializer(streak).data
        return Response(data)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial):
        serializer = ProfileSerializer(request.user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.shortcuts import render

# Create your views here.
