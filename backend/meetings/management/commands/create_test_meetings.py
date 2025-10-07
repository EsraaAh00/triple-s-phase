from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from meetings.models import Meeting
from users.models import Profile

class Command(BaseCommand):
    help = 'Create test meetings for development'

    def handle(self, *args, **options):
        # Get or create test users
        instructor, created = User.objects.get_or_create(
            username='instructor',
            defaults={
                'email': 'instructor@test.com',
                'first_name': 'معلم',
                'last_name': 'تجريبي'
            }
        )
        
        student, created = User.objects.get_or_create(
            username='student',
            defaults={
                'email': 'student@test.com',
                'first_name': 'طالب',
                'last_name': 'تجريبي'
            }
        )
        
        # Create profiles if they don't exist
        Profile.objects.get_or_create(
            user=instructor,
            defaults={'status': 'Instructor', 'name': 'معلم تجريبي'}
        )
        
        Profile.objects.get_or_create(
            user=student,
            defaults={'status': 'Student', 'name': 'طالب تجريبي'}
        )
        
        # Create test meetings
        now = timezone.now()
        
        # Upcoming meeting
        upcoming_meeting, created = Meeting.objects.get_or_create(
            title='اجتماع تجريبي قادم',
            defaults={
                'description': 'اجتماع تجريبي للاختبار',
                'meeting_type': 'ZOOM',
                'start_time': now + timedelta(hours=2),
                'duration': timedelta(hours=1),
                'creator': instructor,
                'zoom_link': 'https://zoom.us/j/123456789',
                'max_participants': 50,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created upcoming meeting: {upcoming_meeting.title}')
            )
        
        # Ongoing meeting
        ongoing_meeting, created = Meeting.objects.get_or_create(
            title='اجتماع تجريبي جاري',
            defaults={
                'description': 'اجتماع تجريبي جاري الآن',
                'meeting_type': 'LIVE',
                'start_time': now - timedelta(minutes=30),
                'duration': timedelta(hours=2),
                'creator': instructor,
                'max_participants': 30,
                'is_active': True,
                'is_live_started': True,
                'live_started_at': now - timedelta(minutes=30)
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created ongoing meeting: {ongoing_meeting.title}')
            )
        
        # Completed meeting
        completed_meeting, created = Meeting.objects.get_or_create(
            title='اجتماع تجريبي منتهي',
            defaults={
                'description': 'اجتماع تجريبي منتهي',
                'meeting_type': 'NORMAL',
                'start_time': now - timedelta(hours=3),
                'duration': timedelta(hours=1),
                'creator': instructor,
                'max_participants': 20,
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Created completed meeting: {completed_meeting.title}')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created test meetings')
        )
