from rest_framework import serializers
from .models import VideoCategory, Video, VideoProgress, VideoLike, VideoComment

class VideoCategorySerializer(serializers.ModelSerializer):
    videos_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VideoCategory
        fields = ['id', 'name', 'icon', 'description', 'videos_count']
    
    def get_videos_count(self, obj):
        return obj.videos.filter(is_active=True).count()

class VideoSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    is_liked = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'thumbnail_url', 'video_url', 
            'duration', 'category', 'category_name', 'category_icon',
            'instructor', 'level', 'views', 'likes', 'is_liked', 
            'user_progress', 'created_at'
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return VideoLike.objects.filter(user=request.user, video=obj).exists()
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = VideoProgress.objects.get(user=request.user, video=obj)
                return {
                    'watched_duration': progress.watched_duration,
                    'completed': progress.completed,
                    'last_watched': progress.last_watched
                }
            except VideoProgress.DoesNotExist:
                return None
        return None

class VideoProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProgress
        fields = ['video', 'watched_duration', 'completed', 'last_watched']
        read_only_fields = ['last_watched']

class VideoCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = VideoComment
        fields = ['id', 'username', 'content', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
