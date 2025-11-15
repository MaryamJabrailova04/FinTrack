from django.contrib import admin
from .models import Reward, UserReward


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name')
    search_fields = ('code', 'name')


@admin.register(UserReward)
class UserRewardAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'reward', 'awarded_at')
    list_filter = ('awarded_at',)
    search_fields = ('user__username', 'reward__code')
    autocomplete_fields = ('user', 'reward')

# Register your models here.
