from django.db import migrations


REWARDS = [
    ("streak_7_days", "7 Day Strike", "Track your expenses for 7 consecutive days"),
    ("budget_master", "Master of Budgeting", "Stay within budget for an entire month"),
    ("savings_500", "Savings Champion", "Save $500 in a month"),
    ("category_expert", "Category Expert", "Add 10 different spending categories"),
    ("subs_master", "Subscription Master", "Track 5 active subscriptions"),
    ("monthly_warrior", "Monthly Warrior", "Complete 30 days of expense tracking"),
]


def seed_rewards(apps, schema_editor):
    Reward = apps.get_model("rewards", "Reward")
    for code, name, desc in REWARDS:
        Reward.objects.get_or_create(code=code, defaults={"name": name, "description": desc})


def unseed_rewards(apps, schema_editor):
    Reward = apps.get_model("rewards", "Reward")
    codes = [c for c, *_ in REWARDS]
    Reward.objects.filter(code__in=codes).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("rewards", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_rewards, reverse_code=unseed_rewards),
    ]


