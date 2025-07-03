from rest_framework import generics, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import VideoCategory, Video, VideoProgress, VideoLike, VideoComment
from .serializers import (
    VideoCategorySerializer, VideoSerializer, VideoProgressSerializer, VideoCommentSerializer
)

class VideoCategoryListView(generics.ListAPIView):
    queryset = VideoCategory.objects.all()
    serializer_class = VideoCategorySerializer

class VideoListView(generics.ListAPIView):
    serializer_class = VideoSerializer
    permission_classes = []  # Remove authentication requirement for testing
    
    def get_queryset(self):
        print("VideoListView.get_queryset() called")  # Debug log
        queryset = Video.objects.filter(is_active=True)
        print(f"Found {queryset.count()} active videos")  # Debug log
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        level = self.request.query_params.get('level', None)
        
        if category and category != 'all':
            queryset = queryset.filter(category__name__iexact=category)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(instructor__icontains=search)
            )
        
        if level:
            queryset = queryset.filter(level=level)
        
        return queryset

class VideoDetailView(generics.RetrieveAPIView):
    queryset = Video.objects.filter(is_active=True)
    serializer_class = VideoSerializer
    
    def retrieve(self, request, *args, **kwargs):
        video = self.get_object()
        video.increment_views()  # Increment view count
        return super().retrieve(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_video_like(request, video_id):
    try:
        video = Video.objects.get(id=video_id, is_active=True)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
    
    like, created = VideoLike.objects.get_or_create(user=request.user, video=video)
    
    if not created:
        like.delete()
        video.likes = max(0, video.likes - 1)
        video.save(update_fields=['likes'])
        return Response({'liked': False, 'likes_count': video.likes})
    else:
        video.likes += 1
        video.save(update_fields=['likes'])
        return Response({'liked': True, 'likes_count': video.likes})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_video_progress(request, video_id):
    try:
        video = Video.objects.get(id=video_id, is_active=True)
    except Video.DoesNotExist:
        return Response({'error': 'Video not found'}, status=status.HTTP_404_NOT_FOUND)
    
    watched_duration = request.data.get('watched_duration', 0)
    completed = request.data.get('completed', False)
    
    progress, created = VideoProgress.objects.get_or_create(
        user=request.user,
        video=video,
        defaults={'watched_duration': watched_duration, 'completed': completed}
    )
    
    if not created:
        progress.watched_duration = watched_duration
        progress.completed = completed
        progress.save()
    
    serializer = VideoProgressSerializer(progress)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_video_progress(request):
    progress = VideoProgress.objects.filter(user=request.user).select_related('video')
    data = []
    for p in progress:
        data.append({
            'video_id': p.video.id,
            'video_title': p.video.title,
            'watched_duration': p.watched_duration,
            'completed': p.completed,
            'last_watched': p.last_watched
        })
    return Response(data)

class VideoCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoCommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        video_id = self.kwargs['video_id']
        return VideoComment.objects.filter(video_id=video_id)
    
    def perform_create(self, serializer):
        video_id = self.kwargs['video_id']
        try:
            video = Video.objects.get(id=video_id, is_active=True)
            serializer.save(user=self.request.user, video=video)
        except Video.DoesNotExist:
            raise serializers.ValidationError({'error': 'Video not found'})

@api_view(['GET'])
def video_stats(request):
    total_videos = Video.objects.filter(is_active=True).count()
    total_categories = VideoCategory.objects.count()
    total_views = sum(Video.objects.filter(is_active=True).values_list('views', flat=True))
    
    return Response({
        'total_videos': total_videos,
        'total_categories': total_categories,
        'total_views': total_views
    })
