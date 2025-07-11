# Generated by Django 5.2.1 on 2025-06-29 16:01

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='CodeExecution',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('room_id', models.CharField(blank=True, max_length=100, null=True)),
                ('language', models.CharField(choices=[('javascript', 'JavaScript'), ('python', 'Python'), ('java', 'Java'), ('cpp', 'C++'), ('csharp', 'C#'), ('typescript', 'TypeScript'), ('go', 'Go'), ('rust', 'Rust')], max_length=20)),
                ('code', models.TextField()),
                ('input_data', models.TextField(blank=True, null=True)),
                ('output', models.TextField(blank=True, null=True)),
                ('error_output', models.TextField(blank=True, null=True)),
                ('execution_time', models.FloatField(blank=True, null=True)),
                ('memory_usage', models.IntegerField(blank=True, null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('completed', 'Completed'), ('error', 'Error'), ('timeout', 'Timeout')], default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
