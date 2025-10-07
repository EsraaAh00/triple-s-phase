from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
# from drf_spectacular.utils import extend_schema, OpenApiResponse  # Temporarily disabled
from users.models import Profile, Instructor, Student

from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer, 
    UserSerializer, 
    TokenResponseSerializer,
    PasswordChangeSerializer,
    ProfileSerializer,
    StudentSerializer,
    InstructorSerializer,
    CustomTokenObtainPairSerializer,
    ProfileUpdateSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """تسجيل مستخدم جديد"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            
            # إنشاء access token فقط (بدون refresh token)
            access_token = AccessToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'تم إنشاء الحساب بنجاح. يرجى تفعيل حسابك من الإيميل.',
                'user': UserSerializer(user).data,
                'token': str(access_token),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'error': 'بيانات غير صحيحة',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """تسجيل دخول المستخدم"""
    import logging
    logger = logging.getLogger(__name__)
    logger.info('Login attempt started')
    
    try:
        logger.debug(f'Request data: {request.data}')
        
        # Log the raw request body for debugging
        try:
            logger.debug(f'Request body: {request.body.decode("utf-8")}')
        except Exception as e:
            logger.warning(f'Could not decode request body: {str(e)}')
        
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f'Serializer validation failed: {serializer.errors}')
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        logger.info('Serializer validation successful')
        user = serializer.validated_data.get('user')
        
        if not user:
            logger.error('No user found in validated_data')
            return Response(
                {'non_field_errors': ['Invalid credentials']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(f'User found: {user.username}, is_active: {user.is_active}')
        
        # Log profile status
        if hasattr(user, 'profile'):
            logger.info(f'User profile status: {getattr(user.profile, "status", "No status")}')
        
        # تسجيل الدخول للجلسة التقليدية
        login(request, user)
        logger.info('User logged in successfully')
        
        # إنشاء access token فقط (بدون refresh token)
        access_token = AccessToken.for_user(user)
        logger.info('Access token generated')
        
        # Initialize response data with default values
        response_data = {
            'message': 'تم تسجيل الدخول بنجاح',
            'user': UserSerializer(user).data,
            'profile': None,
            'user_details': None,
            'token': str(access_token),
        }
        
        # Try to get profile data if it exists
        try:
            if hasattr(user, 'profile'):
                profile = user.profile
                profile_data = ProfileSerializer(profile).data
                response_data['profile'] = profile_data
                
                # Get additional user type data if available
                if hasattr(profile, 'status'):
                    try:
                        if profile.status == 'Student':
                            student = Student.objects.filter(profile=profile).first()
                            if student:
                                response_data['user_details'] = StudentSerializer(student).data
                        elif profile.status == 'Instructor':
                            instructor = Instructor.objects.filter(profile=profile).first()
                            if instructor:
                                response_data['user_details'] = InstructorSerializer(instructor).data
                    except Exception as e:
                        print(f"Error getting user type data: {str(e)}")
                        # Continue without user type data
                        
        except Exception as e:
            print(f"Error getting profile data: {str(e)}")
            # Continue with default response without profile data
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f'Unexpected error during login: {str(e)}')
        return Response({
            'non_field_errors': ['حدث خطأ غير متوقع أثناء تسجيل الدخول']
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """تسجيل خروج المستخدم"""
    try:
        # تسجيل الخروج من الجلسة التقليدية
        logout(request)
        
        return Response({
            'message': 'تم تسجيل الخروج بنجاح'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'حدث خطأ أثناء تسجيل الخروج'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """عرض الملف الشخصي للمستخدم الحالي"""
    try:
        profile = request.user.profile
        profile_data = ProfileSerializer(profile).data
        
        # جلب بيانات إضافية حسب نوع المستخدم
        user_type_data = None
        if profile.status == 'Student':
            try:
                student = Student.objects.filter(profile=profile).first()
                if student:
                    user_type_data = StudentSerializer(student).data
            except Student.DoesNotExist:
                pass
        elif profile.status == 'Instructor':
            try:
                instructor = Instructor.objects.get(profile=profile)
                user_type_data = InstructorSerializer(instructor).data
            except Instructor.DoesNotExist:
                pass
        
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': profile_data,
            'user_details': user_type_data
        }, status=status.HTTP_200_OK)
        
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """تحديث الملف الشخصي"""
    try:
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(
            profile, 
            data=request.data, 
            partial=request.method == 'PATCH'
        )
        
        if serializer.is_valid():
            updated_profile = serializer.save()
            
            # جلب البيانات المحدثة
            profile_data = ProfileSerializer(updated_profile).data
            
            # جلب بيانات إضافية حسب نوع المستخدم
            user_type_data = None
            if updated_profile.status == 'Student':
                try:
                    student = Student.objects.get(profile=updated_profile)
                    user_type_data = StudentSerializer(student).data
                except Student.DoesNotExist:
                    pass
            elif updated_profile.status == 'Instructor':
                try:
                    instructor = Instructor.objects.get(profile=updated_profile)
                    user_type_data = InstructorSerializer(instructor).data
                except Instructor.DoesNotExist:
                    pass
            
            return Response({
                'message': 'تم تحديث الملف الشخصي بنجاح',
                'profile': profile_data,
                'user_details': user_type_data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """تغيير كلمة المرور"""
    serializer = PasswordChangeSerializer(
        data=request.data, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'تم تغيير كلمة المرور بنجاح'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetailView(generics.RetrieveAPIView):
    """عرض ملف شخصي محدد (للعامة)"""
    serializer_class = ProfileSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        profile_id = self.kwargs.get('profile_id')
        try:
            return Profile.objects.get(id=profile_id)
        except Profile.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        profile = self.get_object()
        if not profile:
            return Response({
                'error': 'لم يتم العثور على المستخدم'
            }, status=status.HTTP_404_NOT_FOUND)
        
        profile_data = ProfileSerializer(profile).data
        
        # جلب بيانات إضافية حسب نوع المستخدم (بيانات عامة فقط)
        user_type_data = None
        if profile.status == 'Student':
            try:
                student = Student.objects.get(profile=profile)
                user_type_data = {
                    'department': student.department,
                    'type': 'Student'
                }
            except Student.DoesNotExist:
                pass
        elif profile.status == 'Instructor':
            try:
                instructor = Instructor.objects.get(profile=profile)
                user_type_data = {
                    'department': instructor.department,
                    'qualification': instructor.qualification,
                    'bio': instructor.bio,
                    'research_interests': instructor.research_interests,
                    'type': 'Instructor'
                }
            except Instructor.DoesNotExist:
                pass
        
        return Response({
            'profile': profile_data,
            'user_details': user_type_data
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email_exists(request):
    """التحقق من وجود بريد إلكتروني"""
    email = request.query_params.get('email')
    if not email:
        return Response({
            'error': 'يجب إرسال البريد الإلكتروني'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    return Response({
        'exists': exists,
        'message': 'البريد الإلكتروني موجود' if exists else 'البريد الإلكتروني متاح'
    }, status=status.HTTP_200_OK) 
