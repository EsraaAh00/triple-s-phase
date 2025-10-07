from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User, Group
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
import logging

logger = logging.getLogger(__name__)

# from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Profile, Student, Organization, Instructor
from courses.models import Enrollment, Course
from .serializers import (
    ProfileSerializer, StudentSerializer, OrganizationSerializer,
    UserDetailSerializer, ProfileUpdateSerializer, UserListSerializer, UserRegistrationSerializer,
    UserLoginSerializer, PasswordChangeSerializer, CustomTokenObtainPairSerializer,
    UserSerializer
)


class UserListView(generics.ListAPIView):
    """
    قائمة جميع المستخدمين (للإداريين فقط)
    """
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'profile__status']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'profile__name']
    ordering_fields = ['date_joined', 'username', 'profile__name']
    ordering = ['-date_joined']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'profile') and user.profile.is_admin()):
            return self.queryset
        return User.objects.none()
    
    # @extend_schema(
    #     parameters=[
    #         OpenApiParameter('status', str, description='فلترة حسب نوع المستخدم'),
    #         OpenApiParameter('search', str, description='البحث في البيانات'),
    #     ],
    #     responses={200: UserListSerializer(many=True)},
    #     description='قائمة جميع المستخدمين'
    # )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    تفاصيل مستخدم محدد
    """
    queryset = User.objects.select_related('profile').all()
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user_id = self.kwargs.get('pk')
        if user_id:
            return generics.get_object_or_404(User, pk=user_id)
        return self.request.user
    
    def check_permissions(self, request):
        super().check_permissions(request)
        user_id = self.kwargs.get('pk')
        if user_id and str(request.user.id) != str(user_id):
            # Check if user is admin or accessing their own profile
            if not (request.user.is_superuser or 
                   (hasattr(request.user, 'profile') and request.user.profile.is_admin())):
                self.permission_denied(request, 'ليس لديك صلاحية لعرض هذا الملف الشخصي')


class ProfileUpdateView(generics.UpdateAPIView):
    """
    تحديث الملف الشخصي للمستخدم
    """
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    # @extend_schema(
    #     request=ProfileUpdateSerializer,
    #     responses={200: ProfileSerializer},
    #     description='تحديث الملف الشخصي للمستخدم'
    # )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)
    
    # @extend_schema(
    #     request=ProfileUpdateSerializer,
    #     responses={200: ProfileSerializer},
    #     description='تحديث جزئي للملف الشخصي'
    # )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class StudentListView(generics.ListAPIView):
    """
    قائمة جميع الطلاب
    """
    queryset = Student.objects.select_related('profile').all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department']
    search_fields = ['profile__name', 'department']
    ordering_fields = ['profile__name', 'department']
    ordering = ['profile__name']


class OrganizationListView(generics.ListAPIView):
    """
    قائمة جميع المنظمات
    """
    queryset = Organization.objects.select_related('profile').all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['profile__name', 'location', 'description']
    ordering_fields = ['profile__name', 'founded_year', 'employees']
    ordering = ['profile__name']


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """
    إحصائيات المستخدمين (للإداريين فقط)
    """
    user = request.user
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.is_admin())):
        return Response({'error': 'ليس لديك صلاحية لعرض الإحصائيات'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'students': Profile.objects.filter(status='Student').count(),
        'admins': Profile.objects.filter(status='Admin').count(),
        'organizations': Profile.objects.filter(status='Organization').count(),
    }
    
    return Response(stats)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    # إحصائيات لوحة التحكم
    user = request.user
    
    if not (user.is_superuser or (hasattr(user, 'profile') and user.profile.is_admin())):
        return Response(
            {"detail": "You don't have permission to view these statistics."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Basic statistics
    stats = {
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'total_students': Student.objects.count(),
        'total_instructors': User.objects.filter(groups__name='Instructor').count(),
        'total_organizations': Organization.objects.count(),
        'new_users_this_month': User.objects.filter(
            date_joined__month=timezone.now().month,
            date_joined__year=timezone.now().year
        ).count(),
    }
    
    return Response(stats)


class UserActivationView(APIView):
    """تفعيل/تعطيل حساب مستخدم"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            if user == request.user:
                return Response(
                    {"detail": "You cannot deactivate your own account."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.is_active = not user.is_active
            user.save()
            action = 'activated' if user.is_active else 'deactivated'
            return Response({"detail": f"User successfully {action}."})
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class UserRoleView(APIView):
    """إدارة أدوار المستخدمين"""
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, user_id):
        role = request.data.get('role')
        action = request.data.get('action')  # 'add' or 'remove'
        
        if not role or action not in ['add', 'remove']:
            return Response(
                {"detail": "Role and action (add/remove) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = User.objects.get(id=user_id)
            group, created = Group.objects.get_or_create(name=role)
            
            if action == 'add':
                user.groups.add(group)
                message = f"Role '{role}' added successfully."
            else:
                user.groups.remove(group)
                message = f"Role '{role}' removed successfully."
                
            return Response({"detail": message})
            
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class ProfilePictureUploadView(APIView):
    """رفع صورة الملف الشخصي"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def put(self, request):
        profile = request.user.profile
        image = request.FILES.get('image')
        
        if not image:
            return Response(
                {"detail": "No image provided."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate image type and size
        if not image.content_type.startswith('image/'):
            return Response(
                {"detail": "File is not an image."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        if image.size > 5 * 1024 * 1024:  # 5MB limit
            return Response(
                {"detail": "Image size should not exceed 5MB."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Save the image
        profile.image_profile = image
        profile.save()
        
        return Response({
            "detail": "Profile picture updated successfully.",
            "image_url": profile.image_profile.url if profile.image_profile else None
        })


class UserSearchView(generics.ListAPIView):
    """بحث متقدم عن المستخدمين"""
    serializer_class = UserListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = User.objects.select_related('profile').all()
        
        # Filter by search query
        search_query = self.request.query_params.get('q', None)
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(profile__name__icontains=search_query)
            )
        
        # Filter by role
        role = self.request.query_params.get('role', None)
        if role:
            queryset = queryset.filter(groups__name=role)
            
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status == 'active':
            queryset = queryset.filter(is_active=True)
        elif status == 'inactive':
            queryset = queryset.filter(is_active=False)
            
        return queryset.distinct()


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """تسجيل مستخدم جديد"""
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()
                
                # Generate access token only
                access_token = AccessToken.for_user(user)
                
                # Get user details
                try:
                    profile = user.profile
                    user_details = None
                    
                    if profile.status == 'Student':
                        try:
                            student = Student.objects.get(profile=profile)
                            user_details = StudentSerializer(student).data
                        except Student.DoesNotExist:
                            pass
                except Profile.DoesNotExist:
                    profile = None
                
                return Response({
                    'success': True,
                    'message': 'تم إنشاء الحساب بنجاح',
                    'user': UserSerializer(user).data,
                    'profile': ProfileSerializer(profile).data if profile else None,
                    'user_details': user_details,
                    'token': str(access_token),
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error in user registration: {str(e)}")
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
    """تسجيل الدخول"""
    serializer = UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate access token only (no refresh token)
        access_token = AccessToken.for_user(user)
        
        # Get user details
        try:
            profile = user.profile
            user_details = None
            
            if profile.status == 'Student':
                try:
                    student = Student.objects.get(profile=profile)
                    user_details = StudentSerializer(student).data
                except Student.DoesNotExist:
                    pass
        except Profile.DoesNotExist:
            profile = None
        
        return Response({
            'success': True,
            'message': 'تم تسجيل الدخول بنجاح',
            'user': UserSerializer(user).data,
            'profile': ProfileSerializer(profile).data if profile else None,
            'user_details': user_details,
            'token': str(access_token),
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'error': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """تسجيل الخروج"""
    try:
        return Response({
            'success': True,
            'message': 'تم تسجيل الخروج بنجاح'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'success': True,
            'message': 'تم تسجيل الخروج بنجاح'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """عرض الملف الشخصي للمستخدم الحالي"""
    try:
        profile = request.user.profile
        user_details = None
        
        if profile.status == 'Student':
            try:
                student = Student.objects.get(profile=profile)
                user_details = StudentSerializer(student).data
            except Student.DoesNotExist:
                pass
        
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': ProfileSerializer(profile).data,
            'user_details': user_details
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
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            
            # Get updated user details
            user_details = None
            if profile.status == 'Student':
                try:
                    student = Student.objects.get(profile=profile)
                    user_details = StudentSerializer(student).data
                except Student.DoesNotExist:
                    pass
            
            return Response({
                'message': 'تم تحديث الملف الشخصي بنجاح',
                'profile': ProfileSerializer(profile).data,
                'user_details': user_details
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'بيانات غير صحيحة',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """تغيير كلمة المرور"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'message': 'تم تغيير كلمة المرور بنجاح'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'بيانات غير صحيحة',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


class ProfileDetailView(generics.RetrieveAPIView):
    """عرض تفاصيل ملف شخصي لمستخدم معين"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email_exists(request):
    """التحقق من وجود بريد إلكتروني"""
    email = request.GET.get('email')
    if not email:
        return Response({
            'error': 'البريد الإلكتروني مطلوب'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    return Response({
        'exists': exists,
        'message': 'البريد الإلكتروني موجود' if exists else 'البريد الإلكتروني متاح'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def instructors_list(request):
    """
    قائمة المدربين
    """
    try:
        instructors = Instructor.objects.select_related('profile').all()
        
        # Apply filters if provided
        department = request.query_params.get('department')
        if department:
            instructors = instructors.filter(department__icontains=department)
            
        # Order by name
        instructors = instructors.order_by('profile__name')
        
        # Serialize the data
        data = [
            {
                'id': instructor.id,
                'name': instructor.profile.name,
                'email': instructor.profile.email,
                'department': instructor.department,
                'bio': instructor.bio,
                'profile_pic': instructor.profile.image_profile.url if instructor.profile.image_profile else None
            }
            for instructor in instructors
        ]
        
        return Response(data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def students_list(request):
    """
    قائمة الطلاب - للمعلمين والمديرين فقط
    """
    try:
        profile = request.user.profile
        if profile.status not in ['Teacher', 'Admin'] and not request.user.is_staff:
            return Response({
                'error': 'ليس لديك صلاحية للوصول لهذه البيانات'
            }, status=status.HTTP_403_FORBIDDEN)
    except Profile.DoesNotExist:
        return Response({
            'error': 'لم يتم العثور على ملف تعريف المستخدم'
        }, status=status.HTTP_404_NOT_FOUND)
    
    students = Student.objects.select_related('profile').all()
    
    # Filter by department
    department = request.GET.get('department')
    if department:
        students = students.filter(department__icontains=department)
    
    # Search by name
    search = request.GET.get('search')
    if search:
        students = students.filter(profile__name__icontains=search)
    
    serializer = StudentSerializer(students, many=True)
    return Response({
        'students': serializer.data
    }, status=status.HTTP_200_OK)


 


@api_view(['POST'])
@permission_classes([AllowAny])
def debug_login(request):
    """Debug login for testing"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    print(f"🔍 Debug Login - Email: {email}")
    print(f"🔍 Debug Login - Password: {password}")
    
    # Check if user exists
    try:
        user = User.objects.get(email=email)
        print(f"✅ User found: {user.username}, active: {user.is_active}")
        print(f"🔍 User password hash: {user.password}")
        
        # Test password check
        is_password_correct = user.check_password(password)
        print(f"🔍 Password check result: {is_password_correct}")
        
        if is_password_correct:
            return Response({
                'success': True,
                'message': 'كلمة المرور صحيحة!',
                'user_id': user.id,
                'username': user.username
            })
        else:
            return Response({
                'success': False,
                'message': 'كلمة المرور غير صحيحة',
                'user_exists': True,
                'user_active': user.is_active
            })
            
    except User.DoesNotExist:
        print(f"❌ User not found with email: {email}")
        return Response({
            'success': False,
            'message': 'المستخدم غير موجود',
            'user_exists': False
        })
    except Exception as e:
        print(f"💥 Error: {str(e)}")
        return Response({
            'success': False,
            'message': f'خطأ: {str(e)}'
        }) 


@api_view(['POST'])
@permission_classes([AllowAny])
def create_test_user(request):
    """Create a test user for quick testing"""
    email = request.data.get('email', 'test@example.com')
    password = request.data.get('password', 'test123456')
    first_name = request.data.get('first_name', 'Test')
    last_name = request.data.get('last_name', 'User')
    
    try:
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'message': f'المستخدم موجود بالفعل: {email}'
            })
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create profile
        profile = Profile.objects.create(
            user=user,
            name=f"{first_name} {last_name}",
            email=email,
            status='Student'
        )
        
        # Create student
        Student.objects.create(profile=profile)
        
        print(f"✅ Test user created: {email} / {password}")
        
        return Response({
            'success': True,
            'message': 'تم إنشاء المستخدم الاختباري بنجاح',
            'email': email,
            'password': password,
            'note': 'يمكنك الآن تسجيل الدخول بهذه البيانات'
        })
        
    except Exception as e:
        print(f"💥 Error creating test user: {str(e)}")
        return Response({
            'success': False,
            'message': f'خطأ في إنشاء المستخدم: {str(e)}'
        }) 
