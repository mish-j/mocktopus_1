from rest_framework import serializers
from .models import Interview, Match
from django.db import models

class InterviewSerializer(serializers.ModelSerializer):
    matched = serializers.ReadOnlyField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    slot_display = serializers.CharField(source='get_slot_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    room_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id', 
            'type', 
            'slot', 
            'date', 
            'status', 
            'matched', 
            'created_at',
            'user_username',
            'type_display',
            'slot_display',
            'status_display',
            'room_id'  # Add this field
        ]
        read_only_fields = ['status', 'matched', 'room_id']
    
    def get_room_id(self, obj):
        """Get the room_id from the associated match if the interview is matched"""
        if obj.status in ['confirmed', 'finished']:
            try:
                match = Match.objects.filter(
                    models.Q(user1=obj.user) | models.Q(user2=obj.user),
                    interview_type=obj.type,
                    date=obj.date,
                    slot=obj.slot
                ).first()
                
                if match:
                    return str(match.room_id)
            except Match.DoesNotExist:
                pass
        return None
    
    def create(self, validated_data):
        # Set user from request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class MatchSerializer(serializers.ModelSerializer):
    partner = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'room_id', 'interview_type', 'date', 'slot', 'status', 'partner']

    def get_partner(self, obj):
        request_user = self.context['request'].user
        return obj.user2.username if obj.user1 == request_user else obj.user1.username