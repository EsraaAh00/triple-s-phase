from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress
)
from .serializers import (
    AssessmentSerializer, AssessmentDetailSerializer, AssessmentCreateSerializer,
    QuestionBankSerializer, AssessmentQuestionsSerializer,
    StudentSubmissionSerializer, StudentSubmissionDetailSerializer,
    StudentAnswerSerializer, StudentAnswerSubmissionSerializer,
    AssessmentSubmissionSerializer, FlashcardSerializer,
    StudentFlashcardProgressSerializer, AssessmentStatsSerializer,
    QuestionBankStatsSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for assessment views"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


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
    filterset_fields = ['question_type', 'difficulty_level', 'lesson', 'lesson__module__course', 'created_by']
    search_fields = ['question_text', 'tags', 'lesson__title', 'lesson__module__course__title']
    ordering_fields = ['created_at', 'difficulty_level']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter questions based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can only see questions from published assessments
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            # Only show questions that are part of published assessments
            queryset = queryset.filter(
                assessment_questions__assessment__status='published'
            ).distinct()
        
        return queryset.select_related('created_by')
    
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
            'by_course': queryset.values('lesson__module__course__title').annotate(count=Count('id')),
            'recent_questions': queryset.order_by('-created_at')[:5].values('id', 'question_text', 'question_type', 'created_at'),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def by_lesson(self, request):
        """Get questions for a specific lesson"""
        lesson_id = request.query_params.get('lesson_id')
        if lesson_id:
            questions = self.get_queryset().filter(lesson_id=lesson_id)
        else:
            questions = self.get_queryset()
        
        serializer = self.get_serializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get questions for a specific course"""
        course_id = request.query_params.get('course_id')
        if course_id:
            questions = self.get_queryset().filter(lesson__module__course_id=course_id)
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
            'questions_by_lesson': dict(queryset.values_list('lesson__title').annotate(
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
    filterset_fields = ['created_by', 'lesson']
    search_fields = ['front_text', 'back_text']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter flashcards based on user permissions"""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students can see flashcards from published assessments
        if hasattr(user, 'profile') and user.profile.status == 'Student':
            queryset = queryset.filter(
                related_question__assessment_questions__assessment__status='published'
            ).distinct()
        
        return queryset.select_related('created_by', 'related_question', 'lesson', 'lesson__module', 'lesson__module__course')
    
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