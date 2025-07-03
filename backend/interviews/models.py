from django.db import models
from django.conf import settings
import uuid
class Interview(models.Model):
    INTERVIEW_TYPES = [
        ('product_management', 'Product Management'),
        ('data_structures_algorithms', 'Data Structures & Algorithms'),
        ('system_design', 'System Design'),
        ('behavioral', 'Behavioral'),
        ('sql', 'SQL'),
        ('data_science_ml', 'Data Science & ML'),
        ('frontend', 'Frontend'),
    ]
    
    TIME_SLOTS = [
        ('morning', 'Morning (9:00 - 11:00 AM)'),
        ('afternoon', 'Afternoon (1:00 - 3:00 PM)'),
        ('evening', 'Evening (5:00 - 7:00 PM)'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('finished', 'Finished'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interviews')
    type = models.CharField(max_length=50, choices=INTERVIEW_TYPES)
    slot = models.CharField(max_length=20, choices=TIME_SLOTS)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        # Note: Unique constraint handled programmatically in views to allow
        # multiple finished interviews on same date/slot
    
    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()} - {self.date}"

    @property
    def matched(self):
        """Check if this interview has been matched"""
        return self.status == 'confirmed'
    
class Match(models.Model):
    room_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, null=False)

    interview_type = models.CharField(max_length=50, choices=Interview.INTERVIEW_TYPES)
    date = models.DateField()
    slot = models.CharField(max_length=20, choices=Interview.TIME_SLOTS)

    user1 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches_as_user2')

    status = models.CharField(max_length=20, choices=Interview.STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Feedback fields
    user1_feedback = models.JSONField(null=True, blank=True, help_text="Feedback from user1 about user2")
    user2_feedback = models.JSONField(null=True, blank=True, help_text="Feedback from user2 about user1")
    user1_feedback_submitted = models.BooleanField(default=False)
    user2_feedback_submitted = models.BooleanField(default=False)
    
    # Track which users have joined the room
    user1_joined = models.BooleanField(default=False)
    user2_joined = models.BooleanField(default=False)
    both_users_joined_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when both users joined")
    
    # Current question for the room (shared between both users)
    current_question = models.JSONField(null=True, blank=True, help_text="Current question being worked on in this room")
    current_interviewer = models.CharField(max_length=10, default='user1', help_text="Current interviewer (user1 or user2)")
    shared_code = models.TextField(blank=True, default='', help_text="Shared code between both users")
    code_language = models.CharField(max_length=20, default='javascript', help_text="Programming language for shared code")
    last_code_update = models.DateTimeField(null=True, blank=True, help_text="Last time code was updated")
    
    # Timer synchronization
    interview_start_time = models.DateTimeField(null=True, blank=True, help_text="When the interview timer started")
    current_round_start = models.DateTimeField(null=True, blank=True, help_text="When current round started")
    round_duration_minutes = models.IntegerField(default=60, help_text="Duration of each round in minutes")
    
    @property
    def is_completed(self):
        """Check if both users have submitted feedback"""
        return self.user1_feedback_submitted and self.user2_feedback_submitted
    
    @property
    def both_users_joined(self):
        """Check if both users have joined the room"""
        return self.user1_joined and self.user2_joined
    
    class Meta:
        unique_together = ('user1', 'user2', 'date', 'slot')

    def __str__(self):
        return f"{self.user1.username} vs {self.user2.username} | {self.interview_type} | {self.date} - {self.slot}"