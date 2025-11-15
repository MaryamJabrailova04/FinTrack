from django.db import migrations, models


DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Utilities",
    "Entertainment",
    "Health",
    "Education",
    "Rent",
    "Travel",
    "Other",
]


def seed_default_categories(apps, schema_editor):
    Category = apps.get_model('expenses', 'Category')
    for name in DEFAULT_CATEGORIES:
        Category.objects.get_or_create(user=None, name=name, defaults={"is_default": True})


def unseed_default_categories(apps, schema_editor):
    Category = apps.get_model('expenses', 'Category')
    Category.objects.filter(user__isnull=True, is_default=True, name__in=DEFAULT_CATEGORIES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='category',
            name='is_default',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(seed_default_categories, unseed_default_categories),
    ]


