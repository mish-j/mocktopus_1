from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import IntegrityError, transaction, models
from .models import Interview, Match
from .serializers import InterviewSerializer, MatchSerializer
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated

class InterviewListCreateView(generics.ListCreateAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check for existing interviews on the same date/slot that are not finished or cancelled
        existing_interview = Interview.objects.filter(
            user=request.user,
            date=serializer.validated_data['date'],
            slot=serializer.validated_data['slot']
        ).exclude(status__in=['finished', 'cancelled']).first()
        
        if existing_interview:
            return Response(
                {'error': 'You already have an interview scheduled for this date and time slot.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_interview = serializer.save(user=request.user)
        except IntegrityError:
            return Response(
                {'error': 'You already have an interview scheduled for this date and time slot.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        compatible = Interview.objects.filter(
            type=new_interview.type,
            date=new_interview.date,
            slot=new_interview.slot,
            status='pending'
        ).exclude(user=request.user)

        if compatible.exists():
            match_with = compatible.first()
            new_interview.status = 'confirmed'
            match_with.status = 'confirmed'
            new_interview.save()
            match_with.save()

            Match.objects.create(
                interview_type=new_interview.type,
                date=new_interview.date,
                slot=new_interview.slot,
                user1=new_interview.user,
                user2=match_with.user,
                status='confirmed'
            )
        else:
            new_interview.status = 'pending'
            new_interview.save()

        return Response(self.get_serializer(new_interview).data, status=status.HTTP_201_CREATED)


class InterviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InterviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Interview.objects.filter(user=self.request.user)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        interview = self.get_object()

        if interview.status == 'confirmed':
            match = Match.objects.filter(
                models.Q(user1=interview.user, user2__isnull=False) |
                models.Q(user2=interview.user, user1__isnull=False),
                interview_type=interview.type,
                date=interview.date,
                slot=interview.slot,
                status='confirmed'
            ).first()

            if match:
                partner_user = match.user2 if match.user1 == interview.user else match.user1

                partner_interview = Interview.objects.filter(
                    user=partner_user,
                    type=interview.type,
                    date=interview.date,
                    slot=interview.slot,
                    status='confirmed'
                ).first()

                if partner_interview:
                    partner_interview.status = 'pending'
                    partner_interview.save()

                match.delete()

        interview.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


class MatchListView(generics.ListAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(models.Q(user1=user) | models.Q(user2=user))


class RetryMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        user = request.user

        pending_interviews = Interview.objects.filter(
            user=user,
            status='pending'
        )

        matched_count = 0
        for interview in pending_interviews:
            compatible = Interview.objects.filter(
                type=interview.type,
                date=interview.date,
                slot=interview.slot,
                status='pending'
            ).exclude(user=user)

            if compatible.exists():
                match_with = compatible.first()

                interview.status = 'confirmed'
                match_with.status = 'confirmed'
                interview.save()
                match_with.save()

                Match.objects.create(
                    interview_type=interview.type,
                    date=interview.date,
                    slot=interview.slot,
                    user1=interview.user,
                    user2=match_with.user,
                    status='confirmed'
                )
                matched_count += 1

        return Response({
            'message': f'Match retry completed. {matched_count} interviews matched.'
        }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def can_join_match(request, room_id):
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user

    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)

    slot_start_time = {
        'morning': 9,
        'afternoon': 13,
        'evening': 17,
    }.get(match.slot, 0)

    interview_datetime = datetime.combine(match.date, datetime.min.time()) + timedelta(hours=slot_start_time)
    time_diff = (interview_datetime - now()).total_seconds()

    can_join = -60 < time_diff <= 300

    return Response({
        "can_join": can_join,
        "room_id": str(match.room_id) if can_join else None,
        "starts_in_seconds": int(time_diff),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_interview_room_details(request, room_id):
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user

    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)

    # Track which user joined the room
    if user == match.user1:
        match.user1_joined = True
    elif user == match.user2:
        match.user2_joined = True
    
    # Only change status to 'finished' when BOTH users have joined
    if match.user1_joined and match.user2_joined:
        # Set timestamp when both users joined
        if not match.both_users_joined_at:
            match.both_users_joined_at = now()
            # Start the interview timer when both users join
            match.interview_start_time = now()
            match.current_round_start = now()
        
        # Update interview status to 'finished' only when both users have joined
        Interview.objects.filter(
            user__in=[match.user1, match.user2],
            type=match.interview_type,
            date=match.date,
            slot=match.slot,
            status='confirmed'
        ).update(status='finished')
    
    match.save()

    # Calculate time remaining
    time_remaining = None
    if match.current_round_start:
        elapsed_seconds = (now() - match.current_round_start).total_seconds()
        total_seconds = match.round_duration_minutes * 60
        time_remaining = max(0, int(total_seconds - elapsed_seconds))

    return Response({
        "room_id": str(match.room_id),
        "interview_type": match.interview_type,
        "date": match.date,
        "slot": match.slot,
        "partner_username": match.user2.username if user == match.user1 else match.user1.username,
        "both_users_joined": match.user1_joined and match.user2_joined,
        "partner_joined": match.user2_joined if user == match.user1 else match.user1_joined,
        "current_user_joined": True,  # Current user has joined since they made this request
        "user1_joined": match.user1_joined,
        "user2_joined": match.user2_joined,
        "interview_started": match.user1_joined and match.user2_joined,  # Interview can start when both joined
        "time_remaining": time_remaining,
        "current_interviewer": match.current_interviewer,
        "interview_start_time": match.interview_start_time.isoformat() if match.interview_start_time else None,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_feedback(request, room_id):
    """Submit feedback for a completed interview"""
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user
    
    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)
    
    feedback_data = request.data
    
    # Validate required fields
    required_fields = ['overall_rating', 'communication', 'technical_skills', 'problem_solving']
    for field in required_fields:
        if field not in feedback_data:
            return Response({'error': f'Missing required field: {field}'}, status=400)
    
    # Determine which user is submitting feedback
    if user == match.user1:
        if match.user1_feedback_submitted:
            return Response({'error': 'Feedback already submitted'}, status=400)
        match.user1_feedback = feedback_data
        match.user1_feedback_submitted = True
    else:
        if match.user2_feedback_submitted:
            return Response({'error': 'Feedback already submitted'}, status=400)
        match.user2_feedback = feedback_data
        match.user2_feedback_submitted = True
    
    match.save()
    
    # Update interview status to finished if both feedbacks are submitted
    if match.is_completed:
        # Update related interviews to finished
        Interview.objects.filter(
            user__in=[match.user1, match.user2],
            type=match.interview_type,
            date=match.date,
            slot=match.slot
        ).update(status='finished')
    
    return Response({
        'message': 'Feedback submitted successfully',
        'both_completed': match.is_completed
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_feedback(request, room_id):
    """Get feedback for a completed interview"""
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user
    
    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)
    
    # Return feedback about the current user (what others said about them)
    if user == match.user1:
        feedback_about_me = match.user2_feedback if match.user2_feedback_submitted else None
        my_feedback = match.user1_feedback if match.user1_feedback_submitted else None
    else:
        feedback_about_me = match.user1_feedback if match.user1_feedback_submitted else None
        my_feedback = match.user2_feedback if match.user2_feedback_submitted else None
    
    return Response({
        'feedback_about_me': feedback_about_me,
        'my_feedback': my_feedback,
        'partner_username': match.user2.username if user == match.user1 else match.user1.username,
        'interview_type': match.interview_type,
        'date': match.date,
        'both_completed': match.is_completed
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_finished_interviews(request):
    """Get all finished interviews for a user"""
    user = request.user
    
    # Get all finished interviews for the user
    finished_interviews = Interview.objects.filter(
        user=user,
        status='finished'
    ).order_by('-date', '-created_at')
    
    # Get the match details for each interview
    interview_data = []
    for interview in finished_interviews:
        try:
            # Find the match for this interview
            match = Match.objects.filter(
                models.Q(user1=user) | models.Q(user2=user),
                interview_type=interview.type,
                date=interview.date,
                slot=interview.slot
            ).first()
            
            if match:
                partner = match.user2 if match.user1 == user else match.user1
                interview_data.append({
                    'id': interview.id,
                    'type': interview.type,
                    'type_display': interview.get_type_display(),
                    'date': interview.date,
                    'slot': interview.slot,
                    'slot_display': interview.get_slot_display(),
                    'status': interview.status,
                    'created_at': interview.created_at,
                    'room_id': str(match.room_id),
                    'partner_username': partner.username,
                    'feedback_submitted': (
                        match.user1_feedback_submitted if user == match.user1 
                        else match.user2_feedback_submitted
                    ),
                    'partner_feedback_submitted': (
                        match.user2_feedback_submitted if user == match.user1 
                        else match.user1_feedback_submitted
                    ),
                    'both_feedback_completed': match.is_completed
                })
        except Exception as e:
            # If no match found, still include the interview
            interview_data.append({
                'id': interview.id,
                'type': interview.type,
                'type_display': interview.get_type_display(),
                'date': interview.date,
                'slot': interview.slot,
                'slot_display': interview.get_slot_display(),
                'status': interview.status,
                'created_at': interview.created_at,
                'room_id': None,
                'partner_username': 'Unknown',
                'feedback_submitted': False,
                'partner_feedback_submitted': False,
                'both_feedback_completed': False
            })
    
    return Response({
        'finished_interviews': interview_data,
        'total_count': len(interview_data)
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def room_question(request, room_id):
    """Get or set the current question for a room"""
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user
    
    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)
    
    if request.method == "GET":
        # Get current question for the room
        current_question = getattr(match, 'current_question', None)
        if current_question:
            return Response({'question': current_question})
        else:
            return Response({'question': None, 'message': 'No question set for this room'})
    
    elif request.method == "POST":
        # Set current question for the room
        question_data = request.data.get('question')
        if question_data:
            match.current_question = question_data
            match.save()
            return Response({'message': 'Question updated successfully', 'question': question_data})
        else:
            return Response({'error': 'No question data provided'}, status=400)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def room_code(request, room_id):
    """Get or set the current shared code for a room"""
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user
    
    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)
    
    if request.method == "GET":
        # Get current shared code for the room
        shared_code = getattr(match, 'shared_code', None) or ''
        code_language = getattr(match, 'code_language', 'javascript')
        return Response({
            'code': shared_code,
            'language': code_language,
            'last_updated': getattr(match, 'last_code_update', None)
        })
    
    elif request.method == "POST":
        # Set shared code for the room
        code_data = request.data.get('code', '')
        language_data = request.data.get('language', 'javascript')
        
        match.shared_code = code_data
        match.code_language = language_data
        match.last_code_update = now()
        match.save()
        
        return Response({
            'message': 'Code updated successfully',
            'code': code_data,
            'language': language_data
        })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def switch_roles(request, room_id):
    """Switch interviewer roles without resetting timer"""
    match = get_object_or_404(Match, room_id=room_id)
    user = request.user
    
    # Check if user is part of this match
    if user not in [match.user1, match.user2]:
        return Response({'error': 'Unauthorized'}, status=403)
    
    # Switch the current interviewer
    match.current_interviewer = 'user2' if match.current_interviewer == 'user1' else 'user1'
    
    # Important: Do NOT reset timer fields during role switch
    # Keep interview_start_time and current_round_start unchanged
    match.save()
    
    return Response({
        'message': 'Roles switched successfully',
        'current_interviewer': match.current_interviewer,
        'timer_continues': True  # Indicate timer wasn't reset
    })
