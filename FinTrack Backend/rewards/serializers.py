from rest_framework import serializers
from .models import Reward, UserReward


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'code', 'name', 'description']


class UserRewardSerializer(serializers.ModelSerializer):
    reward = RewardSerializer(read_only=True)

    class Meta:
        model = UserReward
        fields = ['id', 'reward', 'awarded_at']


