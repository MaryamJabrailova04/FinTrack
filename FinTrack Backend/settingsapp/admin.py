from django.contrib import admin
from .models import UserSettings


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'language', 'theme', 'currency', 'email_notifications', 'timezone')
    list_filter = ('language', 'theme', 'currency', 'email_notifications')
    search_fields = ('user__username',)
    autocomplete_fields = ('user',)

# Register your models here.
