from django.core.management.base import BaseCommand, CommandError
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta
from interviews.models import Interview, Match
from code_execution.models import CodeExecution
from Questions.models import Question, Category
from accounts.models import CustomUser

class Command(BaseCommand):
    help = 'Delete interview records from various models with different options'

    def add_arguments(self, parser):
        parser.add_argument(
            '--action',
            type=str,
            choices=['all', 'old', 'completed', 'user', 'date-range', 'match', 'orphaned', 'stats'],
            required=True,
            help='Action to perform'
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days for old data deletion (default: 30)'
        )
        parser.add_argument(
            '--username',
            type=str,
            help='Username for user-specific deletion'
        )
        parser.add_argument(
            '--start-date',
            type=str,
            help='Start date for range deletion (YYYY-MM-DD)'
        )
        parser.add_argument(
            '--end-date',
            type=str,
            help='End date for range deletion (YYYY-MM-DD)'
        )
        parser.add_argument(
            '--room-id',
            type=str,
            help='Room ID for specific match deletion'
        )
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm dangerous operations'
        )

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'stats':
            self.show_stats()
        elif action == 'all':
            self.delete_all_data(options['confirm'])
        elif action == 'old':
            self.delete_old_data(options['days'])
        elif action == 'completed':
            self.delete_completed_interviews()
        elif action == 'user':
            if not options['username']:
                raise CommandError('--username is required for user action')
            self.delete_user_data(options['username'])
        elif action == 'date-range':
            if not options['start_date'] or not options['end_date']:
                raise CommandError('--start-date and --end-date are required for date-range action')
            self.delete_date_range(options['start_date'], options['end_date'])
        elif action == 'match':
            if not options['room_id']:
                raise CommandError('--room-id is required for match action')
            self.delete_specific_match(options['room_id'])
        elif action == 'orphaned':
            self.cleanup_orphaned_executions()

    def show_stats(self):
        """Display interview data statistics"""
        self.stdout.write(self.style.HTTP_INFO("📊 Interview Data Statistics:"))
        self.stdout.write(f"Total Interviews: {Interview.objects.count()}")
        self.stdout.write(f"Total Matches: {Match.objects.count()}")
        self.stdout.write(f"Total Code Executions: {CodeExecution.objects.count()}")
        self.stdout.write(f"Total Questions: {Question.objects.count()}")
        self.stdout.write(f"Total Categories: {Category.objects.count()}")
        self.stdout.write(f"Total Users: {CustomUser.objects.count()}")
        
        self.stdout.write(self.style.HTTP_INFO("\n📈 Interview Status Breakdown:"))
        for status, label in Interview.STATUS_CHOICES:
            count = Interview.objects.filter(status=status).count()
            self.stdout.write(f"{label}: {count}")
        
        self.stdout.write(self.style.HTTP_INFO("\n📈 Match Status Breakdown:"))
        for status, label in Match.STATUS_CHOICES:
            count = Match.objects.filter(status=status).count()
            self.stdout.write(f"{label}: {count}")

    def delete_all_data(self, confirm):
        """Delete ALL interview data"""
        if not confirm:
            self.stdout.write(
                self.style.ERROR(
                    "🚨 WARNING: This will delete ALL interview data!\n"
                    "Use --confirm flag if you're sure"
                )
            )
            return
        
        self.stdout.write(self.style.WARNING("🚨 Deleting ALL interview data..."))
        
        # Count before deletion
        match_count = Match.objects.count()
        interview_count = Interview.objects.count()
        code_exec_count = CodeExecution.objects.count()
        
        # Delete in proper order (foreign key constraints)
        Match.objects.all().delete()
        Interview.objects.all().delete()
        CodeExecution.objects.all().delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Deleted {match_count} matches, {interview_count} interviews, "
                f"and {code_exec_count} code executions"
            )
        )

    def delete_old_data(self, days):
        """Delete data older than specified days"""
        cutoff_date = timezone.now() - timedelta(days=days)
        
        self.stdout.write(
            self.style.WARNING(
                f"🧹 Deleting interview data older than {days} days (before {cutoff_date.date()})"
            )
        )
        
        # Count and delete old data
        old_matches = Match.objects.filter(created_at__lt=cutoff_date)
        match_count = old_matches.count()
        old_matches.delete()
        
        old_interviews = Interview.objects.filter(created_at__lt=cutoff_date)
        interview_count = old_interviews.count()
        old_interviews.delete()
        
        old_code_exec = CodeExecution.objects.filter(created_at__lt=cutoff_date)
        code_exec_count = old_code_exec.count()
        old_code_exec.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Deleted {match_count} old matches, {interview_count} old interviews, "
                f"and {code_exec_count} old code executions"
            )
        )

    def delete_completed_interviews(self):
        """Delete only completed/finished interviews"""
        self.stdout.write(self.style.WARNING("🧹 Deleting completed interviews..."))
        
        completed_matches = Match.objects.filter(status__in=['completed', 'finished'])
        match_count = completed_matches.count()
        completed_matches.delete()
        
        completed_interviews = Interview.objects.filter(status__in=['completed', 'finished'])
        interview_count = completed_interviews.count()
        completed_interviews.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Deleted {match_count} completed matches and {interview_count} completed interviews"
            )
        )

    def delete_user_data(self, username):
        """Delete all interview data for a specific user"""
        try:
            user = CustomUser.objects.get(username=username)
            self.stdout.write(self.style.WARNING(f"🧹 Deleting interview data for user: {username}"))
            
            # Count and delete user data
            user_matches = Match.objects.filter(Q(user1=user) | Q(user2=user))
            match_count = user_matches.count()
            user_matches.delete()
            
            user_interviews = Interview.objects.filter(user=user)
            interview_count = user_interviews.count()
            user_interviews.delete()
            
            user_code_exec = CodeExecution.objects.filter(user=user)
            code_exec_count = user_code_exec.count()
            user_code_exec.delete()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Deleted {match_count} matches, {interview_count} interviews, "
                    f"and {code_exec_count} code executions for {username}"
                )
            )
            
        except CustomUser.DoesNotExist:
            raise CommandError(f"User '{username}' not found!")

    def delete_date_range(self, start_date_str, end_date_str):
        """Delete interview data within a specific date range"""
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            raise CommandError("Invalid date format. Use YYYY-MM-DD")
        
        self.stdout.write(
            self.style.WARNING(f"🧹 Deleting interview data between {start_date} and {end_date}")
        )
        
        matches = Match.objects.filter(date__range=[start_date, end_date])
        match_count = matches.count()
        matches.delete()
        
        interviews = Interview.objects.filter(date__range=[start_date, end_date])
        interview_count = interviews.count()
        interviews.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Deleted {match_count} matches and {interview_count} interviews "
                f"between {start_date} and {end_date}"
            )
        )

    def delete_specific_match(self, room_id):
        """Delete a specific match by room_id"""
        try:
            match = Match.objects.get(room_id=room_id)
            self.stdout.write(self.style.WARNING(f"🧹 Deleting match: {match}"))
            
            # Delete related code executions
            code_exec_count = CodeExecution.objects.filter(room_id=str(room_id)).count()
            CodeExecution.objects.filter(room_id=str(room_id)).delete()
            
            # Delete the match
            match.delete()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ Deleted match {room_id} and {code_exec_count} related code executions"
                )
            )
            
        except Match.DoesNotExist:
            raise CommandError(f"Match with room_id '{room_id}' not found!")

    def cleanup_orphaned_executions(self):
        """Delete code execution records that don't have associated rooms"""
        self.stdout.write(self.style.WARNING("🧹 Cleaning up orphaned code execution records..."))
        
        # Get all existing room_ids from matches
        existing_room_ids = set(str(room_id) for room_id in Match.objects.values_list('room_id', flat=True))
        
        # Find code executions with non-existent room_ids
        orphaned_executions = CodeExecution.objects.exclude(
            room_id__in=existing_room_ids
        ).exclude(room_id__isnull=True).exclude(room_id='')
        
        count = orphaned_executions.count()
        orphaned_executions.delete()
        
        self.stdout.write(self.style.SUCCESS(f"✅ Deleted {count} orphaned code execution records"))
