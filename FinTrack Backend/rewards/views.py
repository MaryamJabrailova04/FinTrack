from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Reward, UserReward
from .serializers import RewardSerializer, UserRewardSerializer


class RewardsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rewards = Reward.objects.all().order_by('name')
        user_rewards = UserReward.objects.filter(user=request.user).select_related('reward')
        return Response({
            "rewards": RewardSerializer(rewards, many=True).data,
            "earned": UserRewardSerializer(user_rewards, many=True).data
        })

from django.shortcuts import render

# Create your views here.
