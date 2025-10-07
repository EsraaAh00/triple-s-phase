from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile, Instructor

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a test instructor user for API testing'

    def handle(self, *args, **options):
        # Create or get user
        username = 'testinstructor1'
        email = 'testinstructor1@example.com'
        password = 'testpass123'
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_active': True,
                'is_staff': False
            }
        )
        
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Created user: {username}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'User already exists: {username}'))
        
        # Create or get profile
        profile, profile_created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'full_name': 'Test Instructor',
                'status': 'Instructor',
                'is_verified': True
            }
        )
        
        if profile_created:
            self.stdout.write(self.style.SUCCESS('Created profile for instructor'))
        else:
            self.stdout.write(self.style.SUCCESS('Profile already exists'))
        
        # Create or get instructor
        instructor, instructor_created = Instructor.objects.get_or_create(
            profile=profile,
            defaults={
                'bio': 'Test Instructor Bio',
            }
        )
        
        if instructor_created:
            self.stdout.write(self.style.SUCCESS('Created instructor record'))
        else:
            self.stdout.write(self.style.SUCCESS('Instructor record already exists'))
        
        self.stdout.write(self.style.SUCCESS(f'Test instructor credentials:'))
        self.stdout.write(self.style.SUCCESS(f'Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
