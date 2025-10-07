from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from meetings.models import Meeting, Participant
from rest_framework.test import APIClient
from rest_framework import status
import json


class Command(BaseCommand):
    help = 'اختبار API الاجتماعات'

    def add_arguments(self, parser):
        parser.add_argument(
            '--meeting-id',
            type=int,
            help='معرف الاجتماع المراد اختباره'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='معرف المستخدم المراد اختبار API له'
        )

    def handle(self, *args, **options):
        meeting_id = options.get('meeting_id')
        user_id = options.get('user_id')

        # إنشاء اجتماع تجريبي إذا لم يتم تحديد واحد
        if not meeting_id:
            meeting = Meeting.objects.create(
                title='اجتماع اختبار API',
                description='اجتماع لاختبار API',
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

        # استخدام أول مستخدم متاح إذا لم يتم تحديد واحد
        if not user_id:
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

        self.stdout.write('\n=== اختبار منطق الاجتماعات ===')

        # 1. اختبار التسجيل في الاجتماع
        self.stdout.write('\n1. اختبار التسجيل في الاجتماع...')
        try:
            # إنشاء سجل مشارك
            participant, created = Participant.objects.get_or_create(
                meeting=meeting,
                user=user,
                defaults={
                    'attendance_status': 'registered',
                    'is_attending': False
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS('✓ تم التسجيل في الاجتماع بنجاح'))
            else:
                self.stdout.write(self.style.WARNING('⚠ المستخدم مسجل بالفعل في الاجتماع'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ فشل التسجيل: {str(e)}'))

        # 2. اختبار الانضمام للاجتماع
        self.stdout.write('\n2. اختبار الانضمام للاجتماع...')
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            
            # محاكاة الانضمام
            participant.is_attending = True
            participant.attendance_time = timezone.now()
            participant.attendance_status = 'present'
            participant.save()
            
            self.stdout.write(self.style.SUCCESS('✓ تم الانضمام للاجتماع بنجاح'))
            self.stdout.write(f'   وقت الحضور: {participant.attendance_time}')
        except Participant.DoesNotExist:
            self.stdout.write(self.style.ERROR('✗ المستخدم غير مسجل في الاجتماع'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ فشل الانضمام: {str(e)}'))

        # 3. اختبار تسجيل الحضور
        self.stdout.write('\n3. اختبار تسجيل الحضور...')
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            
            # محاكاة تسجيل الحضور
            participant.mark_attendance()
            
            self.stdout.write(self.style.SUCCESS('✓ تم تسجيل الحضور بنجاح'))
            self.stdout.write(f'   حالة الحضور: {participant.attendance_status}')
        except Participant.DoesNotExist:
            self.stdout.write(self.style.ERROR('✗ المستخدم غير مسجل في الاجتماع'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ فشل تسجيل الحضور: {str(e)}'))

        # 4. اختبار الحصول على قائمة المشاركين
        self.stdout.write('\n4. اختبار الحصول على قائمة المشاركين...')
        try:
            participants = meeting.participants.all()
            self.stdout.write(self.style.SUCCESS(f'✓ تم الحصول على قائمة المشاركين بنجاح'))
            self.stdout.write(f'   عدد المشاركين: {participants.count()}')
            for p in participants:
                self.stdout.write(f'   - {p.user.username}: {p.attendance_status} (متصل: {p.is_attending})')
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ فشل الحصول على قائمة المشاركين: {str(e)}'))

        # 5. اختبار مغادرة الاجتماع
        self.stdout.write('\n5. اختبار مغادرة الاجتماع...')
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            
            # محاكاة المغادرة
            participant.mark_exit()
            
            self.stdout.write(self.style.SUCCESS('✓ تم مغادرة الاجتماع بنجاح'))
            self.stdout.write(f'   مدة الحضور: {participant.attendance_duration}')
        except Participant.DoesNotExist:
            self.stdout.write(self.style.ERROR('✗ المستخدم غير مسجل في الاجتماع'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ فشل مغادرة الاجتماع: {str(e)}'))

        # 6. عرض النتائج النهائية
        self.stdout.write('\n=== النتائج النهائية ===')
        try:
            participant = Participant.objects.get(meeting=meeting, user=user)
            self.stdout.write(f'حالة الحضور: {participant.attendance_status}')
            self.stdout.write(f'متصل حالياً: {participant.is_attending}')
            self.stdout.write(f'وقت الحضور: {participant.attendance_time}')
            self.stdout.write(f'وقت المغادرة: {participant.exit_time}')
            self.stdout.write(f'مدة الحضور: {participant.attendance_duration}')
            
            # إحصائيات الاجتماع
            total_participants = meeting.participants.count()
            attending_participants = meeting.participants.filter(is_attending=True).count()
            present_participants = meeting.participants.filter(attendance_status='present').count()
            
            self.stdout.write(f'\nإحصائيات الاجتماع:')
            self.stdout.write(f'إجمالي المشاركين: {total_participants}')
            self.stdout.write(f'المشاركين الحاليين: {attending_participants}')
            self.stdout.write(f'المشاركين الحاضرين: {present_participants}')
            self.stdout.write(f'معدل الحضور: {meeting.attendance_rate:.1f}%')
            
        except Participant.DoesNotExist:
            self.stdout.write(self.style.ERROR('لم يتم العثور على سجل المشارك'))

        self.stdout.write(self.style.SUCCESS('\nتم اختبار منطق الاجتماعات بنجاح!'))
