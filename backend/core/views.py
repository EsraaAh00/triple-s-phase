from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta
from courses.models import Course, Enrollment
from content.models import Lesson
from users.models import Student, Instructor
from meetings.models import Meeting
from articles.models import Article
from store.models import Order
from store.models_payment import Transaction
from reviews.models import CourseReview


@login_required
def student_dashboard_stats(request):
    """إحصائيات لوحة تحكم الطالب"""
    if not hasattr(request.user, 'student'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    student = request.user.student
    
    # المقررات المسجلة
    enrolled_courses = Enrollment.objects.filter(student=student, is_active=True).count()
    
    # الدروس المكتملة
    completed_lessons = Lesson.objects.filter(
        course__enrollments__student=student,
        course__enrollments__is_active=True
    ).count()
    
    # الواجبات المعلقة - تعليق مؤقت بسبب حذف نموذج الواجبات
    # pending_assignments = Assignment.objects.filter(
    #     course__enrollments__student=student,
    #     course__enrollments__is_active=True,
    #     due_date__gte=timezone.now()
    # ).exclude(
    #     submissions__student=student
    # ).count()
    pending_assignments = 0  # Temporary value
    
    # متوسط الدرجات - تعليق مؤقت بسبب حذف نموذج الواجبات
    # average_grade = AssignmentSubmission.objects.filter(
    #     student=student,
    #     grade__isnull=False
    # ).aggregate(avg_grade=Avg('grade'))['avg_grade'] or 0
    average_grade = 0  # Temporary value
    
    # النقاط الإجمالية
    total_points = student.points or 0
    
    # أيام التعلم المتتالية
    learning_streak = student.learning_streak or 0
    
    # الشهادات - تعليق مؤقت بسبب حذف نموذج الشهادات
    # certificates = Certificate.objects.filter(student=student).count()
    certificates = 0  # Temporary value
    
    return JsonResponse({
        'enrolledCourses': enrolled_courses,
        'completedLessons': completed_lessons,
        'pendingAssignments': pending_assignments,
        'averageGrade': round(average_grade, 1),
        'totalPoints': total_points,
        'learningStreak': learning_streak,
        'certificates': certificates
    })

@login_required
def teacher_dashboard_stats(request):
    """إحصائيات لوحة تحكم المعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    
    # إجمالي المقررات
    total_courses = Course.objects.filter(instructor=instructor).count()
    
    # إجمالي الطلاب
    total_students = Enrollment.objects.filter(
        course__instructor=instructor,
        is_active=True
    ).values('student').distinct().count()
    
    # إجمالي الإيرادات
    total_revenue = Transaction.objects.filter(
        order__course__instructor=instructor,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    # متوسط التقييم
    average_rating = CourseReview.objects.filter(
        course__instructor=instructor
    ).aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    # الواجبات المعلقة - تعليق مؤقت بسبب حذف نموذج الواجبات
    # pending_assignments = AssignmentSubmission.objects.filter(
    #     assignment__course__instructor=instructor,
    #     grade__isnull=True
    # ).count()
    pending_assignments = 0  # Temporary value
    
    # المحاضرات القادمة
    upcoming_meetings = Meeting.objects.filter(
        instructor=instructor,
        start_time__gte=timezone.now()
    ).count()
    
    # التسجيلات الجديدة (هذا الأسبوع)
    week_ago = timezone.now() - timedelta(days=7)
    recent_enrollments = Enrollment.objects.filter(
        course__instructor=instructor,
        enrolled_at__gte=week_ago
    ).count()
    
    return JsonResponse({
        'totalCourses': total_courses,
        'totalStudents': total_students,
        'totalRevenue': total_revenue,
        'averageRating': round(average_rating, 1),
        'pendingAssignments': pending_assignments,
        'upcomingMeetings': upcoming_meetings,
        'recentEnrollments': recent_enrollments
    })

@login_required
def student_courses(request):
    """المقررات النشطة للطالب"""
    if not hasattr(request.user, 'student'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    student = request.user.student
    enrollments = Enrollment.objects.filter(
        student=student,
        is_active=True
    ).select_related('course', 'course__instructor')
    
    courses_data = []
    for enrollment in enrollments:
        course = enrollment.course
        
        # حساب التقدم
        total_lessons = course.lessons.count()
        completed_lessons = course.lessons.filter(
            views__student=student
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # الجلسة القادمة
        next_meeting = course.meetings.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        courses_data.append({
            'id': course.id,
            'name': course.title,
            'teacher': course.instructor.user.get_full_name(),
            'progress': round(progress, 1),
            'nextSession': next_meeting.start_time.strftime('%Y-%m-%d %H:%M') if next_meeting else 'لا توجد جلسات قادمة',
            'color': 'primary'
        })
    
    return JsonResponse(courses_data, safe=False)

@login_required
def teacher_courses(request):
    """المقررات النشطة للمعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    courses = Course.objects.filter(instructor=instructor)
    
    courses_data = []
    for course in courses:
        # عدد الطلاب
        students_count = course.enrollments.filter(is_active=True).count()
        
        # متوسط تقدم الطلاب
        enrollments = course.enrollments.filter(is_active=True)
        total_progress = 0
        for enrollment in enrollments:
            total_lessons = course.lessons.count()
            completed_lessons = course.lessons.filter(
                views__student=enrollment.student
            ).count()
            if total_lessons > 0:
                total_progress += (completed_lessons / total_lessons * 100)
        
        avg_progress = total_progress / enrollments.count() if enrollments.count() > 0 else 0
           
        # الجلسة القادمة
        next_meeting = course.meetings.filter(
            start_time__gte=timezone.now()
        ).order_by('start_time').first()
        
        courses_data.append({
            'id': course.id,
            'name': course.title,
            'students': students_count,
            'progress': round(avg_progress, 1),
            'nextClass': next_meeting.start_time.strftime('%Y-%m-%d %H:%M') if next_meeting else 'لا توجد جلسات قادمة',
            'color': 'primary'
        })
    
    return JsonResponse(courses_data, safe=False)

@login_required
def student_progress(request):
    """تقدم الطلاب للمعلم"""
    if not hasattr(request.user, 'instructor'):
        return JsonResponse({'error': 'غير مصرح'}, status=403)
    
    instructor = request.user.instructor
    enrollments = Enrollment.objects.filter(
        course__instructor=instructor,
        is_active=True
    ).select_related('student', 'student__user')
    
    students_data = []
    for enrollment in enrollments:
        student = enrollment.student
        course = enrollment.course
        
        # حساب التقدم
        total_lessons = course.lessons.count()
        completed_lessons = course.lessons.filter(
            views__student=student
        ).count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0           
        
        students_data.append({
            'id': student.id,
            'name': student.user.get_full_name(),
            'progress': round(progress, 1),
        })
    
    # ترتيب حسب التقدم
    students_data.sort(key=lambda x: x['progress'], reverse=True)
    
    return JsonResponse(students_data[:8], safe=False)  # أعلى 8 طلاب

@login_required
def recent_activity(request):
    """النشاطات الأخيرة"""
    user = request.user
    
    activities = []
    
    if hasattr(user, 'student'):
        # نشاطات الطالب
        # آخر الدروس المشاهدة
        recent_lessons = Lesson.objects.filter(
            views__student=user.student
        ).order_by('-views__viewed_at')[:5]
        
        for lesson in recent_lessons:
            activities.append({
                'id': f'lesson_{lesson.id}',
                'type': 'lesson',
                'title': f'شاهد درس: {lesson.title}',
                'description': f'مقرر: {lesson.course.title}',
                'time': lesson.views.filter(student=user.student).first().viewed_at.strftime('%Y-%m-%d %H:%M'),
                'course': lesson.course.title
            })
        

    elif hasattr(user, 'instructor'):
        # نشاطات المعلم
        # آخر المقررات المنشأة
        recent_courses = Course.objects.filter(
            instructor=user.instructor
        ).order_by('-created_at')[:5]
        
        for course in recent_courses:
            activities.append({
                'id': f'course_{course.id}',
                'type': 'course',
                'title': f'أنشأ مقرر: {course.title}',
                'description': f'عدد الطلاب: {course.enrollments.filter(is_active=True).count()}',
                'time': course.created_at.strftime('%Y-%m-%d %H:%M')
            })

    # ترتيب حسب التاريخ
    activities.sort(key=lambda x: x['time'], reverse=True)
    
    return JsonResponse(activities[:10], safe=False)


@login_required
def upcoming_meetings(request):
    """المحاضرات القادمة"""
    user = request.user
    
    if hasattr(user, 'student'):
        # محاضرات الطالب القادمة
        meetings = Meeting.objects.filter(
            course__enrollments__student=user.student,
            course__enrollments__is_active=True,
            start_time__gte=timezone.now()
        ).order_by('start_time')[:10]
        
        meetings_data = []
        for meeting in meetings:
            meetings_data.append({
                'id': meeting.id,
                'type': 'meeting',
                'title': meeting.title,
                'description': f'مقرر: {meeting.course.title}',
                'time': meeting.start_time.strftime('%Y-%m-%d %H:%M'),
                'course': meeting.course.title
            })
        
        return JsonResponse(meetings_data, safe=False)
    
    return JsonResponse([], safe=False)

@login_required
def achievements(request):
    """الإنجازات"""
    user = request.user
    
    if not hasattr(user, 'student'):
        return JsonResponse([], safe=False)
    
    student = user.student
    
    achievements_data = [
        {
            'id': 1,
            'title': 'المثابر',
            'description': 'أكمل 5 أيام متتالية من التعلم',
            'progress': min(student.learning_streak * 20, 100),
            'color': 'warning',
            'reward': '50 نقطة'
        },
        {
            'id': 2,
            'title': 'الطموح',
            'description': 'احصل على درجة A+ في أي مادة',
            'progress': 75,
            'color': 'info',
            'reward': '100 نقطة'
        },
        {
            'id': 3,
            'title': 'المجتهد',
            'description': 'أكمل 10 واجبات',
            'progress': 30,
            'color': 'success',
            'reward': '75 نقطة'
        }
    ]
    
    return JsonResponse(achievements_data, safe=False)

@login_required
def recent_announcements(request):
    """الإعلانات الأخيرة"""
    user = request.user
    
    if hasattr(user, 'instructor'):
        # إعلانات المعلم
        announcements = Article.objects.filter(
            author=user.instructor
        ).order_by('-created_at')[:10]
        
        announcements_data = []
        for announcement in announcements:
            announcements_data.append({
                'id': announcement.id,
                'title': announcement.title,
                'content': announcement.content[:100] + '...' if len(announcement.content) > 100 else announcement.content,
                'date': announcement.created_at.strftime('%Y-%m-%d'),
                'read': True,
                'course': announcement.category.name if announcement.category else 'عام'
            })
        
        return JsonResponse(announcements_data, safe=False)
    
    return JsonResponse([], safe=False)
