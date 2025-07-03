#!/usr/bin/env python
"""
Django management script to delete interview records from all related models.
Run this script from the Django shell or as a management command.

Usage:
1. Django shell: python manage.py shell < delete_interview_records.py
2. Or copy-paste the functions into Django shell and call them individually
"""

from interviews.models import Interview, Match
from code_execution.models import CodeExecution
from Questions.models import Question, Category
from accounts.models import CustomUser
from django.utils import timezone
from datetime import datetime, timedelta

def delete_all_interview_data():
    """
    Delete ALL interview-related data. Use with extreme caution!
    """
    print("🚨 WARNING: This will delete ALL interview data!")
    print("Are you sure? Type 'DELETE_ALL' to confirm:")
    # Note: In shell, you'll need to input this manually
    
    # Delete Match records first (has foreign keys to Interview)
    match_count = Match.objects.count()
    Match.objects.all().delete()
    print(f"✅ Deleted {match_count} Match records")
    
    # Delete Interview records
    interview_count = Interview.objects.count()
    Interview.objects.all().delete()
    print(f"✅ Deleted {interview_count} Interview records")
    
    # Delete CodeExecution records
    code_exec_count = CodeExecution.objects.count()
    CodeExecution.objects.all().delete()
    print(f"✅ Deleted {code_exec_count} CodeExecution records")
    
    print("🎉 All interview data deleted successfully!")

def delete_old_interview_data(days_old=30):
    """
    Delete interview data older than specified days
    """
    cutoff_date = timezone.now() - timedelta(days=days_old)
    
    print(f"🧹 Deleting interview data older than {days_old} days (before {cutoff_date.date()})")
    
    # Delete old Matches
    old_matches = Match.objects.filter(created_at__lt=cutoff_date)
    match_count = old_matches.count()
    old_matches.delete()
    print(f"✅ Deleted {match_count} old Match records")
    
    # Delete old Interviews
    old_interviews = Interview.objects.filter(created_at__lt=cutoff_date)
    interview_count = old_interviews.count()
    old_interviews.delete()
    print(f"✅ Deleted {interview_count} old Interview records")
    
    # Delete old CodeExecution records
    old_code_exec = CodeExecution.objects.filter(created_at__lt=cutoff_date)
    code_exec_count = old_code_exec.count()
    old_code_exec.delete()
    print(f"✅ Deleted {code_exec_count} old CodeExecution records")

def delete_completed_interviews():
    """
    Delete only completed/finished interviews
    """
    print("🧹 Deleting completed interviews...")
    
    # Delete completed matches
    completed_matches = Match.objects.filter(status__in=['completed', 'finished'])
    match_count = completed_matches.count()
    completed_matches.delete()
    print(f"✅ Deleted {match_count} completed Match records")
    
    # Delete completed interviews
    completed_interviews = Interview.objects.filter(status__in=['completed', 'finished'])
    interview_count = completed_interviews.count()
    completed_interviews.delete()
    print(f"✅ Deleted {interview_count} completed Interview records")

def delete_user_interview_data(username):
    """
    Delete all interview data for a specific user
    """
    try:
        user = CustomUser.objects.get(username=username)
        print(f"🧹 Deleting interview data for user: {username}")
        
        # Delete matches where user participated
        user_matches = Match.objects.filter(Q(user1=user) | Q(user2=user))
        match_count = user_matches.count()
        user_matches.delete()
        print(f"✅ Deleted {match_count} Match records for {username}")
        
        # Delete user's interviews
        user_interviews = Interview.objects.filter(user=user)
        interview_count = user_interviews.count()
        user_interviews.delete()
        print(f"✅ Deleted {interview_count} Interview records for {username}")
        
        # Delete user's code executions
        user_code_exec = CodeExecution.objects.filter(user=user)
        code_exec_count = user_code_exec.count()
        user_code_exec.delete()
        print(f"✅ Deleted {code_exec_count} CodeExecution records for {username}")
        
    except CustomUser.DoesNotExist:
        print(f"❌ User '{username}' not found!")

def delete_by_date_range(start_date, end_date):
    """
    Delete interview data within a specific date range
    """
    print(f"🧹 Deleting interview data between {start_date} and {end_date}")
    
    # Delete matches in date range
    matches = Match.objects.filter(date__range=[start_date, end_date])
    match_count = matches.count()
    matches.delete()
    print(f"✅ Deleted {match_count} Match records")
    
    # Delete interviews in date range
    interviews = Interview.objects.filter(date__range=[start_date, end_date])
    interview_count = interviews.count()
    interviews.delete()
    print(f"✅ Deleted {interview_count} Interview records")

def delete_specific_match(room_id):
    """
    Delete a specific match by room_id
    """
    try:
        match = Match.objects.get(room_id=room_id)
        print(f"🧹 Deleting match: {match}")
        
        # Delete related code executions
        CodeExecution.objects.filter(room_id=str(room_id)).delete()
        
        # Delete the match
        match.delete()
        print(f"✅ Deleted match {room_id} and related data")
        
    except Match.DoesNotExist:
        print(f"❌ Match with room_id '{room_id}' not found!")

def cleanup_orphaned_code_executions():
    """
    Delete code execution records that don't have associated rooms
    """
    print("🧹 Cleaning up orphaned code execution records...")
    
    # Get all existing room_ids from matches
    existing_room_ids = set(Match.objects.values_list('room_id', flat=True))
    
    # Find code executions with non-existent room_ids
    orphaned_executions = CodeExecution.objects.exclude(room_id__in=existing_room_ids).exclude(room_id__isnull=True)
    count = orphaned_executions.count()
    orphaned_executions.delete()
    
    print(f"✅ Deleted {count} orphaned CodeExecution records")

def get_interview_stats():
    """
    Get statistics about interview data
    """
    print("📊 Interview Data Statistics:")
    print(f"Total Interviews: {Interview.objects.count()}")
    print(f"Total Matches: {Match.objects.count()}")
    print(f"Total Code Executions: {CodeExecution.objects.count()}")
    print(f"Total Questions: {Question.objects.count()}")
    print(f"Total Categories: {Category.objects.count()}")
    print(f"Total Users: {CustomUser.objects.count()}")
    print()
    print("📈 Interview Status Breakdown:")
    for status, label in Interview.STATUS_CHOICES:
        count = Interview.objects.filter(status=status).count()
        print(f"{label}: {count}")
    print()
    print("📈 Match Status Breakdown:")
    for status, label in Match.STATUS_CHOICES:
        count = Match.objects.filter(status=status).count()
        print(f"{label}: {count}")

# Example usage - uncomment the function you want to run:
if __name__ == "__main__":
    # Show current stats
    get_interview_stats()
    
    # Uncomment ONE of the following based on what you want to delete:
    
    # Delete all interview data (DANGEROUS!)
    # delete_all_interview_data()
    
    # Delete old data (30 days)
    # delete_old_interview_data(30)
    
    # Delete completed interviews only
    # delete_completed_interviews()
    
    # Delete data for specific user
    # delete_user_interview_data('username_here')
    
    # Delete data in date range
    # from datetime import date
    # delete_by_date_range(date(2024, 1, 1), date(2024, 1, 31))
    
    # Delete specific match
    # delete_specific_match('room-id-uuid-here')
    
    # Cleanup orphaned records
    # cleanup_orphaned_code_executions()
