from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import Profile

User = get_user_model()

class Command(BaseCommand):
    help = 'Update user profile status to Instructor and verify the profile'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to update')

    def handle(self, *args, **options):
        username = options['username']
        
        try:
            user = User.objects.get(username=username)
            self.stdout.write(self.style.SUCCESS(f'Found user: {user.username}'))
            
            # Get or create profile
            profile, created = Profile.objects.get_or_create(user=user)
            
            if created:
                self.stdout.write(self.style.SUCCESS('Created new profile for user'))
            
            # Update profile fields
            profile.status = 'Instructor'
            profile.is_verified = True
            profile.save()
            
            self.stdout.write(self.style.SUCCESS('Updated profile:'))
            self.stdout.write(f'- Status: {profile.status}')
            self.stdout.write(f'- Is verified: {profile.is_verified}')
            
            # Check if instructor record exists
            if hasattr(profile, 'instructor'):
                self.stdout.write(self.style.SUCCESS('Instructor record exists'))
            else:
                self.stdout.write(self.style.WARNING('No instructor record found'))
            
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist'))
