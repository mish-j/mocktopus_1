from django.urls import path
from .views import (
    VideoCategoryListView, VideoListView, VideoDetailView, VideoCommentListCreateView,
    toggle_video_like, update_video_progress, user_video_progress, video_stats
)

urlpatterns = [
    path('categories/', VideoCategoryListView.as_view(), name='video-categories'),
    path('videos/', VideoListView.as_view(), name='video-list'),
    path('videos/<int:pk>/', VideoDetailView.as_view(), name='video-detail'),
    path('videos/<int:video_id>/like/', toggle_video_like, name='toggle-video-like'),
    path('videos/<int:video_id>/progress/', update_video_progress, name='update-video-progress'),
    path('videos/<int:video_id>/comments/', VideoCommentListCreateView.as_view(), name='video-comments'),
    path('user-progress/', user_video_progress, name='user-video-progress'),
    path('stats/', video_stats, name='video-stats'),
]
