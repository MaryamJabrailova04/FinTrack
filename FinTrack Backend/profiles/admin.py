from django.contrib import admin
from .models import Streak


@admin.register(Streak)
class StreakAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'current_streak_days', 'best_streak_days', 'last_activity_date')
    search_fields = ('user__username',)
    autocomplete_fields = ('user',)

# Register your models here.
