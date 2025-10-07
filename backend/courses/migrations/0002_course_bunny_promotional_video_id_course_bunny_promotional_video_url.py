# Generated manually for Bunny CDN integration

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='bunny_promotional_video_id',
            field=models.CharField(blank=True, help_text='Bunny CDN video ID for promotional video', max_length=100, null=True, verbose_name='Bunny promotional video ID'),
        ),
        migrations.AddField(
            model_name='course',
            name='bunny_promotional_video_url',
            field=models.URLField(blank=True, help_text='Direct URL to the promotional video on Bunny CDN', null=True, verbose_name='Bunny promotional video URL'),
        ),
    ]
