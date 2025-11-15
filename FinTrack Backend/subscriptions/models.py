from django.conf import settings
from django.db import models


class Subscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.ForeignKey('expenses.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='subscriptions')
    start_date = models.DateField()
    monthly_day = models.PositiveSmallIntegerField(help_text='Day of month for renewal (1-31)')
    notify_email = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'monthly_day']),
        ]

    def __str__(self) -> str:
        return f'{self.name} - {self.price}'
