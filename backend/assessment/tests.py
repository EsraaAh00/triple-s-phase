from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import (
    Assessment, QuestionBank, AssessmentQuestions, 
    StudentSubmission, StudentAnswer, Flashcard, StudentFlashcardProgress
)

User = get_user_model()


class AssessmentModelTest(TestCase):
    """Test cases for Assessment model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_assessment_model_fields(self):
        """Test assessment model field definitions"""
        # Test that the model has the expected fields
        fields = [field.name for field in Assessment._meta.fields]
        expected_fields = [
            'id', 'title', 'description', 'type', 'status',
            'start_date', 'end_date', 'duration_minutes',
            'total_marks', 'passing_marks', 'is_randomized',
            'allow_multiple_attempts', 'max_attempts',
            'show_correct_answers', 'show_results_immediately',
            'course', 'created_by', 'created_at', 'updated_at'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)
    
    def test_assessment_choices(self):
        """Test assessment type and status choices"""
        # Test that the choices are properly defined
        self.assertEqual(len(Assessment.ASSESSMENT_TYPES), 4)
        self.assertEqual(len(Assessment.STATUS_CHOICES), 3)
        
        # Test specific choices
        types = [choice[0] for choice in Assessment.ASSESSMENT_TYPES]
        self.assertIn('assignment', types)
        self.assertIn('quiz', types)
        self.assertIn('exam', types)
        self.assertIn('flashcard', types)


class QuestionBankModelTest(TestCase):
    """Test cases for QuestionBank model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_question_creation(self):
        """Test creating a question"""
        # Test creating a question without lesson (optional field)
        question = QuestionBank.objects.create(
            question_text='What is 2 + 2?',
            question_type='mcq',
            difficulty_level='easy',
            options=['3', '4', '5', '6'],
            correct_answer='4',
            explanation='2 + 2 = 4',
            created_by=self.user
        )
        
        self.assertEqual(question.question_text, 'What is 2 + 2?')
        self.assertEqual(question.question_type, 'mcq')
        self.assertTrue(question.is_mcq)
        self.assertEqual(question.options_list, ['3', '4', '5', '6'])
        self.assertIsNone(question.lesson)  # lesson is optional
    
    def test_question_model_fields(self):
        """Test question model field definitions"""
        fields = [field.name for field in QuestionBank._meta.fields]
        expected_fields = [
            'id', 'question_text', 'question_type', 'difficulty_level',
            'options', 'correct_answer', 'explanation', 'tags',
            'image', 'audio', 'video', 'lesson', 'created_by', 'created_at', 'updated_at'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)
    
    def test_question_choices(self):
        """Test question type and difficulty choices"""
        self.assertEqual(len(QuestionBank.QUESTION_TYPES), 7)
        self.assertEqual(len(QuestionBank.DIFFICULTY_LEVELS), 3)
        
        types = [choice[0] for choice in QuestionBank.QUESTION_TYPES]
        self.assertIn('mcq', types)
        self.assertIn('true_false', types)
        self.assertIn('short_answer', types)
        self.assertIn('essay', types)


class StudentSubmissionModelTest(TestCase):
    """Test cases for StudentSubmission model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_submission_model_fields(self):
        """Test submission model field definitions"""
        fields = [field.name for field in StudentSubmission._meta.fields]
        expected_fields = [
            'id', 'student', 'assessment', 'status', 'attempt_number',
            'started_at', 'submitted_at', 'time_taken_minutes',
            'total_score', 'percentage', 'is_passed',
            'graded_by', 'graded_at', 'feedback'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)
    
    def test_submission_choices(self):
        """Test submission status choices"""
        self.assertEqual(len(StudentSubmission.STATUS_CHOICES), 4)
        
        statuses = [choice[0] for choice in StudentSubmission.STATUS_CHOICES]
        self.assertIn('in_progress', statuses)
        self.assertIn('submitted', statuses)
        self.assertIn('graded', statuses)
        self.assertIn('late', statuses)


class StudentAnswerModelTest(TestCase):
    """Test cases for StudentAnswer model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_answer_model_fields(self):
        """Test answer model field definitions"""
        fields = [field.name for field in StudentAnswer._meta.fields]
        expected_fields = [
            'id', 'submission', 'question', 'answer_text', 'selected_options',
            'is_correct', 'marks_obtained', 'is_auto_graded',
            'answered_at', 'time_spent_seconds'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)


class FlashcardModelTest(TestCase):
    """Test cases for Flashcard model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_flashcard_creation(self):
        """Test creating a flashcard"""
        flashcard = Flashcard.objects.create(
            front_text='What is the capital of France?',
            back_text='Paris',
            created_by=self.user
        )
        
        self.assertEqual(flashcard.front_text, 'What is the capital of France?')
        self.assertEqual(flashcard.back_text, 'Paris')
        self.assertEqual(flashcard.created_by, self.user)
    
    def test_flashcard_model_fields(self):
        """Test flashcard model field definitions"""
        fields = [field.name for field in Flashcard._meta.fields]
        expected_fields = [
            'id', 'front_text', 'back_text', 'related_question',
            'front_image', 'back_image', 'created_by', 'created_at', 'updated_at'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)


class StudentFlashcardProgressModelTest(TestCase):
    """Test cases for StudentFlashcardProgress model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.flashcard = Flashcard.objects.create(
            front_text='Test Question',
            back_text='Test Answer',
            created_by=self.user
        )
    
    def test_progress_creation(self):
        """Test creating flashcard progress"""
        progress = StudentFlashcardProgress.objects.create(
            student=self.user,
            flashcard=self.flashcard,
            times_reviewed=5,
            correct_count=4
        )
        
        self.assertEqual(progress.student, self.user)
        self.assertEqual(progress.flashcard, self.flashcard)
        self.assertEqual(progress.times_reviewed, 5)
        self.assertEqual(progress.correct_count, 4)
        self.assertEqual(progress.accuracy_rate, 80.0)  # 4/5 * 100
    
    def test_progress_model_fields(self):
        """Test progress model field definitions"""
        fields = [field.name for field in StudentFlashcardProgress._meta.fields]
        expected_fields = [
            'id', 'student', 'flashcard', 'times_reviewed',
            'correct_count', 'last_reviewed', 'difficulty_level'
        ]
        
        for field in expected_fields:
            self.assertIn(field, fields)