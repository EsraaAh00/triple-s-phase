# API الاجتماعات - دليل الاستخدام

## نظرة عامة
تم ربط واجهة إدارة الاجتماعات بالباك إند من خلال خدمة API شاملة تتيح جميع العمليات الأساسية للاجتماعات.

## الخدمات المتاحة

### 1. جلب الاجتماعات
```javascript
// جلب جميع الاجتماعات
const meetings = await meetingAPI.getMeetings();

// جلب اجتماعاتي الشخصية
const myMeetings = await meetingAPI.getMyMeetings();

// جلب اجتماع محدد
const meeting = await meetingAPI.getMeeting(meetingId);
```

### 2. إنشاء وتعديل الاجتماعات
```javascript
// إنشاء اجتماع جديد
const newMeeting = await meetingAPI.createMeeting({
  title: 'عنوان الاجتماع',
  description: 'وصف الاجتماع',
  meeting_type: 'LIVE', // ZOOM, LIVE, NORMAL
  start_time: '2024-01-15T10:00:00Z',
  duration: 60, // بالدقائق
  max_participants: 50,
  enable_screen_share: true,
  enable_chat: true,
  enable_recording: false,
  zoom_link: 'https://zoom.us/j/123456789' // اختياري
});

// تحديث اجتماع موجود
const updatedMeeting = await meetingAPI.updateMeeting(meetingId, meetingData);

// حذف اجتماع
await meetingAPI.deleteMeeting(meetingId);
```

### 3. إدارة الاجتماعات المباشرة
```javascript
// بدء اجتماع مباشر
const roomId = await meetingAPI.startLiveMeeting(meetingId);

// إنهاء اجتماع مباشر
await meetingAPI.endLiveMeeting(meetingId);

// الانضمام لاجتماع
await meetingAPI.joinMeeting(meetingId);

// مغادرة اجتماع
await meetingAPI.leaveMeeting(meetingId);
```

### 4. إدارة المشاركين
```javascript
// جلب قائمة المشاركين
const participants = await meetingAPI.getMeetingParticipants(meetingId);

// إضافة مشارك
await meetingAPI.addParticipant(meetingId, {
  user_id: userId,
  // بيانات إضافية
});

// إزالة مشارك
await meetingAPI.removeParticipant(meetingId, participantId);
```

### 5. الدردشة والرسائل
```javascript
// جلب رسائل الدردشة
const chatMessages = await meetingAPI.getMeetingChat(meetingId);

// إرسال رسالة
await meetingAPI.sendChatMessage(meetingId, 'محتوى الرسالة');
```

### 6. الإشعارات
```javascript
// جلب إشعارات الاجتماع
const notifications = await meetingAPI.getMeetingNotifications(meetingId);

// إنشاء إشعار جديد
await meetingAPI.createMeetingNotification(meetingId, {
  notification_type: 'CUSTOM',
  message: 'رسالة الإشعار',
  scheduled_time: '2024-01-15T10:00:00Z'
});

// تحديد الإشعار كمقروء
await meetingAPI.markNotificationAsRead(notificationId);

// جلب عدد الإشعارات غير المقروءة
const unreadCount = await meetingAPI.getUnreadNotificationsCount();
```

### 7. الملفات والمواد
```javascript
// رفع مواد الاجتماع
await meetingAPI.uploadMeetingMaterials(meetingId, file);

// تحميل مواد الاجتماع
const materials = await meetingAPI.downloadMeetingMaterials(meetingId);
```

### 8. التقارير والإحصائيات
```javascript
// جلب إحصائيات الاجتماعات
const stats = await meetingAPI.getMeetingStats();

// جلب تقرير الحضور
const attendanceReport = await meetingAPI.getMeetingAttendanceReport(meetingId);

// تصدير بيانات الاجتماع
const exportedData = await meetingAPI.exportMeetingData(meetingId, 'pdf');
```

## معالجة الأخطاء

جميع الدوال تتضمن معالجة أخطاء شاملة:

```javascript
try {
  const result = await meetingAPI.createMeeting(meetingData);
  console.log('تم إنشاء الاجتماع بنجاح:', result);
} catch (error) {
  console.error('خطأ في إنشاء الاجتماع:', error.message);
  console.error('تفاصيل الخطأ:', error.response?.data);
}
```

## أنواع البيانات

### نموذج الاجتماع
```javascript
{
  id: 1,
  title: 'عنوان الاجتماع',
  description: 'وصف الاجتماع',
  meeting_type: 'LIVE', // ZOOM, LIVE, NORMAL
  start_time: '2024-01-15T10:00:00Z',
  duration: 60,
  creator: {
    id: 1,
    username: 'username',
    email: 'email@example.com'
  },
  zoom_link: 'https://zoom.us/j/123456789',
  recording_url: 'https://example.com/recording',
  materials: 'path/to/materials',
  is_active: true,
  meeting_room_id: 'uuid-string',
  is_live_started: false,
  live_started_at: null,
  live_ended_at: null,
  max_participants: 50,
  enable_screen_share: true,
  enable_chat: true,
  enable_recording: false,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z'
}
```

### نموذج المشارك
```javascript
{
  id: 1,
  meeting: 1,
  user: {
    id: 1,
    username: 'username',
    email: 'email@example.com'
  },
  is_attending: false,
  attendance_time: null,
  exit_time: null,
  attendance_duration: null
}
```

## الاستخدام في المكونات

### مثال على استخدام في React Component
```javascript
import React, { useState, useEffect } from 'react';
import { meetingAPI } from '../../../services/meeting.service';

const MeetingsComponent = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingAPI.getMyMeetings();
      setMeetings(response.results || response);
      setError(null);
    } catch (err) {
      setError('حدث خطأ في تحميل الاجتماعات');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData) => {
    try {
      await meetingAPI.createMeeting(meetingData);
      fetchMeetings(); // إعادة تحميل القائمة
    } catch (err) {
      console.error('Error creating meeting:', err);
    }
  };

  // ... باقي المنطق
};
```

## اختبار API

يمكن استخدام ملف `TestMeetingsAPI.jsx` لاختبار جميع وظائف API:

```javascript
import TestMeetingsAPI from './TestMeetingsAPI';

// في المكون الرئيسي
<TestMeetingsAPI />
```

## ملاحظات مهمة

1. **المصادقة**: جميع الطلبات تتطلب مصادقة صالحة (JWT Token)
2. **الصلاحيات**: بعض العمليات تتطلب صلاحيات محددة (مدرس، طالب، إداري)
3. **التوقيت**: جميع التواريخ يجب أن تكون بصيغة ISO 8601
4. **الملفات**: رفع الملفات يتطلب استخدام FormData
5. **الأخطاء**: جميع الأخطاء يتم إرجاعها مع رسائل واضحة باللغة العربية

## تحديثات مستقبلية

- دعم الاجتماعات المتعددة اللغات
- إضافة ميزات الفيديو المباشر
- تحسين نظام الإشعارات
- إضافة تقارير متقدمة
- دعم التكامل مع منصات خارجية
