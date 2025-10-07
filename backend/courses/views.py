import logging
from rest_framework import status, generics, permissions, filters, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

# Set up logging
logger = logging.getLogger(__name__)
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count, F, Sum
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from django.db import transaction
from datetime import timedelta, datetime
from django.core.paginator import Paginator
import logging

from .models import Course, Category, Tag, Enrollment
from users.models import Instructor, Profile, User
from .serializers import (
    CategorySerializer, TagsSerializer, CourseBasicSerializer, 
    CourseDetailSerializer, CourseCreateSerializer, CourseUpdateSerializer,
    CourseEnrollmentSerializer, DashboardStatsSerializer, SearchSerializer
)
from content.serializers import ModuleBasicSerializer

logger = logging.getLogger(__name__)


class CategoryViewSet(ReadOnlyModelViewSet):
    """عرض التصنيفات"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]




class TagsViewSet(ReadOnlyModelViewSet):
    """عرض الوسوم"""
    queryset = Tag.objects.all()
    serializer_class = TagsSerializer
    permission_classes = [AllowAny]


class CourseViewSet(ModelViewSet):
    """إدارة الدورات"""
    queryset = Course.objects.select_related('category').prefetch_related('instructors', 'instructors__profile', 'tags', 'reviews')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'level', 'status']
    search_fields = ['title', 'description', 'short_description']
    ordering_fields = ['created_at', 'updated_at', 'title', 'price', 'average_rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CourseCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return CourseUpdateSerializer
        elif self.action == 'retrieve':
            return CourseDetailSerializer
        else:
            return CourseBasicSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Get courses based on user permissions"""
        queryset = super().get_queryset()
        
        # If user is staff/admin, show all courses
        if self.request.user.is_staff:
            return queryset
        
        # If user is instructor, show their courses
        if hasattr(self.request.user, 'profile') and self.request.user.profile.status == 'Instructor':
            try:
                instructor = Instructor.objects.get(profile=self.request.user.profile)
                return queryset.filter(instructors=instructor)
            except Instructor.DoesNotExist:
                return Course.objects.none()
        
        # For other users, show only published courses
        return queryset.filter(status='published')

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a course with better error handling"""
        try:
            return super().retrieve(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in CourseViewSet.retrieve: {str(e)}", exc_info=True)
            return Response({
                'error': 'حدث خطأ أثناء جلب بيانات الدورة',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def create(self, request, *args, **kwargs):
        logger.info("CourseViewSet.create method called")
        logger.info(f"Request method: {request.method}")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request user: {request.user}")
        
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"Course created successfully, response: {response}")
            return response
        except Exception as e:
            logger.error(f"Error in CourseViewSet.create: {str(e)}", exc_info=True)
            
            # Check if the course was actually created despite the error
            try:
                # Try to find the course that might have been created
                if hasattr(request, 'data') and request.data.get('title'):
                    course = Course.objects.filter(
                        title=request.data.get('title'),
                        subtitle=request.data.get('subtitle', '')
                    ).first()
                    
                    if course:
                        # Course was created successfully, return it
                        serializer = self.get_serializer(course)
                        logger.info(f"Course found after error, returning: {course.id}")
                        return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as find_error:
                logger.error(f"Error finding course after creation error: {str(find_error)}")
            
            # Return a more detailed error response
            return Response({
                'error': 'Failed to create course',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        """إنشاء دورة جديدة"""
        logger.info("CourseViewSet.perform_create method called")
        logger.info(f"Serializer data: {serializer.validated_data}")
        logger.info(f"Request user: {self.request.user}")
        
        # Ensure the user is an instructor
        user = self.request.user
        try:
            profile = user.profile
            if profile.status != 'Instructor' and not (profile.status == 'Admin' or user.is_staff):
                logger.warning(f"User {user.id} is not authorized to create courses")
                raise permissions.PermissionDenied("You are not authorized to create courses")
            
            # Save the course
            course = serializer.save()
            logger.info(f"Course created with ID: {course.id}")
            
            # Add the instructor to the course
            if profile.status == 'Instructor':
                try:
                    instructor = Instructor.objects.get(profile=profile)
                    course.instructors.add(instructor)
                    logger.info(f"Instructor {instructor.id} added to course {course.id}")
                except Instructor.DoesNotExist:
                    logger.error(f"Instructor profile not found for user {user.id}")
                    # Don't raise an error here, just log it
                    logger.warning("Instructor profile not found, but course was created successfully")
            
            # Ensure the course is saved and return it
            course.save()
            logger.info(f"Course {course.id} saved successfully")
            return course
            
        except Profile.DoesNotExist:
            logger.error(f"Profile not found for user {user.id}")
            raise permissions.PermissionDenied("User profile not found")
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise

    def update(self, request, *args, **kwargs):
        """Update a course with better error handling"""
        try:
            # First update the course
            super().update(request, *args, **kwargs)
            # Then return the updated course using CourseDetailSerializer
            instance = self.get_object()
            serializer = CourseDetailSerializer(instance, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CourseViewSet.update: {str(e)}", exc_info=True)
            return Response({
                'error': 'حدث خطأ أثناء تحديث الدورة',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        """Partial update a course with better error handling"""
        try:
            # First update the course
            super().partial_update(request, *args, **kwargs)
            # Then return the updated course using CourseDetailSerializer
            instance = self.get_object()
            serializer = CourseDetailSerializer(instance, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in CourseViewSet.partial_update: {str(e)}", exc_info=True)
            return Response({
                'error': 'حدث خطأ أثناء تحديث الدورة',
                'detail': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_update(self, serializer):
        """تحديث دورة"""
        try:
            # Check permissions
            course = self.get_object()
            user = self.request.user
            
            try:
                profile = user.profile
                if profile.status == 'Admin' or user.is_staff:
                    # Admin can update any course
                    pass
                elif profile.status == 'Instructor':
                    try:
                        instructor = Instructor.objects.get(profile=profile)
                        if not course.instructors.filter(id=instructor.id).exists():
                            raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل هذه الدورة")
                    except Instructor.DoesNotExist:
                        raise permissions.PermissionDenied("لم يتم العثور على ملف تعريف المدرب")
                else:
                    raise permissions.PermissionDenied("ليس لديك صلاحية لتعديل الدورات")
            except Profile.DoesNotExist:
                raise permissions.PermissionDenied("لم يتم العثور على ملف تعريف المستخدم")
            
            serializer.save()
        except Exception as e:
            logger.error(f"Error in perform_update: {str(e)}", exc_info=True)
            raise

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """التسجيل في دورة"""
        course = self.get_object()
        
        if course.status != 'published':
            return Response({
                'error': 'هذه الدورة غير متاحة للتسجيل'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already enrolled
        if course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
            return Response({
                'error': 'أنت مسجل في هذه الدورة بالفعل'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Create enrollment record
                enrollment, created = Enrollment.objects.get_or_create(
                    course=course,
                    student=request.user,
                    defaults={'status': 'active'}
                )
                
                # Update course statistics
                course.update_statistics()
                
                return Response({
                    'message': 'تم التسجيل في الدورة بنجاح',
                    'enrollment_id': enrollment.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error enrolling user in course: {str(e)}")
            return Response({
                'error': 'حدث خطأ أثناء التسجيل في الدورة'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        """إلغاء التسجيل من دورة"""
        course = self.get_object()
        
        if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # Update enrollment status
                try:
                    enrollment = Enrollment.objects.get(course=course, student=request.user)
                    enrollment.status = 'dropped'
                    enrollment.save()
                except Enrollment.DoesNotExist:
                    pass
                
                # Update course statistics
                course.update_statistics()
                
                return Response({
                    'message': 'تم إلغاء التسجيل من الدورة'
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error unenrolling user from course: {str(e)}")
            return Response({
                'error': 'حدث خطأ أثناء إلغاء التسجيل'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """جلب وحدات الدورة"""
        course = self.get_object()
        
        # Check if user is enrolled or is the teacher/admin
        user = request.user
        is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                # Admin can access any course
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and course.instructors.filter(id=instructor.id).exists():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        if not is_enrolled and not is_instructor_or_admin:
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة للوصول لهذا المحتوى'
            }, status=status.HTTP_403_FORBIDDEN)
        
        modules = course.modules.all().order_by('order')
        serializer = ModuleBasicSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'modules': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """جلب الدورات ذات الصلة"""
        course = self.get_object()
        
        # Get courses in the same category, excluding the current course
        related_courses = Course.objects.filter(
            category=course.category,
            status='published'
        ).exclude(id=course.id).select_related('category').prefetch_related('tags')[:6]
        
        # If not enough courses in same category, add some popular courses
        if related_courses.count() < 6:
            additional_courses = Course.objects.filter(
                status='published'
            ).exclude(id=course.id).exclude(id__in=related_courses.values_list('id', flat=True)).select_related('category').prefetch_related('tags')[:6 - related_courses.count()]
            related_courses = list(related_courses) + list(additional_courses)
        
        serializer = CourseBasicSerializer(related_courses, many=True, context={'request': request})
        return Response({
            'results': serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def my_courses(self, request):
        """دوراتي المسجل بها"""
        user = request.user
        enrolled_courses = Course.objects.filter(
            enrollments__student=user,
            enrollments__status__in=['active', 'completed'],
            status='published'
        ).select_related('instructors', 'category').prefetch_related('tags')
        
        serializer = CourseBasicSerializer(enrolled_courses, many=True, context={'request': request})
        return Response({
            'courses': serializer.data
        }, status=status.HTTP_200_OK)


# ModuleViewSet has been moved to content.views


@api_view(['GET'])
@permission_classes([AllowAny])
def course_search(request):
    """البحث في الدورات"""
    serializer = SearchSerializer(data=request.GET)
    
    if not serializer.is_valid():
        return Response({
            'error': 'معاملات بحث غير صحيحة',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Start with published courses
    queryset = Course.objects.filter(status='published').select_related('instructors', 'category').prefetch_related('tags')
    
    # Apply filters
    if data.get('query'):
        queryset = queryset.filter(
            Q(name__icontains=data['query']) |
            Q(description__icontains=data['query']) |
            Q(small_description__icontains=data['query'])
        )
    
    if data.get('category'):
        queryset = queryset.filter(category_id=data['category'])
    
    if data.get('level'):
        queryset = queryset.filter(level=data['level'])
    
    if data.get('min_price') is not None:
        queryset = queryset.filter(price__gte=data['min_price'])
    
    if data.get('max_price') is not None:
        queryset = queryset.filter(price__lte=data['max_price'])
    
    if data.get('tags'):
        queryset = queryset.filter(tags__in=data['tags']).distinct()
    
    if data.get('instructor'):
        queryset = queryset.filter(instructors=data['instructor'])
    
    # Apply sorting
    sort_by = data.get('sort_by', '-created_at')
    queryset = queryset.order_by(sort_by)
    
    # Paginate results
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 12
    page = paginator.paginate_queryset(queryset, request)
    
    serializer = CourseBasicSerializer(page, many=True, context={'request': request})
    
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def featured_courses(request):
    """الدورات المميزة"""
    courses = Course.objects.filter(
        status='published',
        is_featured=True
    ).select_related('category').prefetch_related('instructors', 'instructors__profile', 'tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def popular_courses(request):
    """الدورات الأكثر شعبية"""
    courses = Course.objects.filter(
        status='published'
    ).annotate(
        enrollment_count=Count('enrollments')
    ).order_by('-enrollment_count').select_related('instructors', 'category').prefetch_related('tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def recent_courses(request):
    """أحدث الدورات"""
    courses = Course.objects.filter(
        status='published'
    ).order_by('-created_at').select_related('instructors', 'category').prefetch_related('tags')[:8]
    
    serializer = CourseBasicSerializer(courses, many=True, context={'request': request})
    return Response({
        'courses': serializer.data
    }, status=status.HTTP_200_OK)


# Review-related views have been moved to the reviews app


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """إحصائيات لوحة التحكم للمعلمين والمديرين"""
    user = request.user
    
    try:
        profile = user.profile
        if profile.status not in ['Instructor', 'Admin'] and not user.is_staff:
            return Response({
                'error': 'ليس لديك صلاحية للوصول لهذه الإحصائيات'
            }, status=status.HTTP_403_FORBIDDEN)
        
        stats = {}
        
        if profile.status == 'Admin' or user.is_staff:
            # Admin stats - all courses
            all_courses = Course.objects.all()
            stats = {
                'total_courses': all_courses.count(),
                'published_courses': all_courses.filter(status='published').count(),
                'draft_courses': all_courses.filter(status='draft').count(),
                'total_students': User.objects.filter(profile__status='Student').count(),
                'total_enrollments': Enrollment.objects.count(),
            }
        elif profile.status == 'Instructor':
            # Instructor stats - only their courses
            instructor = profile.get_instructor_object()
            if instructor:
                instructor_courses = Course.objects.filter(instructors=instructor)
                total_students = 0
                for course in instructor_courses:
                    total_students += course.enrollments.count()
                
                stats = {
                    'total_courses': instructor_courses.count(),
                    'published_courses': instructor_courses.filter(status='published').count(),
                    'draft_courses': instructor_courses.filter(status='draft').count(),
                    'total_students': total_students,
                    'total_enrollments': Enrollment.objects.filter(course__in=instructor_courses).count(),
                }
        
        return Response(stats, status=status.HTTP_200_OK)
        
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def general_stats(request):
    """إحصائيات عامة للموقع"""
    stats = {
        'total_courses': Course.objects.filter(status='published').count(),
        'total_students': User.objects.filter(profile__status='Student').count(),
        'total_instructors': Instructor.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
    }
    
    return Response(stats, status=status.HTTP_200_OK) 


@api_view(['GET'])
@permission_classes([AllowAny])
def public_courses(request):
    """Get all published courses for public access"""
    try:
        courses = Course.objects.filter(
            status='published',
            is_active=True
        ).select_related('category').prefetch_related(
            'instructors', 
            'instructors__profile', 
            'tags'
        ).order_by('-created_at')
        
        # Apply filters
        category = request.GET.get('category')
        level = request.GET.get('level')
        search = request.GET.get('search')
        
        if category:
            courses = courses.filter(category_id=category)
        
        if level:
            courses = courses.filter(level=level)
        
        if search:
            courses = courses.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(short_description__icontains=search)
            )
        
        # Pagination
        page = request.GET.get('page', 1)
        page_size = request.GET.get('page_size', 12)
        
        paginator = Paginator(courses, page_size)
        courses_page = paginator.get_page(page)
        
        serializer = CourseBasicSerializer(courses_page, many=True, context={'request': request})
        
        return Response({
            'count': paginator.count,
            'next': courses_page.has_next(),
            'previous': courses_page.has_previous(),
            'results': serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error in public_courses: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب الدورات',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_enrolled_courses(request):
    """جلب الكورسات المسجلة للطالب مع معلومات التسجيل والتقدم"""
    try:
        user = request.user
        
        # Get enrolled courses with enrollment details
        enrollments = Enrollment.objects.filter(
            student=user,
            status__in=['active', 'completed']
        ).select_related(
            'course', 
            'course__category'
        ).prefetch_related(
            'course__instructors',
            'course__instructors__profile',
            'course__tags'
        ).order_by('-enrollment_date')
        
        enrolled_courses = []
        completed_courses = []
        
        for enrollment in enrollments:
            # Get actual progress from UserProgress model
            from content.models import UserProgress, ModuleProgress
            
            try:
                user_progress = UserProgress.objects.get(
                    user=user,
                    course=enrollment.course
                )
                actual_progress = user_progress.overall_progress
            except UserProgress.DoesNotExist:
                actual_progress = enrollment.progress
            
            # Count total and completed modules
            total_modules = enrollment.course.modules.filter(
                status='published',
                is_active=True
            ).count()
            
            completed_modules = ModuleProgress.objects.filter(
                user=user,
                module__course=enrollment.course,
                is_completed=True
            ).count()
            
            # Calculate total lessons from modules
            total_lessons = 0
            for module in enrollment.course.modules.filter(status='published', is_active=True):
                total_lessons += module.lessons.filter(is_active=True).count()
            
            course_data = {
                'id': enrollment.course.id,
                'title': enrollment.course.title,
                'description': enrollment.course.short_description or enrollment.course.description,
                'image': request.build_absolute_uri(enrollment.course.image.url) if enrollment.course.image else None,
                'instructor': enrollment.course.instructors.first().profile.name if enrollment.course.instructors.exists() and hasattr(enrollment.course.instructors.first(), 'profile') else 'غير محدد',
                'progress': actual_progress,
                'totalLessons': total_lessons,
                'total_lessons': total_lessons,  # Alternative field name
                'completedLessons': int((actual_progress / 100) * total_lessons) if total_lessons > 0 else 0,
                'completed_lessons': int((actual_progress / 100) * total_lessons) if total_lessons > 0 else 0,  # Alternative field name
                'totalModules': total_modules,
                'completedModules': completed_modules,
                'category': enrollment.course.category.name if enrollment.course.category else 'غير محدد',
                'enrollment_date': enrollment.enrollment_date,
                'completion_date': enrollment.completion_date,
                'status': enrollment.status,
                'grade': 'A' if actual_progress >= 90 else 'B' if actual_progress >= 80 else 'C' if actual_progress >= 70 else 'D' if actual_progress >= 60 else 'F'
            }
            
            if enrollment.status == 'completed':
                completed_courses.append(course_data)
            else:
                enrolled_courses.append(course_data)
        
        return Response({
            'enrolled_courses': enrolled_courses,
            'completed_courses': completed_courses,
            'total_enrolled': len(enrolled_courses),
            'total_completed': len(completed_courses)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error in my_enrolled_courses: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب الكورسات المسجلة',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_tracking_data(request, course_id):
    """جلب بيانات تتبع الكورس الشاملة مع المحتوى والتقدم والكويزات والواجبات والامتحانات"""
    try:
        user = request.user
        
        # Get course with all related data
        course = Course.objects.select_related('category').prefetch_related(
            'instructors', 
            'instructors__profile',
            'tags'
        ).get(id=course_id, status='published')
        
        # Check if user is enrolled
        enrollment = Enrollment.objects.filter(
            student=user,
            course=course,
            status__in=['active', 'completed']
        ).first()
        
        if not enrollment:
            return Response({
                'error': 'أنت غير مسجل في هذه الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get course modules with lessons
        modules = course.modules.filter(
            status='published',
            is_active=True
        ).order_by('order').prefetch_related(
            'lessons',
            'lessons__lesson_resources'
        )
        
        # Get user progress for course
        from content.models import UserProgress, ModuleProgress
        user_progress, _ = UserProgress.get_or_create_progress(user, course)
        
        # Get module progress for all modules
        module_progress_data = {}
        for module in modules:
            module_progress, _ = ModuleProgress.get_or_create_progress(user, module)
            module_progress_data[module.id] = {
                'status': module_progress.status,
                'is_completed': module_progress.is_completed,
                'video_watched': module_progress.video_watched,
                'video_progress': module_progress.video_progress,
                'pdf_viewed': module_progress.pdf_viewed,
                'notes_read': module_progress.notes_read,
                'quiz_completed': module_progress.quiz_completed,
                'quiz_score': module_progress.quiz_score,
                'completion_percentage': module_progress.get_completion_percentage()
            }
        
        # Get quizzes for course and modules - تعليق مؤقت بسبب حذف نموذج الواجبات
        # from assignments.models import Quiz, QuizAttempt  # Module deleted
        # course_quizzes = Quiz.objects.filter(
        #     course=course,
        #     is_active=True
        # ).prefetch_related('questions')
        course_quizzes = []  # Temporary empty list
        
        # module_quizzes = Quiz.objects.filter(
        #     module__in=modules,
        #     is_active=True
        # ).prefetch_related('questions')
        module_quizzes = []  # Temporary empty list
        
        # Get user quiz attempts - تعليق مؤقت بسبب حذف نموذج الواجبات
        # quiz_attempts = QuizAttempt.objects.filter(
        #     user=user,
        #     quiz__in=list(course_quizzes) + list(module_quizzes)
        # )
        quiz_attempts = []  # Temporary empty list
        
        # Get assignments - تعليق مؤقت بسبب حذف نموذج الواجبات
        # from assignments.models import Assignment, AssignmentSubmission  # Module deleted
        # assignments = Assignment.objects.filter(
        #     course=course,
        #     is_active=True
        # ).prefetch_related('questions', 'questions__answers')
        assignments = []  # Temporary empty list
        
        # Get user assignment submissions - تعليق مؤقت بسبب حذف نموذج الواجبات
        # assignment_submissions = AssignmentSubmission.objects.filter(
        #     user=user,
        #     assignment__in=assignments
        # ).select_related('assignment')
        assignment_submissions = []  # Temporary empty list
        
        # Get exams - تعليق مؤقت بسبب حذف نموذج الواجبات
        # from assignments.models import Exam, UserExamAttempt  # Module deleted
        # exams = Exam.objects.filter(
        #     course=course,
        #     is_active=True
        # ).prefetch_related('questions', 'questions__answers')
        exams = []  # Temporary empty list
        
        # Get user exam attempts - تعليق مؤقت بسبب حذف نموذج الواجبات
        # exam_attempts = UserExamAttempt.objects.filter(
        #     user=user,
        #     exam__in=exams
        # ).select_related('exam')
        exam_attempts = []  # Temporary empty list
        
        # Get certificate if exists - تعليق مؤقت بسبب حذف نموذج الشهادات
        # from certificates.models import Certificate  # Module deleted
        # certificate = Certificate.objects.filter(
        #     user=user,
        #     course=course,
        #     status='active'
        # ).first()
        certificate = None  # Temporary value
        
        # Prepare modules data
        modules_data = []
        total_lessons = 0
        completed_lessons = 0
        
        for module in modules:
            module_progress = module_progress_data.get(module.id, {})
            
            # Get lessons for this module
            lessons = module.lessons.filter(is_active=True).order_by('order')
            module_lessons = []
            
            for lesson in lessons:
                total_lessons += 1
                # For now, we'll assume lesson completion based on module progress
                # In a real implementation, you'd have lesson-level progress tracking
                lesson_completed = module_progress.get('is_completed', False)
                if lesson_completed:
                    completed_lessons += 1
                
                # Generate bunny_video_url if bunny_video_id exists (for private embed with token)
                bunny_video_url = None
                if lesson.bunny_video_id:
                    from content.bunny_utils import get_bunny_private_embed_url
                    # Use private embed URL with token for DRM protected videos
                    bunny_video_url = get_bunny_private_embed_url(
                        video_id=lesson.bunny_video_id,
                        user_id=request.user.id if request.user.is_authenticated else None,
                        expires_in=3600  # 1 hour
                    )
                
                module_lessons.append({
                    'id': lesson.id,
                    'title': lesson.title,
                    'description': lesson.description,
                    'lesson_type': lesson.lesson_type,
                    'duration_minutes': lesson.duration_minutes,
                    'order': lesson.order,
                    'completed': lesson_completed,
                    'video_url': lesson.video_url,
                    'bunny_video_id': lesson.bunny_video_id,
                    'bunny_video_url': bunny_video_url,
                    'content': lesson.content,
                    'resources': [
                        {
                            'id': resource.id,
                            'title': resource.title,
                            'description': resource.description,
                            'resource_type': resource.resource_type,
                            'file_url': resource.file.url if resource.file else None,
                            'url': resource.url,
                            'is_downloadable': resource.is_downloadable
                        }
                        for resource in lesson.lesson_resources.filter(is_public=True)
                    ]
                })
            
            # Get module quiz - DISABLED
            # module_quiz = module_quizzes.filter(module=module).first()
            module_quiz = None  # Quiz functionality disabled
            module_quiz_data = None
            # if module_quiz:
            #     quiz_attempt = quiz_attempts.filter(quiz=module_quiz).first()
            #     module_quiz_data = {
            #         'id': module_quiz.id,
            #         'title': module_quiz.title,
            #         'description': module_quiz.description,
            #         'time_limit': module_quiz.time_limit,
            #         'pass_mark': module_quiz.pass_mark,
            #         'total_questions': module_quiz.get_total_questions(),
            #         'attempted': quiz_attempt is not None,
            #         'score': quiz_attempt.score if quiz_attempt else None,
            #         'passed': quiz_attempt.passed if quiz_attempt else None,
            #         'attempt_number': quiz_attempt.attempt_number if quiz_attempt else 0
            #     }
            
            modules_data.append({
                'id': module.id,
                'name': module.name,
                'description': module.description,
                'order': module.order,
                'video_url': module.video.url if module.video else None,
                'video_duration': module.video_duration,
                'pdf_url': module.pdf.url if module.pdf else None,
                'note': module.note,
                'lessons': module_lessons,
                'total_lessons': len(module_lessons),
                'completed_lessons': len([l for l in module_lessons if l['completed']]),
                'progress': module_progress.get('completion_percentage', 0),
                'is_completed': module_progress.get('is_completed', False),
                'quiz': module_quiz_data
            })
        
        # Prepare course data
        course_data = {
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'short_description': course.short_description,
            'image': request.build_absolute_uri(course.image.url) if course.image else None,
            'category': course.category.name if course.category else None,
            'level': course.level,
            'instructor': course.instructors.first().profile.name if course.instructors.exists() and hasattr(course.instructors.first(), 'profile') else 'غير محدد',
            'instructor_avatar': request.build_absolute_uri(course.instructors.first().profile.image_profile.url) if course.instructors.exists() and hasattr(course.instructors.first(), 'profile') and course.instructors.first().profile.image_profile else None,
            'rating': course.average_rating,
            'total_students': course.total_enrollments,
            'duration': sum(module['video_duration'] for module in modules_data),
            'modules': modules_data,
            'total_modules': len(modules_data),
            'total_lessons': total_lessons,
            'completed_lessons': completed_lessons,
            'overall_progress': user_progress.overall_progress,
            'status': user_progress.status,
            'enrolled_date': enrollment.enrollment_date,
            'last_accessed': user_progress.last_accessed,
            'time_spent_minutes': user_progress.time_spent_minutes,
            'has_final_exam': False,  # Exam functionality disabled
            'certificate': {
                'id': certificate.certificate_id if certificate else None,
                'status': certificate.status if certificate else None,
                'date_issued': certificate.date_issued if certificate else None,
                'download_url': certificate.get_download_url() if certificate else None
            } if certificate else None
        }
        
        # Prepare assignments data - DISABLED
        assignments_data = []
        # for assignment in assignments:
        #     submission = assignment_submissions.filter(assignment=assignment).first()
        #     assignments_data.append({
        #         'id': assignment.id,
        #         'title': assignment.title,
        #         'description': assignment.description,
        #         'due_date': assignment.due_date,
        #         'points': assignment.points,
        #         'allow_late_submissions': assignment.allow_late_submissions,
        #         'has_questions': assignment.has_questions,
        #         'has_file_upload': assignment.has_file_upload,
        #         'total_questions': assignment.get_questions_count(),
        #         'submitted': submission is not None,
        #         'submission_status': submission.status if submission else None,
        #         'grade': submission.grade if submission else None,
        #         'feedback': submission.feedback if submission else None,
        #         'is_overdue': assignment.is_overdue()
        #     })
        
        # Prepare quizzes data - DISABLED
        quizzes_data = []
        # all_quizzes = list(course_quizzes) + list(module_quizzes)
        # # Remove duplicates based on quiz ID
        # seen_quiz_ids = set()
        # unique_quizzes = []
        # for quiz in all_quizzes:
        #     if quiz.id not in seen_quiz_ids:
        #         seen_quiz_ids.add(quiz.id)
        #         unique_quizzes.append(quiz)
        
        # for quiz in unique_quizzes:
        #     attempt = quiz_attempts.filter(quiz=quiz).first()
        #     quizzes_data.append({
        #         'id': quiz.id,
        #         'title': quiz.title,
        #         'description': quiz.description,
        #         'time_limit': quiz.time_limit,
        #         'pass_mark': quiz.pass_mark,
        #         'total_points': quiz.get_total_points(),
        #         'total_questions': quiz.questions.count(),
        #         'allow_multiple_attempts': True,  # Default value since field doesn't exist
        #         'max_attempts': None,  # Default value since field doesn't exist
        #         'attempted': attempt is not None,
        #         'score': attempt.score if attempt else None,
        #         'passed': attempt.passed if attempt else None,
        #         'attempt_number': attempt.attempt_number if attempt else 0
        #     })
        
        # Prepare exams data - DISABLED
        exams_data = []
        # for exam in exams:
        #     attempt = exam_attempts.filter(exam=exam).first()
        #     exams_data.append({
        #         'id': exam.id,
        #         'title': exam.title,
        #         'description': exam.description,
        #         'time_limit': exam.time_limit,
        #         'pass_mark': exam.pass_mark,
        #         'is_final': exam.is_final,
        #         'total_points': exam.total_points,
        #         'total_questions': exam.questions.count(),
        #         'allow_multiple_attempts': exam.allow_multiple_attempts,
        #         'max_attempts': exam.max_attempts,
        #         'attempted': attempt is not None,
        #         'score': attempt.score if attempt else None,
        #         'passed': attempt.passed if attempt else None,
        #         'attempt_number': attempt.attempt_number if attempt else 0
        #     })
        
        # Get final exam data if exists - DISABLED
        final_exam_data = None
        # final_exam = exams.filter(is_final=True).first()
        final_exam = None  # Exam functionality disabled
        if final_exam:
            # Get user's previous attempts for final exam - تعليق مؤقت بسبب حذف نموذج الواجبات
            # from assignments.models import UserExamAttempt  # Module deleted
            # previous_attempts = UserExamAttempt.objects.filter(
            #     user=user,
            #     exam=final_exam
            # ).order_by('-attempt_number')
            previous_attempts = []  # Temporary empty list
            
            final_exam_data = {
                'id': final_exam.id,
                'title': final_exam.title,
                'description': final_exam.description,
                'time_limit': final_exam.time_limit,
                'pass_mark': final_exam.pass_mark,
                'total_points': final_exam.total_points,
                'total_questions': final_exam.questions.count(),
                'allow_multiple_attempts': final_exam.allow_multiple_attempts,
                'max_attempts': final_exam.max_attempts,
                'show_answers_after': final_exam.show_answers_after,
                'previous_attempts': [
                    {
                        'id': attempt.id,
                        'attempt_number': attempt.attempt_number,
                        'score': attempt.score,
                        'passed': attempt.passed,
                        'start_time': attempt.start_time,
                        'end_time': attempt.end_time
                    }
                    for attempt in previous_attempts
                ],
                'questions': []
            }
            
            # Get questions with answers
            questions = final_exam.questions.all().order_by('order').prefetch_related('answers')
            for question in questions:
                question_data = {
                    'id': question.id,
                    'text': question.text,
                    'question_type': question.question_type,
                    'points': question.points,
                    'explanation': question.explanation,
                    'image': request.build_absolute_uri(question.image.url) if question.image else None,
                    'order': question.order,
                    'answers': []
                }
                
                # Get answers
                answers = question.answers.all().order_by('order')
                for answer in answers:
                    question_data['answers'].append({
                        'id': answer.id,
                        'text': answer.text,
                        'is_correct': answer.is_correct,
                        'explanation': answer.explanation,
                        'order': answer.order
                    })
                
                final_exam_data['questions'].append(question_data)

        return Response({
            'course': course_data,
            'assignments': assignments_data,
            'quizzes': quizzes_data,
            'exams': exams_data,
            'final_exam': final_exam_data,
            'enrollment': {
                'id': enrollment.id,
                'status': enrollment.status,
                'progress': enrollment.progress,
                'enrollment_date': enrollment.enrollment_date,
                'completion_date': enrollment.completion_date,
                'last_accessed': enrollment.last_accessed
            }
        }, status=status.HTTP_200_OK)
        
    except Course.DoesNotExist:
        return Response({
            'error': 'الدورة غير موجودة'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in course_tracking_data: {str(e)}", exc_info=True)
        return Response({
            'error': 'حدث خطأ أثناء جلب بيانات الدورة',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
