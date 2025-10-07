from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Assessment, StudentSubmission, StudentAnswer


@receiver(pre_save, sender=Assessment)
def assessment_pre_save(sender, instance, **kwargs):
    """Validate assessment before saving"""
    if instance.end_date and instance.start_date and instance.end_date <= instance.start_date:
        raise ValueError("End date must be after start date.")
    
    if instance.passing_marks and instance.total_marks and instance.passing_marks > instance.total_marks:
        raise ValueError("Passing marks cannot exceed total marks.")


@receiver(post_save, sender=StudentSubmission)
def submission_post_save(sender, instance, created, **kwargs):
    """Handle submission post-save events"""
    if created:
        # New submission created
        print(f"New submission created for assessment: {instance.assessment.title}")
    
    # Update percentage and pass status
    if instance.total_score and instance.assessment.total_marks:
        instance.percentage = (instance.total_score / instance.assessment.total_marks) * 100
        
        if instance.assessment.passing_marks:
            instance.is_passed = instance.total_score >= instance.assessment.passing_marks
        
        # Save without triggering signals again
        StudentSubmission.objects.filter(pk=instance.pk).update(
            percentage=instance.percentage,
            is_passed=instance.is_passed
        )


@receiver(post_save, sender=StudentAnswer)
def answer_post_save(sender, instance, created, **kwargs):
    """Handle answer post-save events"""
    if created:
        # New answer created - try auto-grading
        if instance.question.question_type in ['mcq', 'true_false']:
            instance.auto_grade()
            
            # Update submission total score
            submission = instance.submission
            total_score = sum(
                answer.marks_obtained for answer in submission.answers.all()
            )
            submission.total_score = total_score
            submission.save(update_fields=['total_score'])


@receiver(pre_save, sender=StudentAnswer)
def answer_pre_save(sender, instance, **kwargs):
    """Validate answer before saving"""
    if instance.question.question_type == 'mcq' and not instance.selected_options:
        raise ValueError("MCQ questions require selected options.")
