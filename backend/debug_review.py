#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from reviews.models import CourseReview
from users.models import Profile

# التحقق من التقييم رقم 21
try:
    review = CourseReview.objects.get(id=21)
    print(f"=== REVIEW DEBUG ===")
    print(f"Review ID: {review.id}")
    print(f"User: {review.user}")
    print(f"User ID: {review.user.id}")
    print(f"User username: {review.user.username}")
    print(f"User first_name: {review.user.first_name}")
    print(f"User last_name: {review.user.last_name}")
    print(f"User get_full_name(): {review.user.get_full_name()}")
    
    # التحقق من Profile
    print(f"\n=== PROFILE DEBUG ===")
    try:
        profile = Profile.objects.get(user=review.user)
        print(f"Profile exists: True")
        print(f"Profile name: '{profile.name}'")
        print(f"Profile name type: {type(profile.name)}")
        print(f"Profile name length: {len(profile.name) if profile.name else 0}")
        print(f"Profile status: {profile.status}")
    except Profile.DoesNotExist:
        print(f"Profile exists: False")
        print("Creating profile...")
        profile = Profile.objects.create(
            user=review.user,
            name=review.user.get_full_name() or review.user.username,
            email=review.user.email,
            status='Student'
        )
        print(f"Profile created with name: '{profile.name}'")
    
    # التحقق من hasattr
    print(f"\n=== HASATTR DEBUG ===")
    print(f"hasattr(review.user, 'profile'): {hasattr(review.user, 'profile')}")
    print(f"review.user.profile: {getattr(review.user, 'profile', 'NO PROFILE')}")
    
    # اختبار الـ serializer method
    print(f"\n=== SERIALIZER METHOD TEST ===")
    from reviews.serializers import ReviewSerializer
    from rest_framework.test import APIRequestFactory
    
    factory = APIRequestFactory()
    request = factory.get('/')
    request.user = review.user
    
    serializer = ReviewSerializer(review, context={'request': request})
    data = serializer.data
    
    print(f"user_name from serializer: '{data.get('user_name', 'NOT FOUND')}'")
    print(f"user_image from serializer: '{data.get('user_image', 'NOT FOUND')}'")
    
except CourseReview.DoesNotExist:
    print("Review with ID 21 not found")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
