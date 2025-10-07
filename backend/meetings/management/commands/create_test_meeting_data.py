from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from meetings.models import Meeting, Participant, MeetingChat
from users.models import Profile
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'إنشاء بيانات تجريبية للاجتماعات'

    def handle(self, *args, **options):
        """إنشاء بيانات تجريبية"""
        
        self.stdout.write("=== إنشاء بيانات تجريبية للاجتماعات ===\n")
        
        # 1. إنشاء مستخدمين تجريبيين
        self.stdout.write("1. إنشاء مستخدمين تجريبيين...")
        
        # إنشاء معلم
        teacher_user, created = User.objects.get_or_create(
            username='teacher_test',
            defaults={
                'email': 'teacher@test.com',
                'first_name': 'أحمد',
                'last_name': 'محمد',
                'is_staff': True
            }
        )
        if created:
            teacher_user.set_password('test123')
            teacher_user.save()
            self.stdout.write(self.style.SUCCESS(f"✅ تم إنشاء المعلم: {teacher_user.username}"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  المعلم موجود: {teacher_user.username}"))
        
        # إنشاء طالب
        student_user, created = User.objects.get_or_create(
            username='student_test',
            defaults={
                'email': 'student@test.com',
                'first_name': 'علي',
                'last_name': 'أحمد'
            }
        )
        if created:
            student_user.set_password('test123')
            student_user.save()
            self.stdout.write(self.style.SUCCESS(f"✅ تم إنشاء الطالب: {student_user.username}"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  الطالب موجود: {student_user.username}"))
        
        # إنشاء ملفات شخصية
        teacher_profile, created = Profile.objects.get_or_create(
            user=teacher_user,
            defaults={
                'name': 'أحمد محمد',
                'status': 'Instructor',
                'phone': '0123456789'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إنشاء ملف المعلم الشخصي"))
        
        student_profile, created = Profile.objects.get_or_create(
            user=student_user,
            defaults={
                'name': 'علي أحمد',
                'status': 'Student',
                'phone': '0987654321'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إنشاء ملف الطالب الشخصي"))
        
        self.stdout.write("")
        
        # 2. إنشاء اجتماع تجريبي
        self.stdout.write("2. إنشاء اجتماع تجريبي...")
        
        meeting, created = Meeting.objects.get_or_create(
            title='اجتماع اختباري للدردشة',
            defaults={
                'description': 'اجتماع لاختبار نظام الدردشة والمشاركين',
                'meeting_type': 'LIVE',
                'start_time': datetime.now() - timedelta(hours=1),  # بدأ منذ ساعة
                'duration': timedelta(hours=2),
                'creator': teacher_user,
                'is_active': True,
                'is_live_started': True,
                'live_started_at': datetime.now() - timedelta(minutes=30)
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f"✅ تم إنشاء الاجتماع: {meeting.title}"))
            self.stdout.write(f"   المعرف: {meeting.id}")
            self.stdout.write(f"   النوع: {meeting.meeting_type}")
            self.stdout.write(f"   الحالة: {'مباشر' if meeting.is_live_started else 'غير مباشر'}")
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  الاجتماع موجود: {meeting.title}"))
        
        self.stdout.write("")
        
        # 3. إضافة مشاركين
        self.stdout.write("3. إضافة مشاركين...")
        
        # إضافة المعلم كمشارك
        teacher_participant, created = Participant.objects.get_or_create(
            meeting=meeting,
            user=teacher_user,
            defaults={
                'attendance_status': 'attending',
                'joined_at': datetime.now() - timedelta(minutes=30),
                'is_attending': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إضافة المعلم كمشارك"))
        else:
            self.stdout.write(self.style.WARNING("⚠️  المعلم مشارك بالفعل"))
        
        # إضافة الطالب كمشارك
        student_participant, created = Participant.objects.get_or_create(
            meeting=meeting,
            user=student_user,
            defaults={
                'attendance_status': 'attending',
                'joined_at': datetime.now() - timedelta(minutes=15),
                'is_attending': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إضافة الطالب كمشارك"))
        else:
            self.stdout.write(self.style.WARNING("⚠️  الطالب مشارك بالفعل"))
        
        self.stdout.write("")
        
        # 4. إضافة رسائل دردشة تجريبية
        self.stdout.write("4. إضافة رسائل دردشة تجريبية...")
        
        # رسالة من المعلم
        teacher_message, created = MeetingChat.objects.get_or_create(
            meeting=meeting,
            user=teacher_user,
            message='أهلاً وسهلاً بالجميع، نبدأ المحاضرة',
            defaults={
                'timestamp': datetime.now() - timedelta(minutes=25)
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إضافة رسالة المعلم"))
        
        # رسالة من الطالب
        student_message, created = MeetingChat.objects.get_or_create(
            meeting=meeting,
            user=student_user,
            message='مرحباً دكتور، شكراً لك',
            defaults={
                'timestamp': datetime.now() - timedelta(minutes=20)
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إضافة رسالة الطالب"))
        
        # رسالة أخرى من المعلم
        teacher_message2, created = MeetingChat.objects.get_or_create(
            meeting=meeting,
            user=teacher_user,
            message='هل الجميع جاهز للبدء؟',
            defaults={
                'timestamp': datetime.now() - timedelta(minutes=15)
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS("✅ تم إضافة رسالة المعلم الثانية"))
        
        self.stdout.write("")
        
        # 5. عرض ملخص البيانات
        self.stdout.write("5. ملخص البيانات المنشأة:")
        self.stdout.write(f"   - المعلم: {teacher_user.username} (ID: {teacher_user.id})")
        self.stdout.write(f"   - الطالب: {student_user.username} (ID: {student_user.id})")
        self.stdout.write(f"   - الاجتماع: {meeting.title} (ID: {meeting.id})")
        self.stdout.write(f"   - المشاركون: {meeting.participants.count()}")
        self.stdout.write(f"   - رسائل الدردشة: {meeting.chat_messages.count()}")
        
        self.stdout.write(self.style.SUCCESS("\n=== انتهى إنشاء البيانات التجريبية ==="))
        self.stdout.write("\nيمكنك الآن اختبار النظام باستخدام:")
        self.stdout.write(f"- معرف الاجتماع: {meeting.id}")
        self.stdout.write(f"- رابط المعلم: /teacher/meetings/live/{meeting.id}")
        self.stdout.write(f"- رابط الطالب: /student/meetings/live/{meeting.id}")
        self.stdout.write("\nبيانات تسجيل الدخول:")
        self.stdout.write(f"- المعلم: {teacher_user.username} / test123")
        self.stdout.write(f"- الطالب: {student_user.username} / test123")
