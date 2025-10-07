import logging
from typing import Any, Dict, Optional, Type, TypeVar

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from users.models import Profile, Instructor, Student

# Add type hints for model classes to help IDE with attribute recognition
_ModelT = TypeVar('_ModelT', bound=Model)

# Add type ignores for Django's dynamic attributes
# These are safe to ignore as they are dynamically added by Django
Profile.objects  # type: ignore[attr-defined]
Student.objects  # type: ignore[attr-defined]
Instructor.objects  # type: ignore[attr-defined]

# Add type ignores for DoesNotExist exceptions
Profile.DoesNotExist  # type: ignore[attr-defined]
Student.DoesNotExist  # type: ignore[attr-defined]
Instructor.DoesNotExist  # type: ignore[attr-defined]
User.DoesNotExist  # type: ignore[attr-defined]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """تسجيل مستخدم جديد"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    name = serializers.CharField(max_length=100)
    phone = serializers.CharField(max_length=20, required=False)
    status = serializers.ChoiceField(
        choices=[('Student', 'طالب'), ('Instructor', 'مدرب')],
        default='Student'
    )
    
    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'name', 'phone', 'status']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("كلمتا المرور غير متطابقتان")
        return attrs
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مسجل بالفعل")
        return value
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        name = validated_data.pop('name')
        phone = validated_data.pop('phone', '')
        status = validated_data.pop('status', 'Student')
        
        # إنشاء المستخدم
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # إنشاء أو تحديث Profile
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(
                user=user,
                name=name,
                email=validated_data['email'],
                phone=phone,
                status=status
            )
        else:
            profile.name = name
            profile.phone = phone
            profile.status = status
            profile.save()
        
        # إنشاء Student أو Teacher حسب النوع
        if status == 'Student':
            Student.objects.create(profile=profile)
        elif status == 'Instructor':
            Instructor.objects.create(profile=profile)
        
        return user


import logging

class UserLoginSerializer(serializers.Serializer):
    """تسجيل دخول المستخدم"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger(__name__)
    
    def validate(self, attrs):
        email_or_username = attrs.get('email')
        password = attrs.get('password')
        
        self.logger.info(f'Starting validation for: {email_or_username}')
        
        if not email_or_username or not password:
            self.logger.error('Email/username or password missing in request')
            raise serializers.ValidationError("يجب إدخال البريد الإلكتروني/اسم المستخدم وكلمة المرور")
        
        self.logger.debug(f'Attempting to authenticate user: {email_or_username}')
        
        # Try to authenticate with email first
        user = None
        
        # Check if the input is an email
        if '@' in email_or_username:
            self.logger.debug('Input appears to be an email, trying to find by email')
            try:
                # Try to find user by email
                user = User.objects.get(email=email_or_username)
                self.logger.debug(f'Found user by email: {user.username}')
                # Authenticate with the found username
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                self.logger.debug(f'No user found with email: {email_or_username}')
        
        # If user is still None, try to authenticate with username
        if user is None:
            self.logger.debug(f'Trying to authenticate with username: {email_or_username}')
            user = authenticate(username=email_or_username, password=password)
        
        if not user:
            self.logger.warning(f'Authentication failed for: {email_or_username}')
            # Check if user exists but password is wrong
            if User.objects.filter(username=email_or_username).exists() or \
               User.objects.filter(email=email_or_username).exists():
                self.logger.error('Invalid password provided')
                raise serializers.ValidationError({"password": ["كلمة المرور غير صحيحة"]})
            else:
                self.logger.error(f'No user found with email/username: {email_or_username}')
                raise serializers.ValidationError({"email": ["لا يوجد حساب بهذا البريد الإلكتروني/اسم المستخدم"]})
        
        self.logger.info(f'User authenticated: {user.username}, is_active: {user.is_active}')
        
        if not user.is_active:
            self.logger.error(f'User account is not active: {user.username}')
            raise serializers.ValidationError({"non_field_errors": ["تم إيقاف هذا الحساب"]})
        
        # Additional check for instructor status
        if hasattr(user, 'profile') and hasattr(user.profile, 'status'):
            self.logger.info(f'User profile status: {user.profile.status}')
            
            # Check if user is trying to access instructor endpoints but is not an instructor
            if user.profile.status != 'Instructor':
                self.logger.warning(f'User {user.username} is not an instructor (status: {user.profile.status})')
        
        attrs['user'] = user
        self.logger.info('Validation successful')
        return attrs


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'date_joined', 'profile')
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'id': profile.id,
                'name': profile.name,
                'status': profile.status,
                'image_profile': profile.image_profile.url if profile.image_profile else None,
                'shortBio': profile.shortBio,
            }
        except Profile.DoesNotExist:
            return None


class TokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class ProfileSerializer(serializers.ModelSerializer):
    """سيريلايزر للملف الشخصي"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'user_email', 'name', 'email', 'phone', 
            'image_profile', 'shortBio', 'status', 'github', 'youtube', 
            'twitter', 'facebook', 'instagram', 'linkedin', 'created_at'
        ]
        read_only_fields = ['id', 'user_id', 'user_email', 'created_at']


