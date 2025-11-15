from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settingsapp', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersettings',
            name='savings_goal',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]


