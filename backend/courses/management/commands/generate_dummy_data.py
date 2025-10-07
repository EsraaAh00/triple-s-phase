"""
Management command to generate dummy data for testing and development.
"""
import random
import os
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth import get_user_model
from faker import Faker
from courses.models import Course, Category, Tag, Enrollment
from users.models import Instructor, Organization

User = get_user_model()

def get_unique_slug(instance, name, slug_field='slug'):
    """Generate a unique slug for the given model instance."""
    # Generate initial slug
    slug = slugify(name)
    if not slug:  # In case slugify returns empty string
        slug = f"item-{random.randint(1000, 9999)}"
    
    model = instance.__class__
    
    # Check if slug already exists
    if not model.objects.filter(**{slug_field: slug}).exists():
        return slug
    
    # If slug exists, append a number and try again
    counter = 1
    max_attempts = 100  # Prevent infinite loops
    while counter < max_attempts:
        new_slug = f"{slug}-{counter}"
        if not model.objects.filter(**{slug_field: new_slug}).exists():
            return new_slug
        counter += 1
    
    # If we've tried many times and still no luck, append a random number
    return f"{slug}-{random.randint(1000, 9999)}"

class Command(BaseCommand):
    help = 'Generate dummy data for courses, categories, and tags'

    def add_arguments(self, parser):
        parser.add_argument('count', type=int, nargs='?', default=10, 
                          help='Number of courses to create (default: 10)')

    def handle(self, *args, **options):
        fake = Faker()
        count = options['count']
        
        # Create categories if they don't exist
        categories = []
        category_names = [
            'تطوير الويب', 'الذكاء الاصطناعي', 'علوم البيانات', 
            'تطوير التطبيقات', 'الأمن السيبراني', 'تسويق رقمي',
            'تصميم الجرافيك', 'البرمجة', 'إدارة الأعمال', 'اللغة الإنجليزية'
        ]
        
        for name in category_names:
            try:
                category = Category.objects.get(name=name)
                self.stdout.write(self.style.SUCCESS(f'Found existing category: {name}'))
            except Category.DoesNotExist:
                category = Category(
                    name=name,
                    description=f'دورات في مجال {name}',
                    is_active=True
                )
                # Generate unique slug
                category.slug = get_unique_slug(category, name)
                category.save()
                self.stdout.write(self.style.SUCCESS(f'Created category: {name} (slug: {category.slug})'))
            categories.append(category)
        
        # Create tags if they don't exist
        tags = []
        tag_names = [
            'برمجة', 'ويب', 'جوال', 'بيانات', 'تعلم آلي',
            'ذكاء اصطناعي', 'أمن', 'تسويق', 'تصميم', 'إدارة',
            'لغة إنجليزية', 'تطوير', 'شبكات', 'سحابة', 'قواعد بيانات'
        ]
        
        for name in tag_names:
            try:
                tag = Tag.objects.get(name=name)
                self.stdout.write(self.style.SUCCESS(f'Found existing tag: {name}'))
            except Tag.DoesNotExist:
                tag = Tag(
                    name=name,
                    is_active=True
                )
                # Generate unique slug
                tag.slug = get_unique_slug(tag, name)
                tag.save()
                self.stdout.write(self.style.SUCCESS(f'Created tag: {name} (slug: {tag.slug})'))
            tags.append(tag)
        
        # Get or create an instructor
        instructor_user, _ = User.objects.get_or_create(
            username='instructor1',
            defaults={
                'email': 'instructor@example.com',
                'first_name': 'أحمد',
                'last_name': 'محمد',
                'is_active': True
            }
        )
        instructor_user.set_password('instructor123')
        instructor_user.save()
        
        instructor, _ = Instructor.objects.get_or_create(
            user=instructor_user,
            defaults={
                'bio': 'مدرس ذو خبرة في مجال تطوير البرمجيات',
                'is_approved': True
            }
        )
        
        # Get or create an organization
        org, _ = Organization.objects.get_or_create(
            name='أكاديمية البرمجة',
            defaults={
                'description': 'أكاديمية متخصصة في تعليم البرمجة وتطوير الويب',
                'is_approved': True
            }
        )
        
        # Create courses
        statuses = ['draft', 'published', 'published', 'published']  # More chance for published
        levels = ['beginner', 'intermediate', 'advanced']
        
        for i in range(count):
            is_published = random.choice([True, False])
            status = 'published' if is_published else 'draft'
            
            course = Course.objects.create(
                title=fake.sentence(nb_words=6, variable_nb_words=True, ext_word_list=None),
                subtitle=fake.sentence(nb_words=10, variable_nb_words=True, ext_word_list=None),
                description=fake.paragraph(nb_sentences=10, variable_nb_sentences=True, ext_word_list=None),
                short_description=fake.paragraph(nb_sentences=2, variable_nb_sentences=False, ext_word_list=None),
                category=random.choice(categories),
                level=random.choice(levels),
                price=random.choice([0, 99, 199, 299, 399, 499]),
                discount_price=random.choice([None, 49, 99, 149, 199]),
                is_free=random.choice([True, False, False, False]),  # 25% chance of being free
                status=status,
                is_featured=random.choice([True, False, False, False]),  # 25% chance of being featured
                is_certified=random.choice([True, False]),
                is_active=True,
                published_at=timezone.now() - timedelta(days=random.randint(1, 365)),
                organization=org,
                language='ar',
            )
            
            # Add tags (2-5 random tags per course)
            course_tags = random.sample(tags, k=random.randint(2, 5))
            course.tags.set(course_tags)
            
            # Add instructor
            course.instructors.add(instructor)
            
            # Create some enrollments if course is published
            if is_published:
                self._create_enrollments(course, 5)  # Create 5 enrollments per course
            
            self.stdout.write(self.style.SUCCESS(f'Created course: {course.title}'))
    
    def _create_enrollments(self, course, count):
        """Create dummy enrollments for a course"""
        for i in range(count):
            user = User.objects.create_user(
                username=f'student{i}_{course.id}',
                email=f'student{i}_{course.id}@example.com',
                password='student123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                is_active=True
            )
            
            Enrollment.objects.create(
                student=user,
                course=course,
                status='active',
                progress=random.randint(0, 100),
                is_paid=not course.is_free,
                payment_amount=0 if course.is_free else course.price
            )
