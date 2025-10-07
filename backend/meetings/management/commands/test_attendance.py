from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from meetings.models import Meeting, Participant


class Command(BaseCommand):
    help = 'اختبار نظام تسجيل الحضور للاجتماعات'

    def add_arguments(self, parser):
        parser.add_argument(
            '--meeting-id',
            type=int,
            help='معرف الاجتماع المراد اختباره'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='معرف المستخدم المراد اختبار حضوره'
        )

    def handle(self, *args, **options):
        meeting_id = options.get('meeting_id')
        user_id = options.get('user_id')

        if not meeting_id:
            # إنشاء اجتماع تجريبي
            meeting = Meeting.objects.create(
                title='اجتماع اختبار الحضور',
                description='اجتماع لاختبار نظام تسجيل الحضور',
                meeting_type='LIVE',
                start_time=timezone.now() - timedelta(minutes=30),
                duration=timedelta(hours=1),
                creator=User.objects.first(),
                is_active=True
            )
            self.stdout.write(f'تم إنشاء اجتماع تجريبي برقم: {meeting.id}')
        else:
            try:
                meeting = Meeting.objects.get(id=meeting_id)
                self.stdout.write(f'تم العثور على الاجتماع: {meeting.title}')
            except Meeting.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'الاجتماع برقم {meeting_id} غير موجود'))
                return

        if not user_id:
            # استخدام أول مستخدم متاح
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR('لا يوجد مستخدمين في النظام'))
                return
            self.stdout.write(f'استخدام المستخدم: {user.username}')
        else:
            try:
                user = User.objects.get(id=user_id)
                self.stdout.write(f'تم العثور على المستخدم: {user.username}')
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'المستخدم برقم {user_id} غير موجود'))
                return

        # اختبار تسجيل الحضور
        self.stdout.write('\n=== اختبار تسجيل الحضور ===')
        
        # 1. إنشاء سجل مشارك
        participant, created = Participant.objects.get_or_create(
            meeting=meeting,
            user=user,
            defaults={'attendance_status': 'registered'}
        )
        
        if created:
            self.stdout.write(f'تم إنشاء سجل مشارك جديد للمستخدم {user.username}')
        else:
            self.stdout.write(f'المستخدم {user.username} مسجل بالفعل في الاجتماع')
        
        # 2. تسجيل الحضور
        participant.is_attending = True
        participant.attendance_time = timezone.now()
        participant.attendance_status = 'present'
        participant.save()
        
        self.stdout.write(f'تم تسجيل الحضور للمستخدم {user.username}')
        self.stdout.write(f'وقت الحضور: {participant.attendance_time}')
        self.stdout.write(f'حالة الحضور: {participant.attendance_status}')
        
        # 3. محاكاة مغادرة الاجتماع
        import time
        time.sleep(2)  # انتظار ثانيتين
        
        participant.exit_time = timezone.now()
        participant.is_attending = False
        if participant.attendance_time:
            participant.attendance_duration = participant.exit_time - participant.attendance_time
        participant.save()
        
        self.stdout.write(f'تم تسجيل المغادرة للمستخدم {user.username}')
        self.stdout.write(f'وقت المغادرة: {participant.exit_time}')
        self.stdout.write(f'مدة الحضور: {participant.attendance_duration}')
        
        # 4. عرض إحصائيات الاجتماع
        self.stdout.write('\n=== إحصائيات الاجتماع ===')
        total_participants = meeting.participants.count()
        attending_participants = meeting.participants.filter(is_attending=True).count()
        present_participants = meeting.participants.filter(attendance_status='present').count()
        
        self.stdout.write(f'إجمالي المشاركين: {total_participants}')
        self.stdout.write(f'المشاركين الحاليين: {attending_participants}')
        self.stdout.write(f'المشاركين الحاضرين: {present_participants}')
        self.stdout.write(f'معدل الحضور: {meeting.attendance_rate:.1f}%')
        
        self.stdout.write(self.style.SUCCESS('\nتم اختبار نظام الحضور بنجاح!'))
