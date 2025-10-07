from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

User = get_user_model()

class Command(BaseCommand):
    help = 'Check user status and verify password'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username to check')
        parser.add_argument('password', type=str, help='Password to verify')

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        
        try:
            user = User.objects.get(username=username)
            self.stdout.write(self.style.SUCCESS(f'User found: {user.username}'))
            self.stdout.write(f'Email: {user.email}')
            self.stdout.write(f'Is active: {user.is_active}')
            self.stdout.write(f'Is staff: {user.is_staff}')
            self.stdout.write(f'Is superuser: {user.is_superuser}')
            
            # Check password
            if check_password(password, user.password):
                self.stdout.write(self.style.SUCCESS('Password is correct'))
            else:
                self.stdout.write(self.style.ERROR('Password is incorrect'))
                
            # Check if user has a profile
            if hasattr(user, 'profile'):
                profile = user.profile
                self.stdout.write('\nProfile Information:')
                # Safely get attributes with defaults
                full_name = getattr(profile, 'full_name', 'Not set')
                status = getattr(profile, 'status', 'Not set')
                is_verified = getattr(profile, 'is_verified', 'Not set')
                
                self.stdout.write(f'Full name: {full_name}')
                self.stdout.write(f'Status: {status}')
                self.stdout.write(f'Is verified: {is_verified}')
                
                # Check if user is an instructor
                if hasattr(profile, 'instructor'):
                    instructor = profile.instructor
                    self.stdout.write('\nInstructor Information:')
                    self.stdout.write(f'Bio: {instructor.bio}')
                    self.stdout.write(f"Is approved: {getattr(instructor, 'is_approved', 'N/A')}")
            else:
                self.stdout.write(self.style.WARNING('No profile found for this user'))
                
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist'))
