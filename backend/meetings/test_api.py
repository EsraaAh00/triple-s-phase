#!/usr/bin/env python
"""
اختبار بسيط لـ API الاجتماعات
يستخدم requests للتحقق من عمل endpoints
"""

import requests
import json
from datetime import datetime, timedelta

# إعدادات الـ API
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_meeting_api():
    """اختبار API الاجتماعات"""
    
    print("=== اختبار API الاجتماعات ===\n")
    
    # 1. اختبار جلب الاجتماعات
    print("1. اختبار جلب الاجتماعات...")
    try:
        response = requests.get(f"{API_BASE}/meetings/meetings/")
        if response.status_code == 200:
            meetings = response.json()
            print(f"✅ تم جلب {len(meetings)} اجتماع")
            if meetings:
                print(f"   أول اجتماع: {meetings[0].get('title', 'بدون عنوان')}")
        else:
            print(f"❌ فشل في جلب الاجتماعات: {response.status_code}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    print()
    
    # 2. اختبار جلب اجتماع محدد
    print("2. اختبار جلب اجتماع محدد...")
    try:
        # افتراض أن هناك اجتماع بمعرف 1
        response = requests.get(f"{API_BASE}/meetings/meetings/1/")
        if response.status_code == 200:
            meeting = response.json()
            print(f"✅ تم جلب الاجتماع: {meeting.get('title', 'بدون عنوان')}")
            print(f"   المعرف: {meeting.get('id')}")
            print(f"   النوع: {meeting.get('meeting_type')}")
        elif response.status_code == 404:
            print("⚠️  الاجتماع غير موجود (هذا طبيعي إذا لم يتم إنشاء اجتماعات)")
        else:
            print(f"❌ فشل في جلب الاجتماع: {response.status_code}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    print()
    
    # 3. اختبار جلب المشاركين
    print("3. اختبار جلب المشاركين...")
    try:
        response = requests.get(f"{API_BASE}/meetings/meetings/1/participants/")
        if response.status_code == 200:
            participants = response.json()
            print(f"✅ تم جلب {len(participants)} مشارك")
            for p in participants[:3]:  # عرض أول 3 مشاركين
                print(f"   - {p.get('user_name', 'غير محدد')} ({p.get('attendance_status', 'غير محدد')})")
        elif response.status_code == 404:
            print("⚠️  الاجتماع غير موجود")
        else:
            print(f"❌ فشل في جلب المشاركين: {response.status_code}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    print()
    
    # 4. اختبار جلب رسائل الدردشة
    print("4. اختبار جلب رسائل الدردشة...")
    try:
        response = requests.get(f"{API_BASE}/meetings/meetings/1/chat/")
        if response.status_code == 200:
            messages = response.json()
            print(f"✅ تم جلب {len(messages)} رسالة")
            for msg in messages[:3]:  # عرض أول 3 رسائل
                print(f"   - {msg.get('user_name', 'غير محدد')}: {msg.get('message', '')[:50]}...")
        elif response.status_code == 404:
            print("⚠️  الاجتماع غير موجود")
        else:
            print(f"❌ فشل في جلب الرسائل: {response.status_code}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    print()
    
    # 5. اختبار إنشاء اجتماع جديد
    print("5. اختبار إنشاء اجتماع جديد...")
    try:
        new_meeting_data = {
            "title": "اجتماع اختباري",
            "description": "اجتماع لاختبار API",
            "meeting_type": "LIVE",
            "start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "duration": "01:00:00",
            "max_participants": 20
        }
        
        response = requests.post(
            f"{API_BASE}/meetings/meetings/",
            json=new_meeting_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            meeting = response.json()
            print(f"✅ تم إنشاء الاجتماع: {meeting.get('title')}")
            print(f"   المعرف: {meeting.get('id')}")
            
            # اختبار إرسال رسالة دردشة
            print("\n6. اختبار إرسال رسالة دردشة...")
            chat_data = {"message": "رسالة اختبار من API"}
            chat_response = requests.post(
                f"{API_BASE}/meetings/meetings/{meeting.get('id')}/chat/",
                json=chat_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if chat_response.status_code == 201:
                print("✅ تم إرسال الرسالة بنجاح")
            else:
                print(f"❌ فشل في إرسال الرسالة: {chat_response.status_code}")
                
        elif response.status_code == 401:
            print("⚠️  يحتاج مصادقة (هذا طبيعي)")
        else:
            print(f"❌ فشل في إنشاء الاجتماع: {response.status_code}")
            print(f"   الاستجابة: {response.text}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    print("\n=== انتهى الاختبار ===")

def test_auth_api():
    """اختبار API المصادقة"""
    
    print("\n=== اختبار API المصادقة ===\n")
    
    # اختبار تسجيل الدخول
    print("1. اختبار تسجيل الدخول...")
    try:
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{API_BASE}/auth/login/",
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            auth_data = response.json()
            print("✅ تم تسجيل الدخول بنجاح")
            print(f"   المستخدم: {auth_data.get('user', {}).get('username')}")
            return auth_data.get('access')
        elif response.status_code == 401:
            print("⚠️  بيانات تسجيل الدخول غير صحيحة")
        else:
            print(f"❌ فشل في تسجيل الدخول: {response.status_code}")
    except Exception as e:
        print(f"❌ خطأ في الاتصال: {e}")
    
    return None

if __name__ == "__main__":
    print("بدء اختبار API الاجتماعات...")
    print(f"الـ API Base URL: {API_BASE}")
    print()
    
    # اختبار المصادقة أولاً
    token = test_auth_api()
    
    # اختبار API الاجتماعات
    test_meeting_api()
    
    print("\nملاحظات:")
    print("- تأكد من تشغيل Django server على localhost:8000")
    print("- تأكد من وجود مستخدمين في قاعدة البيانات")
    print("- بعض الاختبارات قد تفشل إذا لم تكن البيانات موجودة")
