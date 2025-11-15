from django.conf import settings
from django.db import models


class Reward(models.Model):
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    description = models.CharField(max_length=500, blank=True, default='')

    def __str__(self) -> str:
        return self.name


class UserReward(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_rewards')
    reward = models.ForeignKey('rewards.Reward', on_delete=models.CASCADE, related_name='awards')
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('user', 'reward'),)
        ordering = ['-awarded_at']

    def __str__(self) -> str:
        return f'{self.user.username} - {self.reward.code}'
