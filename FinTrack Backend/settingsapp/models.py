from django.conf import settings
from django.db import models


class UserSettings(models.Model):
    LANG_EN = 'en'
    LANG_AZ = 'az'
    THEME_LIGHT = 'light'
    THEME_DARK = 'dark'
    CURR_USD = 'USD'
    CURR_AZN = 'AZN'

    LANGUAGE_CHOICES = [
        (LANG_EN, 'English'),
        (LANG_AZ, 'Azerbaijani'),
    ]
    THEME_CHOICES = [
        (THEME_LIGHT, 'Light'),
        (THEME_DARK, 'Dark'),
    ]
    CURRENCY_CHOICES = [
        (CURR_USD, 'US Dollar'),
        (CURR_AZN, 'Azerbaijani Manat'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='settings')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default=LANG_EN)
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default=THEME_LIGHT)
    currency = models.CharField(max_length=10, choices=CURRENCY_CHOICES, default=CURR_USD)
    email_notifications = models.BooleanField(default=True)
    timezone = models.CharField(max_length=64, default='UTC')
    # Monthly savings/spending goal stored in USD with 2 decimals
    savings_goal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self) -> str:
        return f'{self.user.username} settings'
