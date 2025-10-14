from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress,
    QuestionBankProduct, QuestionBankProductEnrollment,
    QuestionBankChapter, QuestionBankTopic, 
    FlashcardProduct, FlashcardProductEnrollment,
    FlashcardChapter, FlashcardTopic
)

User = get_user_model()


# Serializers for new models
class QuestionBankTopicSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBankTopic model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    product_title = serializers.CharField(source='chapter.product.title', read_only=True)
    questions_count = serializers.ReadOnlyField()
    
    class Meta:
        model = QuestionBankTopic
        fields = [
            'id', 'title', 'description', 'order', 'chapter', 'chapter_title',
            'product_title', 'created_by', 'created_by_name', 'questions_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuestionBankChapterSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBankChapter model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    topics_count = serializers.ReadOnlyField()
    questions_count = serializers.ReadOnlyField()
    topics = QuestionBankTopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuestionBankChapter
        fields = [
            'id', 'title', 'description', 'order', 'product', 'product_title',
            'created_by', 'created_by_name', 'topics_count', 'questions_count',
            'topics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class FlashcardTopicSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardTopic model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    product_title = serializers.CharField(source='chapter.product.title', read_only=True)
    flashcards_count = serializers.ReadOnlyField()
    
    class Meta:
        model = FlashcardTopic
        fields = [
            'id', 'title', 'description', 'order', 'chapter', 'chapter_title',
            'product_title', 'created_by', 'created_by_name', 'flashcards_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class FlashcardChapterSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardChapter model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    topics_count = serializers.ReadOnlyField()
    flashcards_count = serializers.ReadOnlyField()
    topics = FlashcardTopicSerializer(many=True, read_only=True)
    
    class Meta:
        model = FlashcardChapter
        fields = [
            'id', 'title', 'description', 'order', 'product', 'product_title',
            'created_by', 'created_by_name', 'topics_count', 'flashcards_count',
            'topics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuestionBankSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBank model"""
    
    options_list = serializers.ReadOnlyField()
    is_mcq = serializers.ReadOnlyField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    # New fields for course-based structure
    product_title = serializers.CharField(source='product.title', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'question_text', 'question_type', 'difficulty_level',
            'options', 'correct_answer', 'explanation', 'tags',
            'image', 'audio', 'video', 
            'product', 'product_title', 'topic', 'topic_title', 'chapter_title',
            'created_by', 'created_by_name', 'created_at', 'updated_at', 
            'options_list', 'is_mcq'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def validate_options(self, value):
        """Validate options for MCQ questions"""
        if self.initial_data.get('question_type') == 'mcq':
            if not value:
                raise serializers.ValidationError("MCQ questions must have options.")
            if not isinstance(value, list) or len(value) < 2:
                raise serializers.ValidationError("MCQ questions must have at least 2 options.")
        return value


class AssessmentQuestionsSerializer(serializers.ModelSerializer):
    """Serializer for AssessmentQuestions model"""
    
    question = QuestionBankSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AssessmentQuestions
        fields = [
            'id', 'assessment', 'question', 'question_id',
            'marks_allocated', 'order'
        ]
        read_only_fields = ['assessment']


class AssessmentSerializer(serializers.ModelSerializer):
    """Serializer for Assessment model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)
    questions_count = serializers.ReadOnlyField()
    total_questions_marks = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    questions = AssessmentQuestionsSerializer(source='assessment_questions', many=True, read_only=True)
    
    class Meta:
        model = Assessment
        fields = [
            'id', 'title', 'description', 'type', 'status',
            'start_date', 'end_date', 'duration_minutes',
            'total_marks', 'passing_marks',
            'is_randomized', 'allow_multiple_attempts', 'max_attempts',
            'show_correct_answers', 'show_results_immediately',
            'course', 'course_name', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'questions_count', 
            'total_questions_marks', 'is_active', 'questions'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate assessment data"""
        if data.get('end_date') and data.get('start_date'):
            if data['end_date'] <= data['start_date']:
                raise serializers.ValidationError("End date must be after start date.")
        
        if data.get('passing_marks') and data.get('total_marks'):
            if data['passing_marks'] > data['total_marks']:
                raise serializers.ValidationError("Passing marks cannot exceed total marks.")
        
        return data


class StudentAnswerSerializer(serializers.ModelSerializer):
    """Serializer for StudentAnswer model"""
    
    question = QuestionBankSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StudentAnswer
        fields = [
            'id', 'submission', 'question', 'question_id',
            'answer_text', 'selected_options', 'is_correct',
            'marks_obtained', 'is_auto_graded', 'answered_at',
            'time_spent_seconds'
        ]
        read_only_fields = ['submission', 'is_correct', 'marks_obtained', 
                           'is_auto_graded', 'answered_at']


class StudentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for StudentSubmission model"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    answers = StudentAnswerSerializer(many=True, read_only=True)
    graded_by_name = serializers.CharField(source='graded_by.get_full_name', read_only=True)
    
    class Meta:
        model = StudentSubmission
        fields = [
            'id', 'student', 'student_name', 'assessment', 'assessment_title',
            'status', 'attempt_number', 'started_at', 'submitted_at',
            'time_taken_minutes', 'total_score', 'percentage', 'is_passed',
            'graded_by', 'graded_by_name', 'graded_at', 'feedback', 'answers'
        ]
        read_only_fields = ['student', 'started_at', 'time_taken_minutes',
                           'total_score', 'percentage', 'is_passed', 'graded_at']


class FlashcardSerializer(serializers.ModelSerializer):
    """Serializer for Flashcard model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    related_question_text = serializers.CharField(source='related_question.question_text', read_only=True)
    
    # New fields for course-based structure
    product_title = serializers.CharField(source='product.title', read_only=True)
    topic_title = serializers.CharField(source='topic.title', read_only=True)
    chapter_title = serializers.CharField(source='chapter.title', read_only=True)
    
    
    class Meta:
        model = Flashcard
        fields = [
            'id', 'front_text', 'back_text', 'related_question', 'related_question_text',
            'product', 'product_title', 'topic', 'topic_title', 'chapter_title',
            'tags', 'front_image', 'back_image', 'created_by', 'created_by_name', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class StudentFlashcardProgressSerializer(serializers.ModelSerializer):
    """Serializer for StudentFlashcardProgress model"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    flashcard_front = serializers.CharField(source='flashcard.front_text', read_only=True)
    accuracy_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentFlashcardProgress
        fields = [
            'id', 'student', 'student_name', 'flashcard', 'flashcard_front',
            'times_reviewed', 'correct_count', 'last_reviewed',
            'difficulty_level', 'accuracy_rate'
        ]
        read_only_fields = ['student', 'times_reviewed', 'correct_count', 'last_reviewed']


# Nested serializers for detailed views
class AssessmentDetailSerializer(AssessmentSerializer):
    """Detailed serializer for Assessment with all related data"""
    
    submissions = StudentSubmissionSerializer(many=True, read_only=True)
    submissions_count = serializers.SerializerMethodField()
    
    class Meta(AssessmentSerializer.Meta):
        fields = AssessmentSerializer.Meta.fields + ['submissions', 'submissions_count']
    
    def get_submissions_count(self, obj):
        return obj.submissions.count()


class StudentSubmissionDetailSerializer(StudentSubmissionSerializer):
    """Detailed serializer for StudentSubmission with assessment details"""
    
    assessment = AssessmentSerializer(read_only=True)
    
    class Meta(StudentSubmissionSerializer.Meta):
        pass


# Serializers for specific operations
class AssessmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assessments with questions"""
    
    questions = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="List of question IDs with marks and order"
    )
    
    class Meta:
        model = Assessment
        fields = [
            'title', 'description', 'type', 'status',
            'start_date', 'end_date', 'duration_minutes',
            'total_marks', 'passing_marks',
            'is_randomized', 'allow_multiple_attempts', 'max_attempts',
            'show_correct_answers', 'show_results_immediately',
            'course', 'questions'
        ]
    
    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        assessment = Assessment.objects.create(**validated_data)
        
        # Add questions to assessment
        for i, question_data in enumerate(questions_data):
            AssessmentQuestions.objects.create(
                assessment=assessment,
                question_id=question_data['question_id'],
                marks_allocated=question_data.get('marks_allocated', 1.00),
                order=question_data.get('order', i + 1)
            )
        
        return assessment


class StudentAnswerSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for submitting student answers"""
    
    class Meta:
        model = StudentAnswer
        fields = ['question', 'answer_text', 'selected_options', 'time_spent_seconds']
    
    def create(self, validated_data):
        submission = self.context['submission']
        validated_data['submission'] = submission
        answer = StudentAnswer.objects.create(**validated_data)
        
        # Auto-grade if possible
        answer.auto_grade()
        
        return answer


class AssessmentSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for submitting entire assessment"""
    
    answers = StudentAnswerSubmissionSerializer(many=True)
    
    class Meta:
        model = StudentSubmission
        fields = ['assessment', 'answers']
    
    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        student = self.context['request'].user
        
        # Create or get submission
        submission, created = StudentSubmission.objects.get_or_create(
            student=student,
            assessment=validated_data['assessment'],
            defaults={'status': 'in_progress'}
        )
        
        if not created and submission.status == 'submitted':
            raise serializers.ValidationError("Assessment already submitted.")
        
        # Create answers
        for answer_data in answers_data:
            answer_data['submission'] = submission
            StudentAnswer.objects.create(**answer_data)
        
        # Update submission status
        submission.status = 'submitted'
        submission.submitted_at = timezone.now()
        
        # Calculate total score
        total_score = sum(
            answer.marks_obtained for answer in submission.answers.all()
        )
        submission.total_score = total_score
        submission.save()
        
        return submission


# Utility serializers
class AssessmentStatsSerializer(serializers.Serializer):
    """Serializer for assessment statistics"""
    
    total_assessments = serializers.IntegerField()
    active_assessments = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    total_submissions = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)


class QuestionBankStatsSerializer(serializers.Serializer):
    """Serializer for question bank statistics"""
    
    total_questions = serializers.IntegerField()
    questions_by_type = serializers.DictField()
    questions_by_difficulty = serializers.DictField()
    most_used_questions = serializers.ListField()


# Product Serializers
class QuestionBankProductSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBankProduct model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_image = serializers.ImageField(source='course.image', read_only=True)
    chapters_count = serializers.ReadOnlyField()
    questions_count = serializers.ReadOnlyField()
    total_enrollments = serializers.ReadOnlyField()
    
    class Meta:
        model = QuestionBankProduct
        fields = [
            'id', 'title', 'description', 'status', 'course', 'course_title', 'course_image',
            'price', 'is_free', 'image', 'tags', 'created_by', 'created_by_name',
            'chapters_count', 'questions_count', 'total_enrollments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class QuestionBankProductEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBankProductEnrollment model"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = QuestionBankProductEnrollment
        fields = [
            'id', 'student', 'student_name', 'student_email',
            'product', 'product_title', 'enrolled_at', 'is_active'
        ]
        read_only_fields = ['enrolled_at']


class FlashcardProductSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardProduct model"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_image = serializers.ImageField(source='course.image', read_only=True)
    chapters_count = serializers.ReadOnlyField()
    flashcards_count = serializers.ReadOnlyField()
    total_enrollments = serializers.ReadOnlyField()
    
    class Meta:
        model = FlashcardProduct
        fields = [
            'id', 'title', 'description', 'status', 'course', 'course_title', 'course_image',
            'price', 'is_free', 'image', 'tags', 'created_by', 'created_by_name',
            'chapters_count', 'flashcards_count', 'total_enrollments',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class FlashcardProductEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for FlashcardProductEnrollment model"""
    
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    
    class Meta:
        model = FlashcardProductEnrollment
        fields = [
            'id', 'student', 'student_name', 'student_email',
            'product', 'product_title', 'enrolled_at', 'is_active'
        ]
        read_only_fields = ['enrolled_at']
