from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Check database schema for Match model'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(interviews_match)")
            columns = cursor.fetchall()
            
            self.stdout.write("Match table columns:")
            for column in columns:
                self.stdout.write(f"  {column[1]} - {column[2]}")
                
            # Check if feedback columns exist
            feedback_columns = ['user1_feedback', 'user2_feedback', 'user1_feedback_submitted', 'user2_feedback_submitted']
            existing_columns = [col[1] for col in columns]
            
            for col in feedback_columns:
                if col in existing_columns:
                    self.stdout.write(self.style.SUCCESS(f"✓ {col} exists"))
                else:
                    self.stdout.write(self.style.ERROR(f"✗ {col} missing"))
