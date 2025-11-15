from django.conf import settings
from django.db import models
from django.utils import timezone


class Streak(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak_days = models.PositiveIntegerField(default=0)
    best_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def touch(self, date=None):
        d = date or timezone.now().date()
        if self.last_activity_date is None:
            self.current_streak_days = 1
        else:
            delta = (d - self.last_activity_date).days
            if delta == 1:
                self.current_streak_days += 1
            elif delta > 1:
                self.current_streak_days = 1
        self.best_streak_days = max(self.best_streak_days, self.current_streak_days)
        self.last_activity_date = d
        self.save(update_fields=['current_streak_days', 'best_streak_days', 'last_activity_date'])

    def __str__(self) -> str:
        return f'{self.user.username} streak {self.current_streak_days}/{self.best_streak_days}'
