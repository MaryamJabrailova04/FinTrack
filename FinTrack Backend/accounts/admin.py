from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ('Profile', {'fields': ('monthly_goal',)}),
    )
    list_display = ('username', 'email', 'monthly_goal', 'is_staff')

# Register your models here.