class StudentSerializer(serializers.ModelSerializer):
    """سيريلايزر للطالب"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'profile', 'date_of_birth', 'department']


class InstructorSerializer(serializers.ModelSerializer):
    """سيريلايزر للمدرب"""
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = Instructor
        fields = ['id', 'profile', 'department', 'qualification', 'bio', 'research_interests']
        read_only_fields = ['id']


class PasswordChangeSerializer(serializers.Serializer):
    """تغيير كلمة المرور"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("كلمتا المرور الجديدتان غير متطابقتان")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("كلمة المرور الحالية غير صحيحة")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """تخصيص JWT token مع بيانات إضافية"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # إضافة بيانات مخصصة للتوكن
        try:
            profile = user.profile
            token['name'] = profile.name
            token['status'] = profile.status
            token['user_id'] = user.id
        except Profile.DoesNotExist:
            token['name'] = user.username
            token['status'] = 'Student'
            token['user_id'] = user.id
        
        return token


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """تحديث الملف الشخصي"""
    # حقول إضافية للطالب/المعلم
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    qualification = serializers.CharField(max_length=200, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    research_interests = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Profile
        fields = [
            'name', 'phone', 'image_profile', 'shortBio', 'github', 
            'youtube', 'twitter', 'facebook', 'instagram', 'linkedin',
            'date_of_birth', 'department', 'qualification', 'bio', 'research_interests'
        ]
    
    def update(self, instance, validated_data):
        # فصل بيانات Student/Teacher
        student_teacher_fields = {
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'department': validated_data.pop('department', None),
            'qualification': validated_data.pop('qualification', None),
            'bio': validated_data.pop('bio', None),
            'research_interests': validated_data.pop('research_interests', None),
        }
        
        # تحديث Profile
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        
        # تحديث Student أو Teacher
        if instance.status == 'Student':
            try:
                student = Student.objects.get(profile=instance)
                if student_teacher_fields['date_of_birth'] is not None:
                    student.date_of_birth = student_teacher_fields['date_of_birth']
                if student_teacher_fields['department']:
                    student.department = student_teacher_fields['department']
                student.save()
            except Student.DoesNotExist:
                Student.objects.create(
                    profile=instance,
                    date_of_birth=student_teacher_fields['date_of_birth'],
                    department=student_teacher_fields['department'] or None
                )
        
        elif instance.status == 'Instructor':
            try:
                instructor = Instructor.objects.get(profile=instance)
                if student_teacher_fields['date_of_birth'] is not None:
                    instructor.date_of_birth = student_teacher_fields['date_of_birth']
                if student_teacher_fields['department']:
                    instructor.department = student_teacher_fields['department']
                if student_teacher_fields['qualification']:
                    instructor.qualification = student_teacher_fields['qualification']
                if student_teacher_fields['bio']:
                    instructor.bio = student_teacher_fields['bio']
                if student_teacher_fields['research_interests']:
                    instructor.research_interests = student_teacher_fields['research_interests']
                instructor.save()
            except Instructor.DoesNotExist:
                Instructor.objects.create(
                    profile=instance,
                    date_of_birth=student_teacher_fields['date_of_birth'],
                    department=student_teacher_fields['department'] or None,
                    qualification=student_teacher_fields['qualification'] or None,
                    bio=student_teacher_fields['bio'] or None,
                    research_interests=student_teacher_fields['research_interests'] or None
                )
        
        return instance 
