from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from users.models import Profile, Student, Organization, Instructor
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView as BaseTokenObtainPairView
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import re


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined']


class UserListSerializer(serializers.ModelSerializer):
    """Serializer for listing users with profile info"""
    profile_name = serializers.CharField(source='profile.name', read_only=True)
    profile_status = serializers.CharField(source='profile.status', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_active', 'profile_name', 'profile_status']
        read_only_fields = ['id', 'date_joined']


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'description', 'location', 'website', 'founded_year', 'employees']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.CharField(source='user.id', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'name', 'user', 'user_id', 'user_email', 'email', 'phone', 'status',
            'image_profile', 'shortBio', 'detail', 'github', 'youtube', 'twitter',
            'facebook', 'instagram', 'linkedin', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'user_id', 'user_email', 'created_at']

    def get_created_at(self, obj):
        return obj.user.date_joined if obj.user else None


class StudentSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'profile', 'department', 'date_of_birth']


class UserRegistrationSerializer(serializers.Serializer):
    # Required fields (matching frontend exactly)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    terms_accepted = serializers.BooleanField()
    
    # Optional fields
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    # User type field
    user_type = serializers.ChoiceField(
        choices=['student', 'instructor', 'organization'], 
        required=False, 
        default='student'
    )
    
    # Instructor fields
    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    # Organization fields
    organization_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    
    # Optional fields
    marketing_consent = serializers.BooleanField(required=False, default=False)
    username = serializers.CharField(max_length=255, required=False)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("هذا البريد الإلكتروني مسجل بالفعل")
        return value

    def validate(self, data):
        # Validate password confirmation
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "كلمتا المرور غير متطابقتان"})
        
        # Validate password strength (relaxed for now)
        if password and len(password) < 6:
            raise serializers.ValidationError({"password": "كلمة المرور يجب أن تكون 6 أحرف على الأقل"})
        
        # Validate name fields
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        
        if not first_name or not last_name:
            raise serializers.ValidationError({"first_name": "الاسم الأول والأخير مطلوبان"})
        
        # Validate terms acceptance
        if not data.get('terms_accepted', False):
            raise serializers.ValidationError({"terms_accepted": "يجب الموافقة على شروط الاستخدام"})
        
        return data

    def create(self, validated_data):
        # Remove password confirmation
        validated_data.pop('password_confirm')
        
        # Extract name fields
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        full_name = f"{first_name} {last_name}".strip()
        
        # Handle user type mapping
        user_type = validated_data.pop('user_type', 'student')
        status_map = {
            'student': 'Student',
            'instructor': 'Instructor',
            'organization': 'Organization'
        }
        status = status_map.get(user_type, 'Student')
        
        # Generate username if not provided
        username = validated_data.pop('username', None)
        if not username:
            username = validated_data['email']
        
        # Remove non-user fields
        terms_accepted = validated_data.pop('terms_accepted')
        marketing_consent = validated_data.pop('marketing_consent', False)
        phone = validated_data.pop('phone', '')
        country = validated_data.pop('country', '')
        city = validated_data.pop('city', '')
        specialization = validated_data.pop('specialization', '')
        experience_years = validated_data.pop('experience_years', 0)
        bio = validated_data.pop('bio', '')
        organization_name = validated_data.pop('organization_name', '')
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        
        # Get or create profile (Django signal might have already created it)
        profile, profile_created = Profile.objects.get_or_create(
            user=user,
            defaults={
                'name': full_name,
                'email': validated_data['email'],
                'phone': phone,
                'status': status
            }
        )
        
        # Update profile if it was created by signal with default values
        if not profile_created or not profile.name:
            profile.name = full_name
            profile.email = validated_data['email']
            profile.phone = phone
            profile.status = status
            profile.save()
        
        # Create specific user profile based on type
        if status == 'Student':
            Student.objects.create(profile=profile)
        elif status == 'Instructor':
            Instructor.objects.create(
                profile=profile,
                qualification=specialization,
                bio=bio
            )
        elif status == 'Organization':
            Organization.objects.create(
                profile=profile,
                description=bio,
                location=city
            )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Try to get user by email first
            try:
                user = User.objects.get(email=email)
                
                # Check if user is active
                if not user.is_active:
                    raise serializers.ValidationError("هذا الحساب غير نشط")
                
                # Check password manually
                if user.check_password(password):
                    data['user'] = user
                else:
                    raise serializers.ValidationError("كلمة المرور غير صحيحة")
                    
            except User.DoesNotExist:
                raise serializers.ValidationError("لا يوجد حساب بهذا البريد الإلكتروني")
        else:
            raise serializers.ValidationError("يجب إدخال البريد الإلكتروني وكلمة المرور")

        return data


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("كلمة المرور الحالية غير صحيحة")
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "كلمتا المرور الجديدتان غير متطابقتان"})
        
        # Validate password strength
        password = data['new_password']
        if len(password) < 8:
            raise serializers.ValidationError({"new_password": "كلمة المرور يجب أن تكون 8 أحرف على الأقل"})
        
        return data

    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class ProfileUpdateSerializer(serializers.ModelSerializer):
    # Student specific fields
    student_department = serializers.CharField(required=False, allow_blank=True)
    student_date_of_birth = serializers.DateField(required=False, allow_null=True)
    
    class Meta:
        model = Profile
        fields = [
            'name', 'phone', 'image_profile', 'shortBio', 'detail',
            'github', 'youtube', 'twitter', 'facebook', 'instagram', 'linkedin',
            'student_department', 'student_date_of_birth'
        ]

    def update(self, instance, validated_data):
        # Extract student specific data
        student_data = {
            'department': validated_data.pop('student_department', None),
            'date_of_birth': validated_data.pop('student_date_of_birth', None)
        }
        
        # Update profile
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update student data
        if instance.status == 'Student':
            student, created = Student.objects.get_or_create(profile=instance)
            for attr, value in student_data.items():
                if value is not None:
                    setattr(student, attr, value)
            student.save()
        
        return instance


class UserDetailSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    user_details = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'profile', 'user_details']
    
    def get_user_details(self, obj):
        try:
            profile = obj.profile
            if profile.status == 'Student':
                try:
                    student = Student.objects.get(profile=profile)
                    return StudentSerializer(student).data
                except Student.DoesNotExist:
                    return None
        except Profile.DoesNotExist:
            pass
        return None


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token obtain serializer that includes additional user information in the response."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['is_superuser'] = user.is_superuser
        
        # Add profile information if it exists
        try:
            profile = user.profile
            token['profile_id'] = str(profile.id)
            token['status'] = profile.status
            
            # Add additional profile info
            token['name'] = profile.name or ''
            token['email'] = profile.email or user.email
            token['phone'] = profile.phone or ''
            token['status'] = profile.status or ''
            
            # Add profile picture URL if it exists
            if profile.image_profile:
                token['image_profile'] = profile.image_profile.url
            else:
                token['image_profile'] = None
                
        except Profile.DoesNotExist:
            pass
            
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add additional user data to the response
        refresh = self.get_token(self.user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        # Add user data
        user_data = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        
        # Add profile data if it exists
        try:
            profile = self.user.profile
            user_data.update({
                'profile_id': str(profile.id),
                'name': profile.name,
                'email': profile.email or self.user.email,
                'phone': profile.phone or '',
                'status': profile.status,
                'image_profile': profile.image_profile.url if profile.image_profile else None,
                'shortBio': profile.shortBio or '',
                'detail': profile.detail or '',
                'social_links': {
                    'github': profile.github or '',
                    'youtube': profile.youtube or '',
                    'twitter': profile.twitter or '',
                    'facebook': profile.facebook or '',
                    'instagram': profile.instagram or '',
                    'linkedin': profile.linkedin or '',
                }
            })
        except Profile.DoesNotExist:
            pass
            
        data['user'] = user_data
        return data


class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        exists = User.objects.filter(email=value).exists()
        return {'exists': exists, 'email': value}


class CustomTokenObtainPairView(BaseTokenObtainPairView):
    """
    Custom token obtain view that uses our custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer
