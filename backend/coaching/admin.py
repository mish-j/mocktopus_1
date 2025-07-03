from django.contrib import admin
from .models import VideoCategory, Video, VideoProgress, VideoLike, VideoComment

@admin.register(VideoCategory)
class VideoCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'created_at']
    search_fields = ['name']

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'instructor', 'level', 'views', 'likes', 'is_active', 'created_at']
    list_filter = ['category', 'level', 'is_active', 'created_at']
    search_fields = ['title', 'instructor', 'description']
    readonly_fields = ['views', 'likes', 'created_at', 'updated_at']

@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'watched_duration', 'completed', 'last_watched']
    list_filter = ['completed', 'last_watched']
    search_fields = ['user__username', 'video__title']

@admin.register(VideoLike)
class VideoLikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'video__title']

@admin.register(VideoComment)
class VideoCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'video', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'video__title', 'content']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content Preview'
