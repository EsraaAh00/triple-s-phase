from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import json

User = get_user_model()


class Assessment(models.Model):
    """Main assessment model for assignments, quizzes, exams, and flashcards"""
    
    ASSESSMENT_TYPES = [
        ('assignment', _('Assignment')),
        ('quiz', _('Quiz')),
        ('exam', _('Exam')),
        ('flashcard', _('Flashcard')),
    ]
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('archived', _('Archived')),
    ]
    
    title = models.CharField(max_length=255, verbose_name=_('Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES, verbose_name=_('Assessment Type'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name=_('Status'))
    
    # Timing
    start_date = models.DateTimeField(verbose_name=_('Start Date'))
    end_date = models.DateTimeField(blank=True, null=True, verbose_name=_('End Date'))
    duration_minutes = models.PositiveIntegerField(
        blank=True, null=True, 
        verbose_name=_('Duration (minutes)'),
        help_text=_('Leave empty for no time limit')
    )
    
    # Scoring
    total_marks = models.DecimalField(
        max_digits=8, decimal_places=2, 
        default=100.00, verbose_name=_('Total Marks')
    )
    passing_marks = models.DecimalField(
        max_digits=8, decimal_places=2, 
        blank=True, null=True, verbose_name=_('Passing Marks')
    )
    
    # Settings
    is_randomized = models.BooleanField(default=False, verbose_name=_('Randomize Questions'))
    allow_multiple_attempts = models.BooleanField(default=False, verbose_name=_('Allow Multiple Attempts'))
    max_attempts = models.PositiveIntegerField(
        default=1, verbose_name=_('Max Attempts'),
        help_text=_('Maximum number of attempts allowed (0 = unlimited)')
    )
    show_correct_answers = models.BooleanField(default=True, verbose_name=_('Show Correct Answers'))
    show_results_immediately = models.BooleanField(default=True, verbose_name=_('Show Results Immediately'))
    
    # Relationships
    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.CASCADE, 
        related_name='assessments',
        verbose_name=_('Course')
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_assessments',
        verbose_name=_('Created By')
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Assessment')
        verbose_name_plural = _('Assessments')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"
    
    def clean(self):
        super().clean()
        if self.end_date and self.start_date and self.end_date <= self.start_date:
            raise ValidationError(_('End date must be after start date.'))
        
        if self.passing_marks and self.passing_marks > self.total_marks:
            raise ValidationError(_('Passing marks cannot exceed total marks.'))
    
    @property
    def is_active(self):
        """Check if assessment is currently active"""
        now = timezone.now()
        if self.status != 'published':
            return False
        if self.start_date > now:
            return False
        if self.end_date and self.end_date < now:
            return False
        return True
    
    @property
    def questions_count(self):
        """Get total number of questions in this assessment"""
        return self.assessment_questions.count()
    
    @property
    def total_questions_marks(self):
        """Calculate total marks from all questions"""
        return sum(aq.marks_allocated for aq in self.assessment_questions.all())


# Question Bank Product Model
class QuestionBankProduct(models.Model):
    """Product model for question banks - links existing courses with pricing"""
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('archived', _('Archived')),
    ]
    
    title = models.CharField(max_length=255, verbose_name=_('Product Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name=_('Status'))
    
    # Link to existing course
    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.CASCADE, 
        related_name='question_bank_products',
        verbose_name=_('Course')
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10, decimal_places=2, 
        default=0.00, verbose_name=_('Price')
    )
    is_free = models.BooleanField(default=False, verbose_name=_('Is Free'))
    
    # Product details
    image = models.ImageField(upload_to='question_bank_products/', blank=True, null=True, verbose_name=_('Product Image'))
    tags = models.JSONField(
        default=list, blank=True,
        verbose_name=_('Tags'),
        help_text=_('JSON array of tags for categorization')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_question_bank_products',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Question Bank Product')
        verbose_name_plural = _('Question Bank Products')
        ordering = ['-created_at']
        unique_together = ['course', 'created_by']
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"
    
    @property
    def total_enrollments(self):
        """Get total number of students enrolled in this product"""
        return self.enrollments.count()
    
    @property
    def chapters_count(self):
        """Get the number of chapters in this product"""
        return self.chapters.count()
    
    @property
    def questions_count(self):
        """Get the total number of questions in this product"""
        return sum(chapter.questions_count for chapter in self.chapters.all())


# Question Bank Product Enrollment Model
class QuestionBankProductEnrollment(models.Model):
    """Model for student enrollment in question bank products"""
    
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('dropped', _('Dropped')),
        ('suspended', _('Suspended')),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='question_bank_enrollments',
        verbose_name=_('Student')
    )
    product = models.ForeignKey(
        QuestionBankProduct,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Question Bank Product')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name=_('Status')
    )
    enrollment_date = models.DateTimeField(
        default=timezone.now,
        verbose_name=_('Enrollment Date')
    )
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Completion Date')
    )
    last_accessed = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Last Accessed')
    )
    progress = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Progress %')
    )
    is_paid = models.BooleanField(
        default=False,
        verbose_name=_('Is Paid')
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Payment Amount')
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Payment Date')
    )
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Transaction ID')
    )
    
    class Meta:
        verbose_name = _('Question Bank Product Enrollment')
        verbose_name_plural = _('Question Bank Product Enrollments')
        unique_together = ('student', 'product')
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.product.title}"
    
    def save(self, *args, **kwargs):
        # Update completion date if status changes to completed
        if self.status == 'completed' and not self.completion_date:
            self.completion_date = timezone.now()
        
        # Update last accessed timestamp
        self.last_accessed = timezone.now()
        
        super().save(*args, **kwargs)
    
    def update_progress(self, new_progress):
        """
        Update the enrollment progress and handle completion
        
        Args:
            new_progress (float): New progress percentage (0-100)
        """
        if new_progress >= 100 and self.status != 'completed':
            self.status = 'completed'
            self.completion_date = timezone.now()
        
        self.progress = min(100, max(0, new_progress))  # Ensure between 0-100
        # Use direct database update to avoid triggering signals
        QuestionBankProductEnrollment.objects.filter(pk=self.pk).update(
            progress=self.progress,
            status=self.status,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def mark_complete(self):
        """Mark the enrollment as completed"""
        self.status = 'completed'
        self.progress = 100
        self.completion_date = timezone.now()
        # Use direct database update to avoid triggering signals
        QuestionBankProductEnrollment.objects.filter(pk=self.pk).update(
            status=self.status,
            progress=self.progress,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def is_active_enrollment(self):
        """Check if this is an active enrollment"""
        return self.status in ['active', 'completed']
    
    def get_certificate_eligible(self):
        """Check if this enrollment is eligible for a certificate"""
        return (
            self.status == 'completed' and 
            self.progress >= 100 and 
            self.product.is_certified
        )


# Question Bank Chapter Model
class QuestionBankChapter(models.Model):
    """Chapters for organizing questions within a question bank product"""
    
    title = models.CharField(max_length=255, verbose_name=_('Chapter Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    
    # Relationship to product instead of course
    product = models.ForeignKey(
        QuestionBankProduct, 
        on_delete=models.CASCADE, 
        related_name='chapters',
        verbose_name=_('Question Bank Product'),
        blank=True, null=True  # Make optional for migration
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_question_bank_chapters',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Question Bank Chapter')
        verbose_name_plural = _('Question Bank Chapters')
        ordering = ['product', 'order', 'title']
        unique_together = ['product', 'order']
    
    def __str__(self):
        return f"{self.product.title} - {self.title}"
    
    @property
    def topics_count(self):
        """Get the number of topics in this chapter"""
        return self.topics.count()
    
    @property
    def questions_count(self):
        """Get the total number of questions in this chapter"""
        return sum(topic.questions.count() for topic in self.topics.all())


# Question Bank Topic Model
class QuestionBankTopic(models.Model):
    """Topics for organizing questions within question bank chapters"""
    
    title = models.CharField(max_length=255, verbose_name=_('Topic Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    
    # Relationship to chapter
    chapter = models.ForeignKey(
        QuestionBankChapter, 
        on_delete=models.CASCADE, 
        related_name='topics',
        verbose_name=_('Chapter')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_question_bank_topics',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Question Bank Topic')
        verbose_name_plural = _('Question Bank Topics')
        ordering = ['chapter', 'order', 'title']
        unique_together = ['chapter', 'order']
    
    def __str__(self):
        return f"{self.chapter.title} - {self.title}"
    
    @property
    def questions_count(self):
        """Get the number of questions in this topic"""
        return self.questions.count()


class QuestionBank(models.Model):
    """Question bank for reusable questions across assessments"""
    
    QUESTION_TYPES = [
        ('mcq', _('Multiple Choice Question')),
        ('true_false', _('True/False')),
        ('short_answer', _('Short Answer')),
        ('essay', _('Essay')),
        ('fill_blank', _('Fill in the Blank')),
        ('matching', _('Matching')),
        ('ordering', _('Ordering')),
    ]
    
    DIFFICULTY_LEVELS = [
        ('easy', _('Easy')),
        ('medium', _('Medium')),
        ('hard', _('Hard')),
    ]
    
    question_text = models.TextField(verbose_name=_('Question Text'))
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, verbose_name=_('Question Type'))
    difficulty_level = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default='medium', verbose_name=_('Difficulty Level'))
    
    # For MCQ questions
    options = models.JSONField(
        blank=True, null=True, 
        verbose_name=_('Options'),
        help_text=_('JSON array of options for MCQ questions')
    )
    correct_answer = models.TextField(verbose_name=_('Correct Answer'))
    
    # Additional fields
    explanation = models.TextField(blank=True, null=True, verbose_name=_('Explanation'))
    tags = models.JSONField(
        default=list, blank=True,
        verbose_name=_('Tags'),
        help_text=_('JSON array of tags for categorization')
    )
    
    # Media
    image = models.ImageField(upload_to='questions/images/', blank=True, null=True, verbose_name=_('Question Image'))
    audio = models.FileField(upload_to='questions/audio/', blank=True, null=True, verbose_name=_('Question Audio'))
    video = models.FileField(upload_to='questions/video/', blank=True, null=True, verbose_name=_('Question Video'))
    
    # Relationships - Updated to use product and topic
    product = models.ForeignKey(
        QuestionBankProduct, 
        on_delete=models.CASCADE, 
        related_name='questions',
        verbose_name=_('Question Bank Product'),
        help_text=_('The product this question belongs to'),
        blank=True, null=True  # Make optional for migration
    )
    topic = models.ForeignKey(
        QuestionBankTopic, 
        on_delete=models.CASCADE, 
        related_name='questions',
        verbose_name=_('Topic'),
        help_text=_('The topic this question belongs to'),
        blank=True, null=True
    )
    
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_questions',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Question')
        verbose_name_plural = _('Question Bank')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.question_text[:50]}..." if len(self.question_text) > 50 else self.question_text
    
    def clean(self):
        super().clean()
        if self.question_type == 'mcq' and not self.options:
            raise ValidationError(_('MCQ questions must have options.'))
        
        if self.question_type == 'mcq' and self.options:
            try:
                options_list = json.loads(self.options) if isinstance(self.options, str) else self.options
                if not isinstance(options_list, list) or len(options_list) < 2:
                    raise ValidationError(_('MCQ questions must have at least 2 options.'))
            except (json.JSONDecodeError, TypeError):
                raise ValidationError(_('Invalid options format for MCQ question.'))
        
        # Ensure topic belongs to the same course
        if self.topic and self.course and self.topic.chapter.course != self.course:
            raise ValidationError(_('Topic must belong to the same course.'))
    
    @property
    def is_mcq(self):
        return self.question_type == 'mcq'
    
    @property
    def options_list(self):
        """Get options as a list for MCQ questions"""
        if self.question_type == 'mcq' and self.options:
            try:
                return json.loads(self.options) if isinstance(self.options, str) else self.options
            except (json.JSONDecodeError, TypeError):
                return []
        return []
    
    @property
    def chapter(self):
        """Get the chapter through the topic"""
        return self.topic.chapter if self.topic else None
    


class AssessmentQuestions(models.Model):
    """Many-to-many relationship between Assessment and QuestionBank with additional fields"""
    
    assessment = models.ForeignKey(
        Assessment, 
        on_delete=models.CASCADE, 
        related_name='assessment_questions',
        verbose_name=_('Assessment')
    )
    question = models.ForeignKey(
        QuestionBank, 
        on_delete=models.CASCADE, 
        related_name='assessment_questions',
        verbose_name=_('Question')
    )
    marks_allocated = models.DecimalField(
        max_digits=8, decimal_places=2, 
        default=1.00, verbose_name=_('Marks Allocated')
    )
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    
    class Meta:
        verbose_name = _('Assessment Question')
        verbose_name_plural = _('Assessment Questions')
        unique_together = ['assessment', 'question']
        ordering = ['order', 'id']
    
    def __str__(self):
        return f"{self.assessment.title} - {self.question.question_text[:30]}..."


class StudentSubmission(models.Model):
    """Student submissions for assessments"""
    
    STATUS_CHOICES = [
        ('in_progress', _('In Progress')),
        ('submitted', _('Submitted')),
        ('graded', _('Graded')),
        ('late', _('Late Submission')),
    ]
    
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='assessment_submissions',
        verbose_name=_('Student')
    )
    assessment = models.ForeignKey(
        Assessment, 
        on_delete=models.CASCADE, 
        related_name='submissions',
        verbose_name=_('Assessment')
    )
    
    # Submission details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress', verbose_name=_('Status'))
    attempt_number = models.PositiveIntegerField(default=1, verbose_name=_('Attempt Number'))
    
    # Timing
    started_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Started At'))
    submitted_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Submitted At'))
    time_taken_minutes = models.PositiveIntegerField(blank=True, null=True, verbose_name=_('Time Taken (minutes)'))
    
    # Scoring
    total_score = models.DecimalField(
        max_digits=8, decimal_places=2, 
        default=0.00, verbose_name=_('Total Score')
    )
    percentage = models.DecimalField(
        max_digits=5, decimal_places=2, 
        default=0.00, verbose_name=_('Percentage')
    )
    is_passed = models.BooleanField(default=False, verbose_name=_('Passed'))
    
    # Grading
    graded_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        blank=True, null=True,
        related_name='graded_submissions',
        verbose_name=_('Graded By')
    )
    graded_at = models.DateTimeField(blank=True, null=True, verbose_name=_('Graded At'))
    feedback = models.TextField(blank=True, null=True, verbose_name=_('Feedback'))
    
    class Meta:
        verbose_name = _('Student Submission')
        verbose_name_plural = _('Student Submissions')
        unique_together = ['student', 'assessment', 'attempt_number']
        ordering = ['-submitted_at', '-started_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.assessment.title} (Attempt {self.attempt_number})"
    
    def save(self, *args, **kwargs):
        if self.submitted_at and not self.time_taken_minutes:
            time_diff = self.submitted_at - self.started_at
            self.time_taken_minutes = int(time_diff.total_seconds() / 60)
        
        if self.total_score and self.assessment.total_marks:
            self.percentage = (self.total_score / self.assessment.total_marks) * 100
        
        if self.assessment.passing_marks and self.total_score:
            self.is_passed = self.total_score >= self.assessment.passing_marks
        
        super().save(*args, **kwargs)


class StudentAnswer(models.Model):
    """Individual student answers to questions"""
    
    submission = models.ForeignKey(
        StudentSubmission, 
        on_delete=models.CASCADE, 
        related_name='answers',
        verbose_name=_('Submission')
    )
    question = models.ForeignKey(
        QuestionBank, 
        on_delete=models.CASCADE, 
        related_name='student_answers',
        verbose_name=_('Question')
    )
    
    # Answer content
    answer_text = models.TextField(blank=True, null=True, verbose_name=_('Answer Text'))
    selected_options = models.JSONField(
        blank=True, null=True,
        verbose_name=_('Selected Options'),
        help_text=_('For MCQ questions - array of selected option indices')
    )
    
    # Grading
    is_correct = models.BooleanField(default=False, verbose_name=_('Is Correct'))
    marks_obtained = models.DecimalField(
        max_digits=8, decimal_places=2, 
        default=0.00, verbose_name=_('Marks Obtained')
    )
    is_auto_graded = models.BooleanField(default=False, verbose_name=_('Auto Graded'))
    
    # Timing
    answered_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Answered At'))
    time_spent_seconds = models.PositiveIntegerField(blank=True, null=True, verbose_name=_('Time Spent (seconds)'))
    
    class Meta:
        verbose_name = _('Student Answer')
        verbose_name_plural = _('Student Answers')
        unique_together = ['submission', 'question']
        ordering = ['answered_at']
    
    def __str__(self):
        return f"{self.submission.student.username} - {self.question.question_text[:30]}..."
    
    def clean(self):
        super().clean()
        if self.question.question_type == 'mcq' and not self.selected_options:
            raise ValidationError(_('MCQ questions require selected options.'))
    
    def auto_grade(self):
        """Auto-grade the answer based on question type"""
        if self.question.question_type in ['mcq', 'true_false']:
            if self.question.question_type == 'mcq':
                correct_options = self.question.correct_answer
                # Assuming correct_answer stores the correct option indices as JSON
                try:
                    correct_indices = json.loads(correct_options) if isinstance(correct_options, str) else correct_options
                    if isinstance(correct_indices, list) and self.selected_options == correct_indices:
                        self.is_correct = True
                        self.marks_obtained = self.submission.assessment.assessment_questions.get(
                            question=self.question
                        ).marks_allocated
                except (json.JSONDecodeError, TypeError):
                    pass
            elif self.question.question_type == 'true_false':
                if self.answer_text and self.answer_text.lower() == self.question.correct_answer.lower():
                    self.is_correct = True
                    self.marks_obtained = self.submission.assessment.assessment_questions.get(
                        question=self.question
                    ).marks_allocated
        
        self.is_auto_graded = True
        self.save()


# Flashcard Product Model
class FlashcardProduct(models.Model):
    """Product model for flashcards - links existing courses with pricing"""
    
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('published', _('Published')),
        ('archived', _('Archived')),
    ]
    
    title = models.CharField(max_length=255, verbose_name=_('Product Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name=_('Status'))
    
    # Link to existing course
    course = models.ForeignKey(
        'courses.Course', 
        on_delete=models.CASCADE, 
        related_name='flashcard_products',
        verbose_name=_('Course')
    )
    
    # Pricing
    price = models.DecimalField(
        max_digits=10, decimal_places=2, 
        default=0.00, verbose_name=_('Price')
    )
    is_free = models.BooleanField(default=False, verbose_name=_('Is Free'))
    
    # Product details
    image = models.ImageField(upload_to='flashcard_products/', blank=True, null=True, verbose_name=_('Product Image'))
    tags = models.JSONField(
        default=list, blank=True,
        verbose_name=_('Tags'),
        help_text=_('JSON array of tags for categorization')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_flashcard_products',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Flashcard Product')
        verbose_name_plural = _('Flashcard Products')
        ordering = ['-created_at']
        unique_together = ['course', 'created_by']
    
    def __str__(self):
        return f"{self.title} - {self.course.title}"
    
    @property
    def total_enrollments(self):
        """Get total number of students enrolled in this product"""
        return self.enrollments.count()
    
    @property
    def chapters_count(self):
        """Get the number of chapters in this product"""
        return self.chapters.count()
    
    @property
    def flashcards_count(self):
        """Get the total number of flashcards in this product"""
        return sum(chapter.flashcards_count for chapter in self.chapters.all())


# Flashcard Product Enrollment Model
class FlashcardProductEnrollment(models.Model):
    """Model for student enrollment in flashcard products"""
    
    STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('active', _('Active')),
        ('completed', _('Completed')),
        ('dropped', _('Dropped')),
        ('suspended', _('Suspended')),
    ]
    
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='flashcard_enrollments',
        verbose_name=_('Student')
    )
    product = models.ForeignKey(
        FlashcardProduct,
        on_delete=models.CASCADE,
        related_name='enrollments',
        verbose_name=_('Flashcard Product')
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        verbose_name=_('Status')
    )
    enrollment_date = models.DateTimeField(
        default=timezone.now,
        verbose_name=_('Enrollment Date')
    )
    completion_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Completion Date')
    )
    last_accessed = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Last Accessed')
    )
    progress = models.FloatField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name=_('Progress %')
    )
    is_paid = models.BooleanField(
        default=False,
        verbose_name=_('Is Paid')
    )
    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name=_('Payment Amount')
    )
    payment_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Payment Date')
    )
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name=_('Transaction ID')
    )
    
    class Meta:
        verbose_name = _('Flashcard Product Enrollment')
        verbose_name_plural = _('Flashcard Product Enrollments')
        unique_together = ('student', 'product')
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.product.title}"
    
    def save(self, *args, **kwargs):
        # Update completion date if status changes to completed
        if self.status == 'completed' and not self.completion_date:
            self.completion_date = timezone.now()
        
        # Update last accessed timestamp
        self.last_accessed = timezone.now()
        
        super().save(*args, **kwargs)
    
    def update_progress(self, new_progress):
        """
        Update the enrollment progress and handle completion
        
        Args:
            new_progress (float): New progress percentage (0-100)
        """
        if new_progress >= 100 and self.status != 'completed':
            self.status = 'completed'
            self.completion_date = timezone.now()
        
        self.progress = min(100, max(0, new_progress))  # Ensure between 0-100
        # Use direct database update to avoid triggering signals
        FlashcardProductEnrollment.objects.filter(pk=self.pk).update(
            progress=self.progress,
            status=self.status,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def mark_complete(self):
        """Mark the enrollment as completed"""
        self.status = 'completed'
        self.progress = 100
        self.completion_date = timezone.now()
        # Use direct database update to avoid triggering signals
        FlashcardProductEnrollment.objects.filter(pk=self.pk).update(
            status=self.status,
            progress=self.progress,
            completion_date=self.completion_date,
            last_accessed=timezone.now()
        )
    
    def is_active_enrollment(self):
        """Check if this is an active enrollment"""
        return self.status in ['active', 'completed']
    
    def get_certificate_eligible(self):
        """Check if this enrollment is eligible for a certificate"""
        return (
            self.status == 'completed' and 
            self.progress >= 100 and 
            self.product.is_certified
        )


# Flashcard Chapter Model
class FlashcardChapter(models.Model):
    """Chapters for organizing flashcards within a flashcard product"""
    
    title = models.CharField(max_length=255, verbose_name=_('Chapter Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    
    # Relationship to product instead of course
    product = models.ForeignKey(
        FlashcardProduct, 
        on_delete=models.CASCADE, 
        related_name='chapters',
        verbose_name=_('Flashcard Product'),
        blank=True, null=True  # Make optional for migration
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_flashcard_chapters',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Flashcard Chapter')
        verbose_name_plural = _('Flashcard Chapters')
        ordering = ['product', 'order', 'title']
        unique_together = ['product', 'order']
    
    def __str__(self):
        return f"{self.product.title} - {self.title}"
    
    @property
    def topics_count(self):
        """Get the number of topics in this chapter"""
        return self.topics.count()
    
    @property
    def flashcards_count(self):
        """Get the total number of flashcards in this chapter"""
        return sum(topic.flashcards.count() for topic in self.topics.all())


# Flashcard Topic Model
class FlashcardTopic(models.Model):
    """Topics for organizing flashcards within flashcard chapters"""
    
    title = models.CharField(max_length=255, verbose_name=_('Topic Title'))
    description = models.TextField(blank=True, null=True, verbose_name=_('Description'))
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    
    # Relationship to chapter
    chapter = models.ForeignKey(
        FlashcardChapter, 
        on_delete=models.CASCADE, 
        related_name='topics',
        verbose_name=_('Chapter')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_flashcard_topics',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Flashcard Topic')
        verbose_name_plural = _('Flashcard Topics')
        ordering = ['chapter', 'order', 'title']
        unique_together = ['chapter', 'order']
    
    def __str__(self):
        return f"{self.chapter.title} - {self.title}"
    
    @property
    def flashcards_count(self):
        """Get the number of flashcards in this topic"""
        return self.flashcards.count()


class Flashcard(models.Model):
    """Specialized model for flashcards (optional)"""
    
    front_text = models.TextField(verbose_name=_('Front Text'))
    back_text = models.TextField(verbose_name=_('Back Text'))
    related_question = models.ForeignKey(
        QuestionBank, 
        on_delete=models.SET_NULL, 
        blank=True, null=True,
        related_name='flashcards',
        verbose_name=_('Related Question')
    )
    
    # Relationships - Updated to use product and topic
    product = models.ForeignKey(
        FlashcardProduct, 
        on_delete=models.CASCADE, 
        related_name='flashcards',
        verbose_name=_('Flashcard Product'),
        help_text=_('The product this flashcard belongs to'),
        blank=True, null=True  # Make optional for migration
    )
    topic = models.ForeignKey(
        FlashcardTopic, 
        on_delete=models.CASCADE, 
        related_name='flashcards',
        verbose_name=_('Topic'),
        help_text=_('The topic this flashcard belongs to'),
        blank=True, null=True
    )
    
    
    # Tags for categorization
    tags = models.JSONField(
        default=list, blank=True,
        verbose_name=_('Tags'),
        help_text=_('JSON array of tags for categorization')
    )
    
    # Media
    front_image = models.ImageField(upload_to='flashcards/front/', blank=True, null=True, verbose_name=_('Front Image'))
    back_image = models.ImageField(upload_to='flashcards/back/', blank=True, null=True, verbose_name=_('Back Image'))
    
    # Metadata
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_flashcards',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    class Meta:
        verbose_name = _('Flashcard')
        verbose_name_plural = _('Flashcards')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.front_text[:30]}..."
    
    def clean(self):
        super().clean()
        # Ensure topic belongs to the same course
        if self.topic and self.course and self.topic.chapter.course != self.course:
            raise ValidationError(_('Topic must belong to the same course.'))
    
    @property
    def chapter(self):
        """Get the chapter through the topic"""
        return self.topic.chapter if self.topic else None
    


class StudentFlashcardProgress(models.Model):
    """Track student progress with flashcards"""
    
    student = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='flashcard_progress',
        verbose_name=_('Student')
    )
    flashcard = models.ForeignKey(
        Flashcard, 
        on_delete=models.CASCADE, 
        related_name='student_progress',
        verbose_name=_('Flashcard')
    )
    
    # Progress tracking
    times_reviewed = models.PositiveIntegerField(default=0, verbose_name=_('Times Reviewed'))
    correct_count = models.PositiveIntegerField(default=0, verbose_name=_('Correct Count'))
    last_reviewed = models.DateTimeField(blank=True, null=True, verbose_name=_('Last Reviewed'))
    difficulty_level = models.CharField(
        max_length=10, 
        choices=QuestionBank.DIFFICULTY_LEVELS, 
        default='medium',
        verbose_name=_('Difficulty Level')
    )
    
    class Meta:
        verbose_name = _('Student Flashcard Progress')
        verbose_name_plural = _('Student Flashcard Progress')
        unique_together = ['student', 'flashcard']
    
    def __str__(self):
        return f"{self.student.username} - {self.flashcard.front_text[:30]}..."
    
    @property
    def accuracy_rate(self):
        """Calculate accuracy rate for this flashcard"""
        if self.times_reviewed == 0:
            return 0
        return (self.correct_count / self.times_reviewed) * 100