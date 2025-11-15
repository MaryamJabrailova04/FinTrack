from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from expenses.models import Category, Expense
from subscriptions.models import Subscription
from rewards.models import Reward, UserReward
from settingsapp.models import UserSettings


class Command(BaseCommand):
    help = "Seed demo/mock data: user, categories, expenses, subscriptions, rewards"

    def add_arguments(self, parser):
        parser.add_argument("--username", default="demo", help="Demo username")
        parser.add_argument("--password", default="demo12345", help="Demo password")
        parser.add_argument("--email", default="demo@example.com", help="Demo email")
        parser.add_argument("--force", action="store_true", help="Recreate demo data")

    def handle(self, *args, **options):
        User = get_user_model()
        username: str = options["username"]
        password: str = options["password"]
        email: str = options["email"]
        force: bool = options["force"]

        user, created = User.objects.get_or_create(username=username, defaults={"email": email})
        if created:
            user.set_password(password)
            user.first_name = "Demo"
            user.monthly_goal = Decimal("1200.00")
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user '{username}' with password '{password}'"))
        else:
            if force:
                user.set_password(password)
                user.monthly_goal = Decimal("1200.00")
                user.save()
            self.stdout.write(self.style.WARNING(f"Using existing user '{username}'"))

        # Settings
        settings, _ = UserSettings.objects.get_or_create(user=user)
        settings.language = UserSettings.LANG_EN
        settings.theme = UserSettings.THEME_DARK
        settings.currency = UserSettings.CURR_USD
        settings.savings_goal = Decimal("800.00")
        settings.save()
        self.stdout.write(self.style.SUCCESS("Updated user settings"))

        # Categories
        cat_names: List[str] = ["groceries", "entertainment", "transport", "coffee"]
        name_to_cat = {}
        for n in cat_names:
            cat, _ = Category.objects.get_or_create(user=user, name=n)
            name_to_cat[n] = cat
        self.stdout.write(self.style.SUCCESS(f"Ensured categories: {', '.join(cat_names)}"))

        # Expenses (last few days)
        if force:
            Expense.objects.filter(user=user).delete()
        today = timezone.now()
        demo_expenses = [
            ("Market purchase", Decimal("64.25"), "groceries", today - timedelta(days=1)),
            ("Latte", Decimal("4.75"), "coffee", today - timedelta(days=1, hours=2)),
            ("Taxi ride", Decimal("12.40"), "transport", today - timedelta(days=2)),
            ("Movie night", Decimal("19.99"), "entertainment", today - timedelta(days=3)),
            ("Bakery & fruits", Decimal("28.30"), "groceries", today - timedelta(days=4)),
        ]
        for name, price, cat_key, when in demo_expenses:
            Expense.objects.get_or_create(
                user=user,
                name=name,
                price=price,
                category=name_to_cat.get(cat_key),
                time=when,
                defaults={"note": ""},
            )
        self.stdout.write(self.style.SUCCESS("Seeded expenses"))

        # Subscriptions (this month)
        if force:
            Subscription.objects.filter(user=user).delete()
        today_d = date.today()
        first = date(today_d.year, today_d.month, 1)
        subs = [
            ("Netflix", Decimal("15.99"), "entertainment", first, 17, False, True),
            ("Spotify", Decimal("9.99"), "entertainment", first, 24, False, True),
            ("YouTube Premium", Decimal("11.99"), "entertainment", first, 12, False, True),
        ]
        for name, price, cat_key, start, day, notify, active in subs:
            Subscription.objects.get_or_create(
                user=user,
                name=name,
                defaults={
                    "price": price,
                    "category": name_to_cat.get(cat_key),
                    "start_date": start,
                    "monthly_day": day,
                    "notify_email": notify,
                    "is_active": active,
                },
            )
        self.stdout.write(self.style.SUCCESS("Seeded subscriptions"))

        # Rewards base set (migration ensures these exist; ensure anyway)
        base_rewards = [
            ("streak_7_days", "7 Day Strike", "Track your expenses for 7 consecutive days"),
            ("budget_master", "Master of Budgeting", "Stay within budget for an entire month"),
            ("savings_500", "Savings Champion", "Save $500 in a month"),
            ("category_expert", "Category Expert", "Add 10 different spending categories"),
            ("subs_master", "Subscription Master", "Track 5 active subscriptions"),
            ("monthly_warrior", "Monthly Warrior", "Complete 30 days of expense tracking"),
        ]
        code_to_reward = {}
        for code, name, desc in base_rewards:
            r, _ = Reward.objects.get_or_create(code=code, defaults={"name": name, "description": desc})
            code_to_reward[code] = r
        self.stdout.write(self.style.SUCCESS("Ensured rewards catalog"))

        # Award a couple to demo user
        demo_awards = ["streak_7_days", "savings_500"]
        for code in demo_awards:
            r = code_to_reward.get(code)
            if r:
                UserReward.objects.get_or_create(user=user, reward=r)
        self.stdout.write(self.style.SUCCESS("Awarded demo rewards"))

        self.stdout.write(self.style.SUCCESS("Demo data ready. You can login with the demo credentials."))


