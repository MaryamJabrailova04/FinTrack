from django.conf import settings
from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='custom_categories'
    )

    class Meta:
        unique_together = (('user', 'name'),)
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self) -> str:
        owner = self.user_id or 'default'
        return f'{self.name} ({owner})'


class Expense(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expenses')
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey('expenses.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    time = models.DateTimeField(default=timezone.now)
    note = models.CharField(max_length=500, blank=True, default='')

    class Meta:
        ordering = ['-time', '-id']
        indexes = [
            models.Index(fields=['user', 'time']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self) -> str:
        return f'{self.name} - {self.price}'
