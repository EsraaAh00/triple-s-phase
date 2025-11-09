from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import HttpResponse

from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress,
    QuestionBankProduct, QuestionBankProductEnrollment,
    QuestionBankChapter, QuestionBankTopic, 
    FlashcardProduct, FlashcardProductEnrollment,
    FlashcardChapter, FlashcardTopic
)
from .serializers import (
    AssessmentSerializer, AssessmentDetailSerializer, AssessmentCreateSerializer,
    QuestionBankSerializer, AssessmentQuestionsSerializer,
    StudentSubmissionSerializer, StudentSubmissionDetailSerializer,
    StudentAnswerSerializer, StudentAnswerSubmissionSerializer,
    AssessmentSubmissionSerializer, FlashcardSerializer,
    StudentFlashcardProgressSerializer, AssessmentStatsSerializer,
    QuestionBankStatsSerializer, QuestionBankChapterSerializer, QuestionBankTopicSerializer,
    FlashcardChapterSerializer, FlashcardTopicSerializer,
    QuestionBankProductSerializer, QuestionBankProductEnrollmentSerializer,
    FlashcardProductSerializer, FlashcardProductEnrollmentSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for assessment views"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000  # زيادة الحد الأقصى للسماح بأعداد أكبر
    
    def get_page_size(self, request):
        """Get page size from request, using requested size as both default and max"""
        if self.page_size_query_param:
            page_size = request.query_params.get(self.page_size_query_param)
            if page_size is not None:
                try:
                    page_size = int(page_size)
                    if page_size > 0:
                        # استخدام العدد المحدد من الطلب مباشرة
                        # تحديث الحد الأقصى ليكون نفس العدد المطلوب
                        self.max_page_size = max(page_size, self.max_page_size)
                        print(f"=== PAGINATION DEBUG ===")
                        print(f"Requested page_size: {page_size}")
                        print(f"Updated max_page_size: {self.max_page_size}")
                        print(f"Final page_size: {page_size}")
                        return page_size
                except (KeyError, ValueError):
                    pass
        return self.page_size


class QuestionBankFilter(filters.FilterSet):
    """Custom filter for QuestionBank to support multiple product and topic filtering"""
    product__in = filters.BaseInFilter(field_name='product', lookup_expr='in')
    topic__in = filters.BaseInFilter(field_name='topic', lookup_expr='in')
    chapter__in = filters.BaseInFilter(field_name='topic__chapter', lookup_expr='in')
    random = filters.BooleanFilter(method='filter_random')
    
    class Meta:
        model = QuestionBank
        fields = ['question_type', 'difficulty_level', 'product', 'topic', 'created_by', 'product__in', 'topic__in', 'chapter__in', 'random']
    
    def __init__(self, data=None, queryset=None, *, request=None, prefix=None):
        super().__init__(data, queryset, request=request, prefix=prefix)
        print(f"=== QuestionBankFilter __init__ ===")
        print(f"Data: {data}")
        print(f"Initial queryset count: {queryset.count() if queryset else 'None'}")
    
    def filter_random(self, queryset, name, value):
        """Filter for random ordering"""
        print(f"=== QuestionBankFilter filter_random ===")
        print(f"Random value: {value}")
        print(f"Queryset count before random: {queryset.count()}")
        if value:
            result = queryset.order_by('?')
            print(f"Queryset count after random: {result.count()}")
            return result
        return queryset
    
    def filter_product__in(self, queryset, name, value):
        """Filter for multiple products"""
        print(f"=== QuestionBankFilter filter_product__in ===")
        print(f"Product IDs: {value}")
        print(f"Queryset count before product filter: {queryset.count()}")
        if value:
            result = queryset.filter(product__in=value)
            print(f"Queryset count after product filter: {result.count()}")
            return result
        return queryset
    
    def filter_topic__in(self, queryset, name, value):
        """Filter for multiple topics"""
        print(f"=== QuestionBankFilter filter_topic__in ===")
        print(f"Topic IDs: {value}")
        print(f"Queryset count before topic filter: {queryset.count()}")
        if value:
            result = queryset.filter(topic__in=value)
            print(f"Queryset count after topic filter: {result.count()}")
            return result
        return queryset


class AssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Assessment model"""
    
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type', 'status', 'course', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'end_date', 'total_marks']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AssessmentDetailSerializer
        elif self.action == 'create':
            return AssessmentCreateSerializer
        return AssessmentSerializer
    
    def get_queryset(self):
        """Filter assessments based on user role and permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can only see published assessments
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            queryset = queryset.filter(status='published')
        
        # Teachers can see their own assessments
        elif hasattr(user, 'profile') and user.profile.status == 'Instructor':
            queryset = queryset.filter(created_by=user)
        
        return queryset.select_related('course', 'created_by').prefetch_related('assessment_questions__question')
    
    def perform_create(self, serializer):
        """Set the creator when creating an assessment"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for an assessment"""
        assessment = self.get_object()
        questions = assessment.assessment_questions.all().order_by('order')
        serializer = AssessmentQuestionsSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_question(self, request, pk=None):
        """Add a question to an assessment"""
        assessment = self.get_object()
        question_id = request.data.get('question_id')
        marks_allocated = request.data.get('marks_allocated', 1.00)
        order = request.data.get('order', assessment.assessment_questions.count() + 1)
        
        if not question_id:
            return Response(
                {'error': 'question_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            question = QuestionBank.objects.get(id=question_id)
            assessment_question, created = AssessmentQuestions.objects.get_or_create(
                assessment=assessment,
                question=question,
                defaults={
                    'marks_allocated': marks_allocated,
                    'order': order
                }
            )
            
            if not created:
                return Response(
                    {'error': 'Question already exists in this assessment'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer = AssessmentQuestionsSerializer(assessment_question)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except QuestionBank.DoesNotExist:
            return Response(
                {'error': 'Question not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'])
    def remove_question(self, request, pk=None):
        """Remove a question from an assessment"""
        assessment = self.get_object()
        question_id = request.data.get('question_id')
        
        if not question_id:
            return Response(
                {'error': 'question_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            assessment_question = AssessmentQuestions.objects.get(
                assessment=assessment,
                question_id=question_id
            )
            assessment_question.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except AssessmentQuestions.DoesNotExist:
            return Response(
                {'error': 'Question not found in this assessment'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def submissions(self, request, pk=None):
        """Get all submissions for an assessment"""
        assessment = self.get_object()
        submissions = assessment.submissions.all().order_by('-submitted_at')
        
        # Filter by student if provided
        student_id = request.query_params.get('student_id')
        if student_id:
            submissions = submissions.filter(student_id=student_id)
        
        serializer = StudentSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for an assessment"""
        assessment = self.get_object()
        
        stats = {
            'total_submissions': assessment.submissions.count(),
            'submitted_count': assessment.submissions.filter(status='submitted').count(),
            'graded_count': assessment.submissions.filter(status='graded').count(),
            'average_score': assessment.submissions.filter(
                status__in=['submitted', 'graded']
            ).aggregate(avg_score=Avg('total_score'))['avg_score'] or 0,
            'pass_rate': 0
        }
        
        # Calculate pass rate
        total_submitted = stats['submitted_count'] + stats['graded_count']
        if total_submitted > 0:
            passed_count = assessment.submissions.filter(is_passed=True).count()
            stats['pass_rate'] = (passed_count / total_submitted) * 100
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def my_assessments(self, request):
        """Get assessments created by the current user"""
        assessments = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_assessments(self, request):
        """Get assessments available to the current user (for students)"""
        now = timezone.now()
        assessments = self.get_queryset().filter(
            status='published',
            start_date__lte=now
        ).filter(
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        )
        
        serializer = self.get_serializer(assessments, many=True)
        return Response(serializer.data)


class QuestionBankViewSet(viewsets.ModelViewSet):
    """ViewSet for QuestionBank model"""
    
    queryset = QuestionBank.objects.all()
    serializer_class = QuestionBankSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = QuestionBankFilter
    search_fields = ['question_text', 'tags', 'product__title', 'topic__title']
    ordering_fields = ['created_at', 'difficulty_level']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter questions based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        print(f"=== QuestionBankViewSet get_queryset ===")
        print(f"Request params: {self.request.query_params}")
        print(f"User: {user}")
        print(f"User ID: {user.id}")
        print(f"User username: {user.username}")
        print(f"User has profile: {hasattr(user, 'profile')}")
        if hasattr(user, 'profile'):
            print(f"Profile status: {user.profile.status}")
        print(f"Initial queryset count: {queryset.count()}")
        
        # Students can see questions from published products OR from published assessments
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Show questions from published products OR from published assessments
            queryset = queryset.filter(
                Q(product__status='published') | 
                Q(assessment_questions__assessment__status='published')
            ).distinct()
            print(f"After student filter count: {queryset.count()}")
        else:
            # For teachers/admins, show all questions
            print(f"Teacher/Admin access - showing all questions")
            print(f"User has profile: {hasattr(user, 'profile')}")
            if hasattr(user, 'profile'):
                print(f"Profile status: {user.profile.status}")
        
        final_queryset = queryset.select_related('created_by', 'product', 'topic')
        print(f"Final queryset count: {final_queryset.count()}")
        return final_queryset
    
    def perform_create(self, serializer):
        """Set the creator when creating a question"""
        print("=== CREATING QUESTION ===")
        print("Request data:", self.request.data)
        print("User:", self.request.user)
        print("Serializer validated data:", serializer.validated_data)
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get questions grouped by type"""
        question_type = request.query_params.get('type')
        if question_type:
            questions = self.get_queryset().filter(question_type=question_type)
        else:
            questions = self.get_queryset()
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_difficulty(self, request):
        """Get questions grouped by difficulty"""
        difficulty = request.query_params.get('difficulty')
        if difficulty:
            questions = self.get_queryset().filter(difficulty_level=difficulty)
        else:
            questions = self.get_queryset()
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get question bank statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_questions': queryset.count(),
            'by_type': queryset.values('question_type').annotate(count=Count('id')),
            'by_difficulty': queryset.values('difficulty_level').annotate(count=Count('id')),
            'by_course': queryset.values('course__title').annotate(count=Count('id')),
            'recent_questions': queryset.order_by('-created_at')[:5].values('id', 'question_text', 'question_type', 'created_at'),
        }
        
        return Response(stats)
    
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get questions for a specific course"""
        course_id = request.query_params.get('course_id')
        if course_id:
            questions = self.get_queryset().filter(course_id=course_id)
        else:
            questions = self.get_queryset()
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get question bank statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_questions': queryset.count(),
            'questions_by_type': dict(queryset.values_list('question_type').annotate(
                count=Count('id')
            )),
            'questions_by_difficulty': dict(queryset.values_list('difficulty_level').annotate(
                count=Count('id')
            )),
            'most_used_questions': list(queryset.annotate(
                usage_count=Count('assessment_questions')
            ).order_by('-usage_count')[:10].values('id', 'question_text', 'usage_count'))
        }
        
        serializer = QuestionBankStatsSerializer(stats)
        return Response(serializer.data)


class StudentSubmissionViewSet(viewsets.ModelViewSet):
    """ViewSet for StudentSubmission model"""
    
    queryset = StudentSubmission.objects.all()
    serializer_class = StudentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['assessment', 'student', 'status', 'is_passed']
    search_fields = ['assessment__title', 'student__username']
    ordering_fields = ['submitted_at', 'total_score', 'percentage']
    ordering = ['-submitted_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return StudentSubmissionDetailSerializer
        return StudentSubmissionSerializer
    
    def get_queryset(self):
        """Filter submissions based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can only see their own submissions
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            queryset = queryset.filter(student=user)
        
        # Teachers can see submissions for their assessments
        elif hasattr(user, 'profile') and user.profile.status == 'Instructor':
            queryset = queryset.filter(assessment__created_by=user)
        
        return queryset.select_related('student', 'assessment', 'graded_by').prefetch_related('answers__question')
    
    @action(detail=True, methods=['post'])
    def submit_assessment(self, request, pk=None):
        """Submit an assessment with answers"""
        submission = self.get_object()
        
        if submission.status == 'submitted':
            return Response(
                {'error': 'Assessment already submitted'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        answers_data = request.data.get('answers', [])
        if not answers_data:
            return Response(
                {'error': 'Answers are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create answers
        for answer_data in answers_data:
            answer_data['submission'] = submission
            StudentAnswer.objects.create(**answer_data)
        
        # Update submission
        submission.status = 'submitted'
        submission.submitted_at = timezone.now()
        
        # Calculate total score
        total_score = sum(
            answer.marks_obtained for answer in submission.answers.all()
        )
        submission.total_score = total_score
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def grade(self, request, pk=None):
        """Grade a submission (for teachers)"""
        submission = self.get_object()
        
        if submission.status not in ['submitted', 'graded']:
            return Response(
                {'error': 'Can only grade submitted assessments'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update submission
        submission.status = 'graded'
        submission.graded_by = request.user
        submission.graded_at = timezone.now()
        submission.feedback = request.data.get('feedback', '')
        
        # Update individual answers if provided
        answers_data = request.data.get('answers', [])
        for answer_data in answers_data:
            try:
                answer = submission.answers.get(question_id=answer_data['question_id'])
                answer.marks_obtained = answer_data.get('marks_obtained', answer.marks_obtained)
                answer.is_correct = answer_data.get('is_correct', answer.is_correct)
                answer.save()
            except StudentAnswer.DoesNotExist:
                continue
        
        # Recalculate total score
        total_score = sum(
            answer.marks_obtained for answer in submission.answers.all()
        )
        submission.total_score = total_score
        submission.save()
        
        serializer = self.get_serializer(submission)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_submissions(self, request):
        """Get current user's submissions"""
        submissions = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)


class StudentAnswerViewSet(viewsets.ModelViewSet):
    """ViewSet for StudentAnswer model"""
    
    queryset = StudentAnswer.objects.all()
    serializer_class = StudentAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['submission', 'question', 'is_correct', 'is_auto_graded']
    ordering_fields = ['answered_at', 'marks_obtained']
    ordering = ['answered_at']
    
    def get_queryset(self):
        """Filter answers based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can only see their own answers
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            queryset = queryset.filter(submission__student=user)
        
        # Teachers can see answers for their assessments
        elif hasattr(user, 'profile') and user.profile.status == 'Instructor':
            queryset = queryset.filter(submission__assessment__created_by=user)
        
        return queryset.select_related('submission', 'question')


class FlashcardViewSet(viewsets.ModelViewSet):
    """ViewSet for Flashcard model"""
    
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['created_by', 'product', 'topic', 'product__status']
    search_fields = ['front_text', 'back_text']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter flashcards based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see flashcards from published products or assessments
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Show flashcards from published products OR from published assessments
            queryset = queryset.filter(
                Q(product__status='published') | 
                Q(related_question__assessment_questions__assessment__status='published')
            ).distinct()
        else:
            # For users without profile or non-students, show all flashcards
            # This ensures the API works for testing and development
            pass
        
        # Apply additional filtering based on query parameters
        product_ids = self.request.query_params.getlist('product')
        topic_ids = self.request.query_params.getlist('topic')
        
        if product_ids:
            queryset = queryset.filter(product__id__in=product_ids)
        
        if topic_ids:
            queryset = queryset.filter(topic__id__in=topic_ids)
        
        return queryset.select_related('created_by', 'related_question', 'product', 'topic', 'topic__chapter')
    
    def perform_create(self, serializer):
        """Set the creator when creating a flashcard"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Record a flashcard review"""
        flashcard = self.get_object()
        student = request.user
        is_correct = request.data.get('is_correct', False)
        
        progress, created = StudentFlashcardProgress.objects.get_or_create(
            student=student,
            flashcard=flashcard,
            defaults={
                'times_reviewed': 1,
                'correct_count': 1 if is_correct else 0,
                'last_reviewed': timezone.now()
            }
        )
        
        if not created:
            progress.times_reviewed += 1
            if is_correct:
                progress.correct_count += 1
            progress.last_reviewed = timezone.now()
            progress.save()
        
        serializer = StudentFlashcardProgressSerializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get flashcards statistics"""
        queryset = self.get_queryset()
        user = request.user
        
        # Filter by user if teacher
        if hasattr(user, 'profile') and user.profile.status == 'Teacher':
            queryset = queryset.filter(created_by=user)
        
        stats = {
            'total_flashcards': queryset.count(),
            'flashcards_by_topic': dict(queryset.values_list('topic__title').annotate(
                count=Count('id')
            )),
            'flashcards_by_product': dict(queryset.values_list('product__title').annotate(
                count=Count('id')
            )),
            'recent_flashcards': queryset.order_by('-created_at')[:5].values(
                'id', 'front_text', 'back_text', 'created_at'
            ),
        }
        
        return Response(stats)


class StudentFlashcardProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for StudentFlashcardProgress model (read-only)"""
    
    queryset = StudentFlashcardProgress.objects.all()
    serializer_class = StudentFlashcardProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['student', 'flashcard', 'difficulty_level']
    ordering_fields = ['last_reviewed', 'accuracy_rate']
    ordering = ['-last_reviewed']
    
    def get_queryset(self):
        """Filter progress based on user role"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can only see their own progress
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            queryset = queryset.filter(student=user)
        
        return queryset.select_related('student', 'flashcard')
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get current user's flashcard progress"""
        progress = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(progress, many=True)
        return Response(serializer.data)


# New ViewSets for Chapter and Topic models
class QuestionBankChapterViewSet(viewsets.ModelViewSet):
    """ViewSet for QuestionBankChapter model"""
    
    queryset = QuestionBankChapter.objects.all()
    serializer_class = QuestionBankChapterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['product', 'order', 'title']
    
    def get_queryset(self):
        """Filter chapters based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see chapters from courses they're enrolled in
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Add enrollment filter here if needed
            pass
        
        return queryset.select_related('product', 'created_by').prefetch_related('topics')
    
    def perform_create(self, serializer):
        """Set the creator when creating a chapter"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get all topics for a chapter"""
        chapter = self.get_object()
        topics = chapter.topics.all().order_by('order')
        serializer = QuestionBankTopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get chapters for a specific product"""
        product_id = request.query_params.get('product_id')
        if product_id:
            chapters = self.get_queryset().filter(product_id=product_id)
        else:
            chapters = self.get_queryset()
        
        serializer = self.get_serializer(chapters, many=True)
        return Response(serializer.data)


class QuestionBankTopicViewSet(viewsets.ModelViewSet):
    """ViewSet for QuestionBankTopic model"""
    
    queryset = QuestionBankTopic.objects.all()
    serializer_class = QuestionBankTopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['chapter', 'chapter__product', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['chapter', 'order', 'title']
    
    def get_queryset(self):
        """Filter topics based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see topics from courses they're enrolled in
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Add enrollment filter here if needed
            pass
        
        return queryset.select_related('chapter', 'chapter__product', 'created_by')
    
    def perform_create(self, serializer):
        """Set the creator when creating a topic"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a topic"""
        topic = self.get_object()
        questions = topic.questions.all()
        serializer = QuestionBankSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_chapter(self, request):
        """Get topics for a specific chapter"""
        chapter_id = request.query_params.get('chapter_id')
        if chapter_id:
            topics = self.get_queryset().filter(chapter_id=chapter_id)
        else:
            topics = self.get_queryset()
        
        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def excel_template(self, request):
        """Download Excel template for Question Bank import"""
        import pandas as pd
        import io
        
        # Define columns with separate answer columns
        columns = ['question_text', 'question_type', 'correct_answer', 'difficulty_level', 
                  'answer1', 'answer2', 'answer3', 'answer4', 'answer5', 
                  'explanation', 'tags']
        
        # Example rows: MCQ and True/False
        examples = [
            {
                'question_text': 'What is 2 + 2?',
                'question_type': 'mcq',
                'correct_answer': '4',
                'difficulty_level': 'easy',
                'answer1': '1',
                'answer2': '2',
                'answer3': '3',
                'answer4': '4',
                'answer5': '5',
                'explanation': 'Basic addition',
                'tags': 'math,arithmetic'
            },
            {
                'question_text': 'The capital of France is Paris',
                'question_type': 'true_false',
                'correct_answer': 'True',
                'difficulty_level': 'easy',
                'answer1': '',
                'answer2': '',
                'answer3': '',
                'answer4': '',
                'answer5': '',
                'explanation': 'Paris is indeed the capital of France',
                'tags': 'geography,france'
            }
        ]
        
        df = pd.DataFrame(examples, columns=columns)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='QuestionsTemplate')
        buffer.seek(0)
        
        resp = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        resp['Content-Disposition'] = 'attachment; filename="question_bank_template.xlsx"'
        return resp
    
    @action(detail=True, methods=['post'])
    def import_excel(self, request, pk=None):
        """Import questions from Excel file into this topic"""
        import pandas as pd
        import json
        
        topic = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file uploaded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        excel_file = request.FILES['file']
        
        # Validate file extension
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Read Excel file
            df = pd.read_excel(excel_file)
            
            # Expected columns for questions
            required_columns = ['question_text', 'question_type', 'correct_answer', 'difficulty_level']
            
            # Check if required columns exist
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            created_questions = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Get question data
                    question_text = str(row['question_text']).strip()
                    question_type = str(row['question_type']).strip().lower()
                    correct_answer = str(row['correct_answer']).strip()
                    difficulty_level = str(row.get('difficulty_level', 'medium')).strip().lower()
                    explanation = str(row.get('explanation', '')).strip() if pd.notna(row.get('explanation')) else ''
                    tags_str = str(row.get('tags', '')).strip() if pd.notna(row.get('tags')) else ''
                    
                    # Validate question type
                    valid_types = ['mcq', 'true_false', 'short_answer', 'essay', 'fill_blank', 'matching', 'ordering']
                    if question_type not in valid_types:
                        errors.append(f'Row {index + 2}: Invalid question type "{question_type}"')
                        continue
                    
                    # Validate difficulty level
                    valid_difficulties = ['easy', 'medium', 'hard']
                    if difficulty_level not in valid_difficulties:
                        difficulty_level = 'medium'
                    
                    # Parse options for MCQ questions
                    options = []
                    if question_type == 'mcq':
                        # Try to read from separate answer columns (answer1, answer2, etc.)
                        answer_columns = [f'answer{i}' for i in range(1, 6)]
                        found_answers = []
                        
                        for col in answer_columns:
                            if col in df.columns and pd.notna(row.get(col)):
                                answer_val = str(row[col]).strip()
                                if answer_val:
                                    found_answers.append(answer_val)
                        
                        # If no separate columns, try the old 'options' column (backward compatibility)
                        if not found_answers and 'options' in df.columns and pd.notna(row.get('options')):
                            options_str = str(row['options']).strip()
                            # Try to parse as JSON array first
                            try:
                                found_answers = json.loads(options_str) if options_str.startswith('[') else options_str.split(',')
                            except:
                                # If not JSON, split by comma
                                found_answers = [opt.strip() for opt in options_str.split(',') if opt.strip()]
                        
                        if len(found_answers) < 2:
                            errors.append(f'Row {index + 2}: MCQ questions must have at least 2 options')
                            continue
                        
                        options = found_answers
                    
                    # Parse tags
                    tags = []
                    if tags_str:
                        try:
                            tags = json.loads(tags_str) if tags_str.startswith('[') else [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                        except:
                            tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                    
                    # Create question
                    question = QuestionBank.objects.create(
                        question_text=question_text,
                        question_type=question_type,
                        correct_answer=correct_answer,
                        difficulty_level=difficulty_level,
                        explanation=explanation if explanation else None,
                        options=json.dumps(options) if options else None,
                        tags=tags,
                        product=topic.chapter.product,
                        topic=topic,
                        created_by=request.user
                    )
                    
                    created_questions.append({
                        'id': question.id,
                        'question_text': question.question_text[:50] + '...' if len(question.question_text) > 50 else question.question_text
                    })
                    
                except Exception as e:
                    errors.append(f'Row {index + 2}: {str(e)}')
                    continue
            
            return Response({
                'success': True,
                'message': f'Successfully imported {len(created_questions)} questions',
                'created_count': len(created_questions),
                'errors': errors,
                'created_questions': created_questions
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Error processing Excel file: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# Enrollment Status API
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_enrollment_status(request):
    """Check enrollment status for Question Bank and Flashcards"""
    user = request.user
    
    # Check Question Bank enrollment (only active)
    question_bank_enrollments = QuestionBankProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    # Check Flashcard enrollment (only active)
    flashcard_enrollments = FlashcardProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    return Response({
        'questionBank': {
            'is_enrolled': question_bank_enrollments.exists(),
            'enrollments_count': question_bank_enrollments.count()
        },
        'flashcards': {
            'is_enrolled': flashcard_enrollments.exists(),
            'enrollments_count': flashcard_enrollments.count()
        }
    })
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get topics for a specific product"""
        product_id = request.query_params.get('product_id')
        if product_id:
            topics = self.get_queryset().filter(chapter__product_id=product_id)
        else:
            topics = self.get_queryset()
        
        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)


# Enrollment Status API
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_enrollment_status(request):
    """Check enrollment status for Question Bank and Flashcards"""
    user = request.user
    
    # Check Question Bank enrollment (only active)
    question_bank_enrollments = QuestionBankProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    # Check Flashcard enrollment (only active)
    flashcard_enrollments = FlashcardProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    return Response({
        'questionBank': {
            'is_enrolled': question_bank_enrollments.exists(),
            'enrollments_count': question_bank_enrollments.count()
        },
        'flashcards': {
            'is_enrolled': flashcard_enrollments.exists(),
            'enrollments_count': flashcard_enrollments.count()
        }
    })


class FlashcardChapterViewSet(viewsets.ModelViewSet):
    """ViewSet for FlashcardChapter model"""
    
    queryset = FlashcardChapter.objects.all()
    serializer_class = FlashcardChapterSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['product', 'order', 'title']
    
    def get_queryset(self):
        """Filter chapters based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see chapters from courses they're enrolled in
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Add enrollment filter here if needed
            pass
        
        return queryset.select_related('product', 'created_by').prefetch_related('topics')
    
    def perform_create(self, serializer):
        """Set the creator when creating a chapter"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get all topics for a chapter"""
        chapter = self.get_object()
        topics = chapter.topics.all().order_by('order')
        serializer = FlashcardTopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get chapters for a specific product"""
        product_id = request.query_params.get('product_id')
        if product_id:
            chapters = self.get_queryset().filter(product_id=product_id)
        else:
            chapters = self.get_queryset()
        
        serializer = self.get_serializer(chapters, many=True)
        return Response(serializer.data)


class FlashcardTopicViewSet(viewsets.ModelViewSet):
    """ViewSet for FlashcardTopic model"""
    
    queryset = FlashcardTopic.objects.all()
    serializer_class = FlashcardTopicSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['chapter', 'chapter__product', 'created_by']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'created_at', 'title']
    ordering = ['chapter', 'order', 'title']
    
    def get_queryset(self):
        """Filter topics based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see topics from courses they're enrolled in
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Add enrollment filter here if needed
            pass
        
        return queryset.select_related('chapter', 'chapter__product', 'created_by')
    
    def perform_create(self, serializer):
        """Set the creator when creating a topic"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def flashcards(self, request, pk=None):
        """Get all flashcards for a topic"""
        topic = self.get_object()
        flashcards = topic.flashcards.all()
        serializer = FlashcardSerializer(flashcards, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_chapter(self, request):
        """Get topics for a specific chapter"""
        chapter_id = request.query_params.get('chapter_id')
        if chapter_id:
            topics = self.get_queryset().filter(chapter_id=chapter_id)
        else:
            topics = self.get_queryset()
        
        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def excel_template(self, request):
        """Download Excel template for Flashcards import"""
        import pandas as pd
        import io
        
        columns = ['front_text', 'back_text', 'tags']
        example = [{
            'front_text': 'Capital of France?',
            'back_text': 'Paris',
            'tags': '["geography", "europe"]'
        }]
        
        df = pd.DataFrame(example, columns=columns)
        buffer = io.BytesIO()
        with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='FlashcardsTemplate')
        buffer.seek(0)
        
        resp = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        resp['Content-Disposition'] = 'attachment; filename="flashcards_template.xlsx"'
        return resp
    
    @action(detail=True, methods=['post'])
    def import_excel(self, request, pk=None):
        """Import flashcards from Excel file into this topic"""
        import pandas as pd
        import json
        
        topic = self.get_object()
        
        if 'file' not in request.FILES:
            return Response(
                {'error': 'No file uploaded'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        excel_file = request.FILES['file']
        
        # Validate file extension
        if not excel_file.name.endswith(('.xlsx', '.xls')):
            return Response(
                {'error': 'Invalid file format. Please upload an Excel file (.xlsx or .xls)'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Read Excel file
            df = pd.read_excel(excel_file)
            
            # Expected columns for flashcards
            required_columns = ['front_text', 'back_text']
            
            # Check if required columns exist
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                return Response(
                    {'error': f'Missing required columns: {", ".join(missing_columns)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            created_flashcards = []
            errors = []
            
            for index, row in df.iterrows():
                try:
                    # Get flashcard data
                    front_text = str(row['front_text']).strip()
                    back_text = str(row['back_text']).strip()
                    tags_str = str(row.get('tags', '')).strip() if pd.notna(row.get('tags')) else ''
                    
                    if not front_text or not back_text:
                        errors.append(f'Row {index + 2}: Both front_text and back_text are required')
                        continue
                    
                    # Parse tags
                    tags = []
                    if tags_str:
                        try:
                            tags = json.loads(tags_str) if tags_str.startswith('[') else [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                        except:
                            tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
                    
                    # Create flashcard
                    flashcard = Flashcard.objects.create(
                        front_text=front_text,
                        back_text=back_text,
                        tags=tags,
                        product=topic.chapter.product,
                        topic=topic,
                        created_by=request.user
                    )
                    
                    created_flashcards.append({
                        'id': flashcard.id,
                        'front_text': flashcard.front_text[:50] + '...' if len(flashcard.front_text) > 50 else flashcard.front_text
                    })
                    
                except Exception as e:
                    errors.append(f'Row {index + 2}: {str(e)}')
                    continue
            
            return Response({
                'success': True,
                'message': f'Successfully imported {len(created_flashcards)} flashcards',
                'created_count': len(created_flashcards),
                'errors': errors,
                'created_flashcards': created_flashcards
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Error processing Excel file: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


# Enrollment Status API
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_enrollment_status(request):
    """Check enrollment status for Question Bank and Flashcards"""
    user = request.user
    
    # Check Question Bank enrollment (only active)
    question_bank_enrollments = QuestionBankProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    # Check Flashcard enrollment (only active)
    flashcard_enrollments = FlashcardProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    return Response({
        'questionBank': {
            'is_enrolled': question_bank_enrollments.exists(),
            'enrollments_count': question_bank_enrollments.count()
        },
        'flashcards': {
            'is_enrolled': flashcard_enrollments.exists(),
            'enrollments_count': flashcard_enrollments.count()
        }
    })
    
    @action(detail=False, methods=['get'])
    def by_product(self, request):
        """Get topics for a specific product"""
        product_id = request.query_params.get('product_id')
        if product_id:
            topics = self.get_queryset().filter(chapter__product_id=product_id)
        else:
            topics = self.get_queryset()
        
        serializer = self.get_serializer(topics, many=True)
        return Response(serializer.data)


# Enrollment Status API
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_enrollment_status(request):
    """Check enrollment status for Question Bank and Flashcards"""
    user = request.user
    
    # Check Question Bank enrollment (only active)
    question_bank_enrollments = QuestionBankProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    # Check Flashcard enrollment (only active)
    flashcard_enrollments = FlashcardProductEnrollment.objects.filter(
        student=user,
        status='active'
    )
    
    return Response({
        'questionBank': {
            'is_enrolled': question_bank_enrollments.exists(),
            'enrollments_count': question_bank_enrollments.count()
        },
        'flashcards': {
            'is_enrolled': flashcard_enrollments.exists(),
            'enrollments_count': flashcard_enrollments.count()
        }
    })