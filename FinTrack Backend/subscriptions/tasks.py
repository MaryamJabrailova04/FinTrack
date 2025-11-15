from datetime import date, datetime
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from celery import shared_task
from .models import Subscription


def _compute_next_due(sub: Subscription, today: date) -> date | None:
    if not sub.is_active:
        return None
    # choose the next occurrence of monthly_day
    year, month = today.year, today.month
    target_day = min(sub.monthly_day, 28) if month == 2 else sub.monthly_day
    try:
        candidate = date(year, month, target_day)
    except ValueError:
        # Fallback in case of invalid day for month
        candidate = date(year, month, 28)
    if candidate < today:
        # move to next month
        if month == 12:
            year += 1
            month = 1
        else:
            month += 1
        target_day = min(sub.monthly_day, 28) if month == 2 else sub.monthly_day
        try:
            candidate = date(year, month, target_day)
        except ValueError:
            candidate = date(year, month, 28)
    if candidate < sub.start_date:
        return sub.start_date
    return candidate


@shared_task
def send_upcoming_subscription_alerts():
    today = timezone.localdate()
    qs = Subscription.objects.filter(is_active=True, notify_email=True)
    for sub in qs.select_related('user'):
        next_due = _compute_next_due(sub, today)
        if not next_due:
            continue
        days = (next_due - today).days
        if days in (1, 2):
            subject = f"Upcoming subscription: {sub.name} in {days} day(s)"
            body = (
                f"Hello {sub.user.first_name or sub.user.username},\n\n"
                f"This is a reminder that your subscription '{sub.name}' "
                f"renews on {next_due.isoformat()} for {sub.price}.\n\n"
                f"If this subscription is no longer active, you can disable alerts in Settings or edit the subscription."
            )
            try:
                send_mail(
                    subject=subject,
                    message=body,
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                    recipient_list=[sub.user.email],
                    fail_silently=True,
                )
            except Exception:
                # fail silently to avoid stopping the loop
                pass


