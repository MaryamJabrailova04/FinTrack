from django.contrib import admin
from .models import Category, Expense


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'is_default', 'user')
    list_filter = ('is_default',)
    search_fields = ('name',)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'price', 'category', 'time')
    list_filter = ('category', 'time')
    search_fields = ('name', 'note')
    autocomplete_fields = ('user', 'category')

# Register your models here.
