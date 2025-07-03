# interviews/admin.py
from django.contrib import admin
from .models import Interview

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'slot', 'date', 'status', 'created_at']
    list_filter = ['type', 'slot', 'status', 'date']
    search_fields = ['user__username', 'user__email']
    list_editable = ['status']
    ordering = ['-created_at']
    