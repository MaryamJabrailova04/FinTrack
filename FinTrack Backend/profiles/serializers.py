from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Streak

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Allow updating only these fields from the profile endpoint
        fields = ['first_name', 'monthly_goal']


class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = ['current_streak_days', 'best_streak_days', 'last_activity_date']


