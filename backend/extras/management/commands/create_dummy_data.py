import random
import os
import django
from datetime import timedelta, date

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from extras.models import Banner, CourseCollection
from courses.models import Course, Category, Enrollment
from reviews.models import CourseReview, Comment
from users.models import Profile, Instructor, Student

User = get_user_model()

class Command(BaseCommand):
    help = 'Create dummy data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating dummy data...')
        
        # Create course collections
        collections_data = [
            {
                'name': 'دورات تطوير الويب',
                'description': 'مجموعة شاملة من دورات تطوير الويب للمبتدئين والمتقدمين',
                'display_order': 1
            },
            {
                'name': 'دورات الذكاء الاصطناعي',
                'description': 'تعلم أحدث تقنيات الذكاء الاصطناعي والتعلم الآلي',
                'display_order': 2
            },
            {
                'name': 'دورات التسويق الرقمي',
                'description': 'استراتيجيات التسويق الرقمي الفعالة لبناء الأعمال',
                'display_order': 3
            },
            {
                'name': 'دورات التصميم والإبداع',
                'description': 'دورات تصميم تجربة المستخدم والتصميم الجرافيكي',
                'display_order': 4
            }
        ]
        
        for collection_data in collections_data:
            collection, created = CourseCollection.objects.get_or_create(
                name=collection_data['name'],
                defaults={
                    'slug': slugify(collection_data['name']),
                    'description': collection_data['description'],
                    'display_order': collection_data['display_order']
                }
            )
            
            if created:
                self.stdout.write(f'Created collection: {collection.name}')
            else:
                self.stdout.write(f'Collection already exists: {collection.name}')
            
            # Add some courses to each collection
            courses = Course.objects.filter(status='published')[:5]
            collection.courses.add(*courses)
            self.stdout.write(f'Added {courses.count()} courses to {collection.name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created dummy data'))

    def create_users(self):
        self.stdout.write('📥 إنشاء المستخدمين...')
        
        # إنشاء المدربين
        instructors_data = [
            {'username': 'ahmed_hassan', 'email': 'ahmed@example.com', 'first_name': 'أحمد', 'last_name': 'حسن', 'qualification': 'خبير في التصميم الجرافيكي', 'bio': 'مدرب معتمد في Adobe Photoshop وIllustrator'},
            {'username': 'sara_mahmoud', 'email': 'sara@example.com', 'first_name': 'سارة', 'last_name': 'محمود', 'qualification': 'خبيرة في التسويق الرقمي', 'bio': 'متخصصة في إدارة الحملات الإعلانية وتحليل البيانات'},
            {'username': 'mohamed_ali', 'email': 'mohamed@example.com', 'first_name': 'محمد', 'last_name': 'علي', 'qualification': 'مطور مواقع ويب', 'bio': 'مطور فول ستاك بخبرة 8 سنوات في React و Node.js'},
            {'username': 'fatima_omar', 'email': 'fatima@example.com', 'first_name': 'فاطمة', 'last_name': 'عمر', 'qualification': 'خبيرة في علوم البيانات', 'bio': 'متخصصة في تحليل البيانات والذكاء الاصطناعي'},
            {'username': 'khalid_salem', 'email': 'khalid@example.com', 'first_name': 'خالد', 'last_name': 'سالم', 'qualification': 'خبير في الأمن السيبراني', 'bio': 'مستشار أمن معلومات معتمد مع خبرة 10 سنوات'},
        ]
        
        for instructor_data in instructors_data:
            user, created = User.objects.get_or_create(
                username=instructor_data['username'],
                defaults={
                    'email': instructor_data['email'],
                    'first_name': instructor_data['first_name'],
                    'last_name': instructor_data['last_name'],
                    'is_staff': True,
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                
                # إنشاء البروفايل
                profile, profile_created = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'status': 'Instructor',
                        'shortBio': instructor_data['bio'],
                    }
                )
                
                # إنشاء الـ Instructor
                instructor, instructor_created = Instructor.objects.get_or_create(
                    profile=profile,
                    defaults={
                        'qualification': instructor_data['qualification'],
                        'bio': instructor_data['bio'],
                        'date_of_birth': date(1980, 1, 1),
                    }
                )
                
                self.stdout.write(f'✓ تم إنشاء المدرب: {user.first_name} {user.last_name}')
        
        # إنشاء الطلاب
        students_data = [
            {'username': 'student1', 'email': 'student1@example.com', 'first_name': 'علي', 'last_name': 'أحمد'},
            {'username': 'student2', 'email': 'student2@example.com', 'first_name': 'مريم', 'last_name': 'خالد'},
            {'username': 'student3', 'email': 'student3@example.com', 'first_name': 'حسام', 'last_name': 'محمد'},
            {'username': 'student4', 'email': 'student4@example.com', 'first_name': 'نورا', 'last_name': 'سعد'},
            {'username': 'student5', 'email': 'student5@example.com', 'first_name': 'كريم', 'last_name': 'عبدالله'},
        ]
        
        for student_data in students_data:
            user, created = User.objects.get_or_create(
                username=student_data['username'],
                defaults={
                    'email': student_data['email'],
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                }
            )
            if created:
                user.set_password('password123')
                user.save()
                
                # إنشاء البروفايل
                profile, profile_created = Profile.objects.get_or_create(
                    user=user,
                    defaults={
                        'name': f"{user.first_name} {user.last_name}",
                        'email': user.email,
                        'status': 'Student',
                    }
                )
                
                # إنشاء الـ Student
                student, student_created = Student.objects.get_or_create(
                    profile=profile,
                    defaults={
                        'date_of_birth': date(1995, 1, 1),
                    }
                )
                
                self.stdout.write(f'✓ تم إنشاء الطالب: {user.first_name} {user.last_name}')

    def create_categories(self):
        self.stdout.write('📚 إنشاء التصنيفات...')
        
        categories_data = [
            {'name': 'البرمجة وتطوير الويب', 'slug': 'programming-web', 'description': 'دورات في لغات البرمجة وتطوير المواقع'},
            {'name': 'التسويق الرقمي', 'slug': 'digital-marketing', 'description': 'دورات في التسويق الإلكتروني ووسائل التواصل'},
            {'name': 'التصميم الجرافيكي', 'slug': 'graphic-design', 'description': 'دورات في التصميم والجرافيك'},
            {'name': 'إدارة الأعمال', 'slug': 'business-management', 'description': 'دورات في إدارة الأعمال والقيادة'},
            {'name': 'علوم البيانات', 'slug': 'data-science', 'description': 'دورات في تحليل البيانات والذكاء الاصطناعي'},
            {'name': 'الأمن السيبراني', 'slug': 'cybersecurity', 'description': 'دورات في أمان المعلومات والحماية'},
        ]
        
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                }
            )
            if created:
                self.stdout.write(f'✓ تم إنشاء التصنيف: {category.name}')

    def create_courses(self):
        self.stdout.write('🎓 إنشاء الدورات...')
        
        categories = Category.objects.all()
        instructors = Instructor.objects.all()
        
        if not categories.exists():
            self.stdout.write(self.style.WARNING('لا توجد تصنيفات! سيتم إنشاؤها أولاً.'))
            self.create_categories()
            categories = Category.objects.all()
            
        if not instructors.exists():
            self.stdout.write(self.style.WARNING('لا يوجد مدربون! سيتم إنشاؤهم أولاً.'))
            self.create_users()
            instructors = Instructor.objects.all()
        
        courses_data = [
            {
                'title': 'تطوير المواقع بـ React و Next.js',
                'slug': 'react-nextjs-course',
                'description': 'دورة شاملة لتعلم React و Next.js من الصفر حتى الاحتراف',
                'short_description': 'تعلم React و Next.js من الصفر',
                'price': 499.00,
                'level': 'intermediate',
                'language': 'ar',
                'status': 'published',
                'is_featured': True,
            },
            {
                'title': 'دبلومة التسويق الرقمي الشاملة',
                'slug': 'digital-marketing-diploma',
                'description': 'دبلومة معتمدة في التسويق الرقمي تشمل جميع المنصات والأدوات',
                'short_description': 'دبلومة معتمدة في التسويق الرقمي',
                'price': 899.00,
                'level': 'advanced',
                'language': 'ar',
                'status': 'published',
                'is_featured': True,
            },
            {
                'title': 'دورة Adobe Photoshop الاحترافية',
                'slug': 'photoshop-professional',
                'description': 'تعلم التصميم الجرافيكي باستخدام Adobe Photoshop من الصفر',
                'short_description': 'تعلم التصميم الجرافيكي باستخدام Photoshop',
                'price': 349.00,
                'level': 'beginner',
                'language': 'ar',
                'status': 'published',
                'is_featured': True,
            },
            {
                'title': 'دورة Python للبرمجة والذكاء الاصطناعي',
                'slug': 'python-ai-course',
                'description': 'تعلم لغة Python وتطبيقاتها في الذكاء الاصطناعي',
                'short_description': 'تعلم Python والذكاء الاصطناعي',
                'price': 599.00,
                'level': 'intermediate',
                'language': 'ar',
                'status': 'published',
                'is_featured': True,
            },
            {
                'title': 'إدارة المشاريع الرقمية',
                'slug': 'digital-project-management',
                'description': 'دورة متقدمة في إدارة المشاريع الرقمية والتقنية',
                'short_description': 'إدارة المشاريع الرقمية والتقنية',
                'price': 429.00,
                'level': 'advanced',
                'language': 'ar',
                'status': 'published',
                'is_featured': False,
            },
            {
                'title': 'الأمن السيبراني والحماية',
                'slug': 'cybersecurity-course',
                'description': 'دورة شاملة في أمان المعلومات والحماية السيبرانية',
                'short_description': 'أمان المعلومات والحماية السيبرانية',
                'price': 699.00,
                'level': 'advanced',
                'language': 'ar',
                'status': 'published',
                'is_featured': True,
            },
        ]
        
        for i, course_data in enumerate(courses_data):
            category = categories[i % len(categories)]
            instructor = instructors[i % len(instructors)]
            
            course, created = Course.objects.get_or_create(
                slug=course_data['slug'],
                defaults={
                    'title': course_data['title'],
                    'description': course_data['description'],
                    'short_description': course_data['short_description'],
                    'category': category,
                    'price': course_data['price'],
                    'level': course_data['level'],
                    'language': course_data['language'],
                    'status': course_data['status'],
                    'is_featured': course_data['is_featured'],
                    'average_rating': round(random.uniform(4.2, 5.0), 1),
                    'total_enrollments': random.randint(50, 300),
                }
            )
            
            if created:
                # إضافة المدرب إلى الدورة
                course.instructors.add(instructor)
                course.save()
                self.stdout.write(f'✓ تم إنشاء الدورة: {course.title}')

    def create_course_collections(self):
        self.stdout.write('📦 إنشاء مجموعات الدورات...')
        
        # جميع الدورات
        all_courses = Course.objects.filter(status='published')
        
        # تقسيم الدورات حسب المستوى
        beginner_courses = all_courses.filter(level='beginner')
        intermediate_courses = all_courses.filter(level='intermediate')
        advanced_courses = all_courses.filter(level='advanced')
        
        collections_data = [
            {
                'name': 'الدورات الأساسية',
                'slug': 'beginner-courses',
                'description': 'دورات مناسبة للمبتدئين في مختلف المجالات',
                'courses': beginner_courses,
                'is_featured': True,
                'display_order': 1,
            },
            {
                'name': 'الدورات المتوسطة',
                'slug': 'intermediate-courses',
                'description': 'دورات متوسطة المستوى لتطوير المهارات',
                'courses': intermediate_courses,
                'is_featured': True,
                'display_order': 2,
            },
            {
                'name': 'الدورات المتقدمة',
                'slug': 'advanced-courses',
                'description': 'دورات متقدمة للمحترفين والخبراء',
                'courses': advanced_courses,
                'is_featured': True,
                'display_order': 3,
            },
        ]
        
        for collection_data in collections_data:
            collection, created = CourseCollection.objects.get_or_create(
                slug=collection_data['slug'],
                defaults={
                    'name': collection_data['name'],
                    'description': collection_data['description'],
                    'is_featured': collection_data['is_featured'],
                    'display_order': collection_data['display_order'],
                }
            )
            if created:
                collection.courses.set(collection_data['courses'])
                self.stdout.write(f'✓ تم إنشاء مجموعة الدورات: {collection.name}')

    def create_banners(self):
        self.stdout.write('🎨 إنشاء البانرات...')
        
        banners_data = [
            {
                'title': 'منصة التعلم الإلكتروني الرائدة في الشرق الأوسط',
                'description': 'انضم إلى أكثر من 50,000 طالب واحصل على أفضل تجربة تعليمية رقمية مع خبراء المجال',
                'url': '/courses',
                'banner_type': 'main',
                'display_order': 1,
                'is_active': True,
            },
            {
                'title': 'دورات تدريبية معتمدة ومتخصصة',
                'description': 'اكتشف مجموعة واسعة من الدورات في البرمجة، التسويق الرقمي، التصميم، وإدارة الأعمال',
                'url': '/courses',
                'banner_type': 'main',
                'display_order': 2,
                'is_active': True,
            },
            {
                'title': 'ابدأ رحلتك المهنية معنا اليوم',
                'description': 'دبلومات وشهادات معتمدة تؤهلك لسوق العمل مع فرص توظيف حقيقية',
                'url': '/register',
                'banner_type': 'main',
                'display_order': 3,
                'is_active': True,
            },
        ]
        
        for banner_data in banners_data:
            banner, created = Banner.objects.get_or_create(
                title=banner_data['title'],
                defaults={
                    'description': banner_data['description'],
                    'url': banner_data['url'],
                    'banner_type': banner_data['banner_type'],
                    'display_order': banner_data['display_order'],
                    'is_active': banner_data['is_active'],
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timedelta(days=365),
                }
            )
            if created:
                self.stdout.write(f'✓ تم إنشاء البانر: {banner.title[:50]}...')

    def create_enrollments(self):
        self.stdout.write('📝 إنشاء التسجيلات...')
        
        students = User.objects.filter(is_staff=False)
        courses = Course.objects.filter(status='published')
        
        if not students.exists() or not courses.exists():
            self.stdout.write(self.style.WARNING('لا توجد طلاب أو دورات كافية لإنشاء التسجيلات'))
            return
        
        # إنشاء تسجيلات عشوائية
        enrollments_created = 0
        for student in students:
            enrolled_courses = random.sample(list(courses), min(random.randint(1, 3), len(courses)))
            for course in enrolled_courses:
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'enrollment_date': timezone.now() - timedelta(days=random.randint(1, 90)),
                        'status': 'active',
                        'progress': random.uniform(0, 100),
                        'is_paid': True,
                        'payment_amount': course.price,
                        'payment_date': timezone.now() - timedelta(days=random.randint(1, 30)),
                    }
                )
                if created:
                    enrollments_created += 1
                    
        self.stdout.write(f'✓ تم إنشاء {enrollments_created} تسجيل')

    def create_reviews(self):
        self.stdout.write('⭐ إنشاء المراجعات...')
        
        students = User.objects.filter(is_staff=False)
        courses = Course.objects.filter(status='published')
        
        if not students.exists() or not courses.exists():
            self.stdout.write(self.style.WARNING('لا توجد طلاب أو دورات كافية لإنشاء المراجعات'))
            return
        
        reviews_data = [
            {
                'review_text': 'تجربة تعليمية رائعة! الدورات عملية ومفيدة جداً. استفدت كثيراً من دورة React وحصلت على وظيفة بعدها مباشرة.',
                'rating': 5,
            },
            {
                'review_text': 'المحتوى المقدم ممتاز والمدربين محترفين جداً. دبلومة التسويق الرقمي غيرت مساري المهني تماماً.',
                'rating': 5,
            },
            {
                'review_text': 'منصة تعليمية متميزة بكل المقاييس. التفاعل مع المدربين رائع والمواد واضحة ومنظمة بشكل ممتاز.',
                'rating': 4,
            },
            {
                'review_text': 'شكراً لكم على هذه التجربة الرائعة. دورة التصميم الجرافيكي ساعدتني في تطوير مهاراتي وبدء عملي الحر.',
                'rating': 5,
            },
            {
                'review_text': 'منصة احترافية وخدمة عملاء ممتازة. الدعم الفني متوفر دائماً والمواد محدثة باستمرار.',
                'rating': 4,
            },
            {
                'review_text': 'أنصح بشدة بهذه المنصة. دورة Python وأمان المعلومات فتحت لي آفاق جديدة في مجال التكنولوجيا.',
                'rating': 5,
            },
        ]
        
        reviews_created = 0
        for i, review_data in enumerate(reviews_data):
            student = students[i % len(students)]
            course = courses[i % len(courses)]
            
            review, created = CourseReview.objects.get_or_create(
                user=student,
                course=course,
                defaults={
                    'review_text': review_data['review_text'],
                    'rating': review_data['rating'],
                    'is_approved': True,
                }
            )
            if created:
                reviews_created += 1
                
        self.stdout.write(f'✓ تم إنشاء {reviews_created} مراجعة') 