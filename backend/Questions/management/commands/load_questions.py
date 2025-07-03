from django.core.management.base import BaseCommand
import csv
import os
from Questions.models import Category, Question

class Command(BaseCommand):
    help = 'Load questions from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('--csv', type=str, help='Path to CSV file', default='questions.csv')

    def handle(self, *args, **options):
        csv_file = options['csv']
        
        # If relative path, make it relative to manage.py location
        if not os.path.isabs(csv_file):
            csv_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), csv_file)
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                categories_created = 0
                questions_created = 0
                
                for row in reader:
                    category, created = Category.objects.get_or_create(
                        name=row['category']
                    )
                    if created:
                        categories_created += 1
                        self.stdout.write(f"Created category: {category.name}")
                    
                    question, created = Question.objects.get_or_create(
                        category=category,
                        question_text=row['question_text']
                    )
                    if created:
                        questions_created += 1
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully loaded {questions_created} questions and {categories_created} categories'
                    )
                )
                
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f'CSV file not found: {csv_file}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error loading CSV: {str(e)}')
            )