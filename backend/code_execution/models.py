from django.db import models
from django.conf import settings
import uuid

class CodeExecution(models.Model):
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('python', 'Python'),
        ('java', 'Java'),
        ('cpp', 'C++'),
        ('csharp', 'C#'),
        ('typescript', 'TypeScript'),
        ('go', 'Go'),
        ('rust', 'Rust'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('error', 'Error'),
        ('timeout', 'Timeout'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room_id = models.CharField(max_length=100, null=True, blank=True)
    language = models.CharField(max_length=20, choices=LANGUAGE_CHOICES)
    code = models.TextField()
    input_data = models.TextField(blank=True, null=True)
    output = models.TextField(blank=True, null=True)
    error_output = models.TextField(blank=True, null=True)
    execution_time = models.FloatField(null=True, blank=True)  # in seconds
    memory_usage = models.IntegerField(null=True, blank=True)  # in KB
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.language} - {self.status}"
