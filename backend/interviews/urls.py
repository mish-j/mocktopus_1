# interviews/urls.py
from django.urls import path
from .views import InterviewListCreateView, InterviewDetailView, MatchListView, RetryMatchView, get_interview_room_details, submit_feedback, get_feedback, get_finished_interviews, room_question, room_code, switch_roles
from .views import can_join_match

urlpatterns = [
    path('', InterviewListCreateView.as_view(), name='interview-list-create'),
    path('<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),
    path('matches/', MatchListView.as_view(), name='match-list'),
    path('retry-match/', RetryMatchView.as_view(), name='retry-match'),
    path("can-join/<uuid:room_id>/", can_join_match, name="can-join"),
    path("interview-room/<uuid:room_id>/", get_interview_room_details, name="get_interview_room_details"),
    path("feedback/<uuid:room_id>/", submit_feedback, name="submit-feedback"),
    path("get-feedback/<uuid:room_id>/", get_feedback, name="get-feedback"),
    path("finished-interviews/", get_finished_interviews, name="get-finished-interviews"),
    path("room-question/<uuid:room_id>/", room_question, name="room-question"),
    path("room-code/<uuid:room_id>/", room_code, name="room-code"),
    path("switch-roles/<uuid:room_id>/", switch_roles, name="switch-roles"),
]