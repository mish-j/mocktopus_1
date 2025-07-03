from django.db import models
from django.conf import settings

class VideoCategory(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, default='📺')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Video Categories"
    
    def __str__(self):
        return self.name

class Video(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail_url = models.URLField()
    video_url = models.URLField(blank=True, null=True)
    duration = models.CharField(max_length=10)  # Format: "15:30"
    category = models.ForeignKey(VideoCategory, on_delete=models.CASCADE, related_name='videos')
    instructor = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        self.views += 1
        self.save(update_fields=['views'])

class VideoProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    watched_duration = models.PositiveIntegerField(default=0)  # in seconds
    completed = models.BooleanField(default=False)
    last_watched = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'video')
    
    def __str__(self):
        return f"{self.user.username} - {self.video.title}"

class VideoLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'video')
    
    def __str__(self):
        return f"{self.user.username} liked {self.video.title}"

class VideoComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comment by {self.user.username} on {self.video.title}"
