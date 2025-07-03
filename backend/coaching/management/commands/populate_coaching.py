from django.core.management.base import BaseCommand
from coaching.models import VideoCategory, Video

class Command(BaseCommand):
    help = 'Populate coaching database with sample videos'

    def handle(self, *args, **options):
        self.stdout.write('Creating video categories...')
        
        # Create categories
        categories_data = [
            {'name': 'technical', 'icon': '💻', 'description': 'Technical interview preparation'},
            {'name': 'behavioral', 'icon': '🗣️', 'description': 'Behavioral interview techniques'},
            {'name': 'system-design', 'icon': '🏗️', 'description': 'System design concepts'},
            {'name': 'mock-interview', 'icon': '🎤', 'description': 'Full mock interview sessions'},
            {'name': 'career', 'icon': '📈', 'description': 'Career development tips'},
        ]
        
        for cat_data in categories_data:
            category, created = VideoCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'description': cat_data['description']
                }
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Sample videos data
        videos_data = [
            {
                'title': 'Technical Interview Preparation - Data Structures',
                'description': 'Master the fundamentals of data structures for technical interviews',
                'thumbnail_url': 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
                'duration': '15:30',
                'category': 'technical',
                'instructor': 'Sarah Johnson',
                'level': 'intermediate',
                'views': 12500
            },
            {
                'title': 'Behavioral Interview Questions & Answers',
                'description': 'Learn how to answer common behavioral interview questions effectively',
                'thumbnail_url': 'https://img.youtube.com/vi/PJKYqLP6MRE/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=PJKYqLP6MRE',
                'duration': '22:45',
                'category': 'behavioral',
                'instructor': 'Mike Chen',
                'level': 'beginner',
                'views': 8200
            },
            {
                'title': 'System Design Interview - Scalable Applications',
                'description': 'Design scalable systems and architecture for senior-level interviews',
                'thumbnail_url': 'https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=xpDnVSmNFX0',
                'duration': '35:20',
                'category': 'system-design',
                'instructor': 'Alex Rodriguez',
                'level': 'advanced',
                'views': 15700
            },
            {
                'title': 'Coding Interview Patterns - Two Pointers',
                'description': 'Master the two-pointer technique for coding interviews',
                'thumbnail_url': 'https://img.youtube.com/vi/jzZsG8n2R9A/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=jzZsG8n2R9A',
                'duration': '18:15',
                'category': 'technical',
                'instructor': 'Emma Davis',
                'level': 'intermediate',
                'views': 9800
            },
            {
                'title': 'Mock Interview: Google Software Engineer',
                'description': 'Real mock interview session with detailed feedback',
                'thumbnail_url': 'https://img.youtube.com/vi/uQdy914JRKQ/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=uQdy914JRKQ',
                'duration': '45:30',
                'category': 'mock-interview',
                'instructor': 'David Kim',
                'level': 'advanced',
                'views': 20100
            },
            {
                'title': 'Resume Building for Tech Interviews',
                'description': 'Create a standout resume that gets you interviews',
                'thumbnail_url': 'https://img.youtube.com/vi/ciIkiWwZnlc/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=ciIkiWwZnlc',
                'duration': '12:40',
                'category': 'career',
                'instructor': 'Lisa Wang',
                'level': 'beginner',
                'views': 6300
            },
            {
                'title': 'Dynamic Programming Interview Questions',
                'description': 'Solve complex DP problems step by step',
                'thumbnail_url': 'https://img.youtube.com/vi/oBt53YbR9Kk/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
                'duration': '28:55',
                'category': 'technical',
                'instructor': 'Robert Brown',
                'level': 'advanced',
                'views': 11200
            },
            {
                'title': 'Salary Negotiation for Software Engineers',
                'description': 'Learn how to negotiate your salary effectively',
                'thumbnail_url': 'https://img.youtube.com/vi/fyn0CKPuPlA/maxresdefault.jpg',
                'video_url': 'https://www.youtube.com/watch?v=fyn0CKPuPlA',
                'duration': '16:20',
                'category': 'career',
                'instructor': 'Jennifer Lee',
                'level': 'intermediate',
                'views': 14600
            }
        ]
        
        # Create videos
        created_count = 0
        for video_data in videos_data:
            try:
                category = VideoCategory.objects.get(name=video_data['category'])
                video, created = Video.objects.get_or_create(
                    title=video_data['title'],
                    defaults={
                        'description': video_data['description'],
                        'thumbnail_url': video_data['thumbnail_url'],
                        'video_url': video_data['video_url'],
                        'duration': video_data['duration'],
                        'category': category,
                        'instructor': video_data['instructor'],
                        'level': video_data['level'],
                        'views': video_data['views']
                    }
                )
                if created:
                    created_count += 1
                    self.stdout.write(f'Created video: {video.title}')
                else:
                    self.stdout.write(f'Video already exists: {video.title}')
            except VideoCategory.DoesNotExist:
                self.stdout.write(f'Category not found: {video_data["category"]}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new videos. Total videos: {Video.objects.count()}'
            )
        )
