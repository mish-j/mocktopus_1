from django.core.management.base import BaseCommand
from coaching.models import VideoCategory, Video

class Command(BaseCommand):
    help = 'Create sample coaching data'

    def handle(self, *args, **options):
        # Create categories
        category, created = VideoCategory.objects.get_or_create(
            name='System Design',
            defaults={
                'icon': '🏗️',
                'description': 'Learn system design fundamentals'
            }
        )
        
        if created:
            self.stdout.write(f'Created category: {category.name}')
        
        # Create sample videos
        video, created = Video.objects.get_or_create(
            title='Introduction to System Design',
            defaults={
                'description': 'Learn the basics of system design',
                'thumbnail_url': 'https://via.placeholder.com/300x200',
                'video_url': 'https://www.youtube.com/watch?v=example',
                'duration': '15:30',
                'category': category,
                'instructor': 'John Doe',
                'level': 'beginner',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(f'Created video: {video.title}')
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
