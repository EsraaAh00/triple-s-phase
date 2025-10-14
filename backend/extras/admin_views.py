from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render
from django.utils import timezone
from django.db.models import Count
from django.contrib.auth import get_user_model
from courses.models import Course, Enrollment
from assessment.models import (
    FlashcardProduct, FlashcardProductEnrollment,
    QuestionBankProduct, QuestionBankProductEnrollment,
    Flashcard, QuestionBank
)
from datetime import timedelta

User = get_user_model()

def is_admin_user(user):
    return user.is_authenticated and user.is_staff

@login_required
@user_passes_test(is_admin_user)
def admin_dashboard(request):
    # Get basic statistics
    total_users = User.objects.count()
    total_students = User.objects.filter(groups__name='Students').count()
    total_teachers = User.objects.filter(groups__name='Teachers').count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    
    # Get assessment statistics
    total_flashcards = Flashcard.objects.count()
    total_questions = QuestionBank.objects.count()
    
    # Get product statistics
    flashcard_products = FlashcardProduct.objects.count()
    questionbank_products = QuestionBankProduct.objects.count()
    
    # Get enrollment statistics
    course_enrollments = Enrollment.objects.count()
    flashcard_enrollments = FlashcardProductEnrollment.objects.count()
    questionbank_enrollments = QuestionBankProductEnrollment.objects.count()
    
    # Get recent activities (simplified for now)
    recent_activities = [
        {
            'icon': 'user-plus',
            'message': 'تمت إضافة مستخدم جديد',
            'time_ago': 'منذ 5 دقائق'
        },
        {
            'icon': 'book',
            'message': 'تمت إضافة دورة جديدة',
            'time_ago': 'منذ ساعة'
        },
        {
            'icon': 'user-graduate',
            'message': 'إكمال دورة جديدة',
            'time_ago': 'منذ 3 ساعات'
        },
        {
            'icon': 'certificate',
            'message': 'تم إصدار شهادة جديدة',
            'time_ago': 'منذ يوم'
        }
    ]
    
    # Get recent courses
    recent_courses = Course.objects.order_by('-created_at')[:5]
    
    # Get recent enrollments
    recent_enrollments = Enrollment.objects.select_related('student', 'course') \
                                         .order_by('-enrollment_date')[:5]
    
    context = {
        'stats': {
            'total_users': total_users,
            'total_students': total_students,
            'total_teachers': total_teachers,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_flashcards': total_flashcards,
            'total_questions': total_questions,
            'flashcard_products': flashcard_products,
            'questionbank_products': questionbank_products,
            'course_enrollments': course_enrollments,
            'flashcard_enrollments': flashcard_enrollments,
            'questionbank_enrollments': questionbank_enrollments,
        },
        'recent_activities': recent_activities,
        'recent_courses': recent_courses,
        'recent_enrollments': recent_enrollments,
        'title': 'لوحة التحكم',
    }
    
    return render(request, 'admin/dashboard/index.html', context)
