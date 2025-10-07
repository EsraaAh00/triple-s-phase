from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import models

from courses.models import Course, Enrollment
from users.models import Profile
from content.models import Module, ModuleProgress, UserProgress, Lesson, LessonResource
from content.serializers import (
    ModuleDetailSerializer, ModuleCreateSerializer, ProgressUpdateSerializer,
    LessonSerializer, LessonDetailSerializer, LessonCreateUpdateSerializer, LessonResourceSerializer
)
from assessment.models import QuestionBank, Flashcard
from assessment.serializers import QuestionBankSerializer, FlashcardSerializer


class ModuleViewSet(ModelViewSet):
    """إدارة الوحدات"""
    queryset = Module.objects.select_related('course').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = None  # Disable pagination for now
    
    def list(self, request, *args, **kwargs):
        """Override list to ensure no pagination"""
        queryset = self.filter_queryset(self.get_queryset())
        print(f"ModuleViewSet list - Total queryset count: {queryset.count()}")
        
        # Force get all objects without pagination
        all_objects = list(queryset)
        print(f"ModuleViewSet list - All objects count: {len(all_objects)}")
        
        serializer = self.get_serializer(all_objects, many=True)
        print(f"ModuleViewSet list - Serialized data count: {len(serializer.data)}")
        
        # Return data without pagination wrapper
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """حذف وحدة مع التحقق من وجود وحدات فرعية"""
        instance = self.get_object()
        
        # Check if module has submodules
        if instance.submodules.exists():
            return Response({
                'error': 'لا يمكن حذف الوحدة لأنها تحتوي على وحدات فرعية'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if module has lessons
        if instance.lessons.exists():
            return Response({
                'error': 'لا يمكن حذف الوحدة لأنها تحتوي على دروس'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)
    
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return ModuleDetailSerializer
        elif self.action == 'create':
            return ModuleCreateSerializer
        return ModuleDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course if provided
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            print(f"Filtered by course_id: {course_id}, count: {queryset.count()}")
        
        # Filter by submodule if provided
        submodule_id = self.request.query_params.get('submodule_id')
        if submodule_id:
            queryset = queryset.filter(submodule_id=submodule_id)
        
        # Filter main modules only (no submodules)
        main_modules_only = self.request.query_params.get('main_modules_only')
        if main_modules_only and main_modules_only.lower() == 'true':
            queryset = queryset.filter(submodule__isnull=True)
        
        print(f"Final queryset count: {queryset.count()}")
        return queryset

    def retrieve(self, request, *args, **kwargs):
        """عرض تفاصيل وحدة"""
        try:
            module = self.get_object()
        except Module.DoesNotExist:
            return Response({
                'error': 'الوحدة غير موجودة'
            }, status=status.HTTP_404_NOT_FOUND)
            
        course = module.course
        user = request.user
        
        # Debug logging
        print(f"Debug - Module ID: {module.id}, Course ID: {course.id}, User: {user.id}")
        
        # Check permissions: enrolled student or instructor/admin
        is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and instructor in course.instructors.all():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        print(f"Debug - is_enrolled: {is_enrolled}, is_instructor_or_admin: {is_instructor_or_admin}")
        
        # For now, allow access to all authenticated users for testing
        # TODO: Implement proper permission checking
        if not user.is_authenticated:
            return Response({
                'error': 'يجب تسجيل الدخول للوصول لهذا المحتوى'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = self.get_serializer(module)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_progress(self, request, pk=None):
        """تحديث تقدم المستخدم في الوحدة"""
        module = self.get_object()
        course = module.course
        
        # Check if user is enrolled
        if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProgressUpdateSerializer(data=request.data)
        if serializer.is_valid():
            progress = serializer.save(user=request.user, module=module)
            
            return Response({
                'message': 'تم تحديث التقدم بنجاح',
                'progress': {
                    'is_completed': progress.is_completed,
                    'video_watched': progress.video_watched,
                    'pdf_viewed': progress.pdf_viewed,
                    'notes_read': progress.notes_read,
                    'quiz_completed': progress.quiz_completed,
                    'completion_percentage': progress.get_completion_percentage()
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'بيانات غير صحيحة',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_video_progress(self, request, pk=None):
        """تحديث تقدم مشاهدة الفيديو"""
        module = self.get_object()
        course = module.course
        
        # Check if user is enrolled
        if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة'
            }, status=status.HTTP_403_FORBIDDEN)
        
        video_progress = request.data.get('video_progress', 0)
        video_last_position = request.data.get('video_last_position', 0)
        
        # Get or create module progress
        progress, created = ModuleProgress.objects.get_or_create(
            user=request.user,
            module=module,
            defaults={'status': ModuleProgress.ProgressStatus.NOT_STARTED}
        )
        
        # Update video progress
        progress.mark_video_watched(
            progress=video_progress,
            last_position=video_last_position,
            commit=True
        )
        
        return Response({
            'message': 'تم تحديث تقدم الفيديو بنجاح',
            'video_progress': progress.video_progress,
            'video_watched': progress.video_watched,
            'completion_percentage': progress.get_completion_percentage()
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """Create a new module with better error handling"""
        try:
            # Auto-assign order if not provided or conflicts
            data = request.data.copy()
            course_id = data.get('course')
            
            # Always ensure order is provided and unique
            if course_id:
                if 'order' not in data or not data['order']:
                    # Find the next available order
                    max_order = Module.objects.filter(course_id=course_id).aggregate(
                        max_order=models.Max('order')
                    )['max_order'] or 0
                    data['order'] = max_order + 1
                else:
                    # Check if order already exists for this course
                    existing_order = Module.objects.filter(course_id=course_id, order=data['order']).exists()
                    if existing_order:
                        # Find the next available order
                        max_order = Module.objects.filter(course_id=course_id).aggregate(
                            max_order=models.Max('order')
                        )['max_order'] or 0
                        data['order'] = max_order + 1
            
            print(f"Creating module with data: {data}")
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                print(f"Serializer errors: {serializer.errors}")
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error creating module: {str(e)}")
            return Response({
                'error': 'حدث خطأ أثناء إنشاء الوحدة',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='courses/(?P<course_id>[^/.]+)')
    def course_modules(self, request, course_id=None):
        """الحصول على وحدات كورس معين"""
        try:
            course = Course.objects.get(id=course_id)
            modules = Module.objects.filter(course=course).order_by('order')
            serializer = self.get_serializer(modules, many=True)
            return Response(serializer.data)
        except Course.DoesNotExist:
            return Response({
                'error': 'الكورس غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)


# Progress-related functionality from CourseViewSet
class CourseProgressMixin:
    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        """جلب وحدات الدورة"""
        course = self.get_object()
        user = request.user
        
        # Check if user is enrolled or is the instructor/admin
        is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
        is_instructor_or_admin = False
        
        try:
            profile = user.profile
            if profile.status == 'Admin' or user.is_staff:
                is_instructor_or_admin = True
            elif profile.status == 'Instructor':
                instructor = profile.get_instructor_object()
                if instructor and instructor in course.instructors.all():
                    is_instructor_or_admin = True
        except Profile.DoesNotExist:
            pass
        
        if not is_enrolled and not is_instructor_or_admin:
            return Response({
                'error': 'يجب أن تكون مسجلاً في الدورة للوصول لهذا المحتوى'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Import here to avoid circular imports
        from .serializers import ModuleBasicSerializer
        
        modules = course.modules.all().order_by('order')
        serializer = ModuleBasicSerializer(modules, many=True, context={'request': request})
        
        return Response({
            'modules': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def submodules(self, request, pk=None):
        """Get all submodules for a specific module"""
        module = self.get_object()
        submodules = module.submodules.all().order_by('order')
        serializer = ModuleDetailSerializer(submodules, many=True, context={'request': request})
        
        return Response({
            'submodules': serializer.data,
            'parent_module': {
                'id': module.id,
                'name': module.name,
                'course': module.course.title
            }
        }, status=status.HTTP_200_OK)


class LessonViewSet(ModelViewSet):
    """CRUD for lessons"""
    queryset = Lesson.objects.select_related('module', 'module__course').all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return LessonDetailSerializer
        if self.action == 'list':
            return LessonSerializer
        return LessonCreateUpdateSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        module_id = self.request.query_params.get('module')
        course_id = self.request.query_params.get('course')
        if module_id:
            qs = qs.filter(module_id=module_id)
        if course_id:
            qs = qs.filter(module__course_id=course_id)
        return qs.order_by('order', 'created_at')

    def create(self, request, *args, **kwargs):
        """Create a new lesson with better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء إنشاء الدرس',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Update a lesson with better error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء تحديث الدرس',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LessonResourceViewSet(ModelViewSet):
    """CRUD for lesson resources (files/links)"""
    queryset = LessonResource.objects.select_related('lesson', 'lesson__module').all()
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        return LessonResourceSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson')
        module_id = self.request.query_params.get('module')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        if module_id:
            qs = qs.filter(lesson__module_id=module_id)
        return qs.order_by('order', 'created_at')

    def create(self, request, *args, **kwargs):
        """Create a new lesson resource with better error handling"""
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء إنشاء المورد',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        """Update a lesson resource with better error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            else:
                return Response({
                    'error': 'بيانات غير صحيحة',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء تحديث المورد',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# New APIs for course content
class CourseModulesWithLessonsViewSet(ModelViewSet):
    """Get all modules with their lessons for a specific course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, course_id=None):
        try:
            # Get the course
            course = get_object_or_404(Course, id=course_id)
            
            # Check if user is enrolled or is instructor/admin
            user = request.user
            is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
            is_instructor_or_admin = False
            
            try:
                profile = user.profile
                is_instructor_or_admin = (
                    profile.role in ['instructor', 'admin'] or 
                    course.instructor == user
                )
            except:
                pass
            
            if not (is_enrolled or is_instructor_or_admin):
                return Response({
                    'error': 'ليس لديك صلاحية للوصول إلى هذا الكورس'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get modules with lessons (including submodules)
            modules = Module.objects.filter(course=course, is_active=True).prefetch_related('lessons', 'submodules').order_by('order')
            
            modules_data = []
            for module in modules:
                module_data = {
                    'id': module.id,
                    'title': module.name,
                    'description': module.description,
                    'order': module.order,
                    'video_duration': module.video_duration,
                    'submodule': module.submodule.id if module.submodule else None,
                    'lessons': []
                }
                
                # Get lessons for this module
                lessons = module.lessons.filter(is_active=True).order_by('order')
                for lesson in lessons:
                    # Format duration
                    duration_text = ""
                    if lesson.duration_minutes > 0:
                        hours = lesson.duration_minutes // 60
                        minutes = lesson.duration_minutes % 60
                        if hours > 0:
                            duration_text = f"{hours}س {minutes}د" if minutes > 0 else f"{hours}س"
                        else:
                            duration_text = f"{minutes}د"
                    
                    lesson_data = {
                        'id': lesson.id,
                        'title': lesson.title,
                        'content_type': lesson.lesson_type,
                        'duration': duration_text,
                        'order': lesson.order,
                        'is_completed': False,  # This should be calculated based on user progress
                        'module_name': module.name,
                        'module_id': module.id
                    }
                    module_data['lessons'].append(lesson_data)
                
                modules_data.append(module_data)
            
            return Response({
                'modules': modules_data,
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'description': course.description
                }
            })
            
        except Course.DoesNotExist:
            return Response({
                'error': 'الكورس غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء جلب البيانات',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourseQuestionBankViewSet(ModelViewSet):
    """Get all question banks for all lessons in a specific course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, course_id=None):
        try:
            # Get the course
            course = get_object_or_404(Course, id=course_id)
            
            # Check if user is enrolled or is instructor/admin
            user = request.user
            is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
            is_instructor_or_admin = False
            
            try:
                profile = user.profile
                is_instructor_or_admin = (
                    profile.role in ['instructor', 'admin'] or 
                    course.instructor == user
                )
            except:
                pass
            
            if not (is_enrolled or is_instructor_or_admin):
                return Response({
                    'error': 'ليس لديك صلاحية للوصول إلى هذا الكورس'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get all questions for all lessons in this course
            questions = QuestionBank.objects.filter(
                lesson__module__course=course,
                lesson__is_active=True,
                lesson__module__is_active=True
            ).select_related('lesson', 'lesson__module').order_by('lesson__module__order', 'lesson__order', 'id')
            
            # Group questions by modules
            modules_data = {}
            for question in questions:
                if question.lesson and question.lesson.module:
                    module_id = question.lesson.module.id
                    module_name = question.lesson.module.name
                    
                    if module_id not in modules_data:
                        modules_data[module_id] = {
                            'id': module_id,
                            'name': module_name,
                            'order': question.lesson.module.order,
                            'lessons': {}
                        }
                    
                    lesson_id = question.lesson.id
                    lesson_title = question.lesson.title
                    
                    if lesson_id not in modules_data[module_id]['lessons']:
                        modules_data[module_id]['lessons'][lesson_id] = {
                            'id': lesson_id,
                            'title': lesson_title,
                            'order': question.lesson.order,
                            'questions': []
                        }
                    
                    question_data = {
                        'id': question.id,
                        'question': question.question_text,
                        'type': question.question_type,
                        'difficulty': question.difficulty_level,
                        'options': question.options,
                        'correct_answer': question.correct_answer,
                        'explanation': question.explanation,
                        'tags': question.tags
                    }
                    modules_data[module_id]['lessons'][lesson_id]['questions'].append(question_data)
            
            # Convert to list format
            modules_list = []
            for module in sorted(modules_data.values(), key=lambda x: x['order']):
                module['lessons'] = list(module['lessons'].values())
                modules_list.append(module)
            
            return Response({
                'modules': modules_list,
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'description': course.description
                },
                'total_questions': sum(len(lesson['questions']) for module in modules_list for lesson in module['lessons'])
            })
            
        except Course.DoesNotExist:
            return Response({
                'error': 'الكورس غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء جلب البيانات',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourseFlashcardsViewSet(ModelViewSet):
    """Get all flashcards for all questions in all lessons of a specific course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request, course_id=None):
        try:
            # Get the course
            course = get_object_or_404(Course, id=course_id)
            
            # Check if user is enrolled or is instructor/admin
            user = request.user
            is_enrolled = course.enrollments.filter(student=user, status__in=['active', 'completed']).exists()
            is_instructor_or_admin = False
            
            try:
                profile = user.profile
                is_instructor_or_admin = (
                    profile.role in ['instructor', 'admin'] or 
                    course.instructor == user
                )
            except:
                pass
            
            if not (is_enrolled or is_instructor_or_admin):
                return Response({
                    'error': 'ليس لديك صلاحية للوصول إلى هذا الكورس'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get all flashcards for all lessons in this course
            flashcards = Flashcard.objects.filter(
                lesson__module__course=course,
                lesson__is_active=True,
                lesson__module__is_active=True
            ).select_related(
                'lesson', 
                'lesson__module'
            ).order_by(
                'lesson__module__order', 
                'lesson__order', 
                'id'
            )
            
            # Group flashcards by modules
            modules_data = {}
            for flashcard in flashcards:
                if flashcard.lesson and flashcard.lesson.module:
                    module_id = flashcard.lesson.module.id
                    module_name = flashcard.lesson.module.name
                    
                    if module_id not in modules_data:
                        modules_data[module_id] = {
                            'id': module_id,
                            'name': module_name,
                            'order': flashcard.lesson.module.order,
                            'lessons': {}
                        }
                    
                    lesson_id = flashcard.lesson.id
                    lesson_title = flashcard.lesson.title
                    
                    if lesson_id not in modules_data[module_id]['lessons']:
                        modules_data[module_id]['lessons'][lesson_id] = {
                            'id': lesson_id,
                            'title': lesson_title,
                            'order': flashcard.lesson.order,
                            'flashcards': []
                        }
                    
                    flashcard_data = {
                        'id': flashcard.id,
                        'front': flashcard.front_text,
                        'back': flashcard.back_text,
                        'front_image': flashcard.front_image.url if flashcard.front_image else None,
                        'back_image': flashcard.back_image.url if flashcard.back_image else None,
                        'category': module_name
                    }
                    modules_data[module_id]['lessons'][lesson_id]['flashcards'].append(flashcard_data)
            
            # Convert to list format
            modules_list = []
            for module in sorted(modules_data.values(), key=lambda x: x['order']):
                module['lessons'] = list(module['lessons'].values())
                modules_list.append(module)
            
            return Response({
                'modules': modules_list,
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'description': course.description
                },
                'total_flashcards': sum(len(lesson['flashcards']) for module in modules_list for lesson in module['lessons'])
            })
            
        except Course.DoesNotExist:
            return Response({
                'error': 'الكورس غير موجود'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': 'حدث خطأ أثناء جلب البيانات',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add this to the end of the file to make the mixin available for import
__all__ = ['ModuleViewSet', 'CourseProgressMixin', 'LessonViewSet', 'LessonResourceViewSet', 
           'CourseModulesWithLessonsViewSet', 'CourseQuestionBankViewSet', 'CourseFlashcardsViewSet']
