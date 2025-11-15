from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'price', 'category', 'start_date', 'monthly_day', 'notify_email', 'is_active')
    list_filter = ('is_active', 'notify_email', 'monthly_day')
    search_fields = ('name',)
    autocomplete_fields = ('user', 'category')

# Register your models here.
