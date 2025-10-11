from rest_framework import viewsets, status, filters, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, IsAdminUser
from django.utils import timezone
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.decorators import user_passes_test
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse

from courses.models import Course

from .models import Banner, CourseCollection, PrivacyPolicy, TermsAndConditions, RefundingFAQ, ContactInfo, Partnership, ContactMessage
from .serializers import (
    BannerSerializer,
    BannerByTypeSerializer,
    CourseCollectionListSerializer,
    CourseCollectionDetailSerializer,
    PrivacyPolicySerializer,
    TermsAndConditionsSerializer,
    RefundingFAQSerializer,
    ContactInfoSerializer,
    PartnershipSerializer,
    ContactMessageSerializer,
    ContactMessageCreateSerializer
)


class BannerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing banners.
    """
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['banner_type', 'is_active']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order', '-created_at']

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'active', 'promotional']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Optionally filter by active banners only.
        """
        queryset = super().get_queryset()
        
        # Filter active banners if requested
        if self.request.query_params.get('active_only', '').lower() in ('true', '1'):
            now = timezone.now()
            queryset = queryset.filter(
                is_active=True,
                start_date__lte=now,
            ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
            
        return queryset
        
    @action(detail=False, methods=['get'])
    def active(self, request, *args, **kwargs):
        """
        Get all active banners that should be displayed now.
        Returns paginated results if page size is specified, otherwise returns all results.
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            is_active=True,
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        # Order by display_order and then by creation date
        queryset = queryset.order_by('display_order', '-created_at')
        
        # Check if pagination is requested
        page_size = self.request.query_params.get('page_size')
        if page_size and page_size.isdigit():
            self.pagination_class.page_size = int(page_size)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def promotional(self, request, *args, **kwargs):
        """
        Get all active promotional banners for displaying between course collections.
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            is_active=True,
            banner_type='promo',
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        # Order by display_order and then by creation date
        queryset = queryset.order_by('display_order', '-created_at')
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request, *args, **kwargs):
        """
        Get banners by specific type (header, main, about_us, why_choose_us, etc.)
        """
        banner_type = request.query_params.get('type')
        if not banner_type:
            return Response(
                {'error': 'يجب تحديد نوع البانر'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate banner type
        valid_types = [choice[0] for choice in Banner.BANNER_TYPES]
        if banner_type not in valid_types:
            return Response(
                {'error': f'نوع البانر غير صالح. الأنواع المتاحة: {", ".join(valid_types)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        now = timezone.now()
        queryset = self.get_queryset().filter(
            banner_type=banner_type,
            is_active=True,
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        # Order by display_order and then by creation date
        queryset = queryset.order_by('display_order', '-created_at')
        
        # Use simplified serializer for public API
        serializer = BannerByTypeSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def header(self, request, *args, **kwargs):
        """
        Get header banners specifically
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            banner_type='header',
            is_active=True,
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        queryset = queryset.order_by('display_order', '-created_at')
        serializer = BannerByTypeSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def about_us(self, request, *args, **kwargs):
        """
        Get about us banners specifically
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            banner_type='about_us',
            is_active=True,
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        queryset = queryset.order_by('display_order', '-created_at')
        serializer = BannerByTypeSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def why_choose_us(self, request, *args, **kwargs):
        """
        Get why choose us banners specifically
        """
        now = timezone.now()
        queryset = self.get_queryset().filter(
            banner_type='why_choose_us',
            is_active=True,
            start_date__lte=now,
        ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
        
        queryset = queryset.order_by('display_order', '-created_at')
        serializer = BannerByTypeSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class CourseCollectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course collections.
    """
    queryset = CourseCollection.objects.all()
    serializer_class = CourseCollectionListSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['display_order', 'name', 'created_at']
    ordering = ['display_order', 'name']
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'with_courses']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'])
    def with_courses(self, request, *args, **kwargs):
        """
        Get all collections with their courses for the homepage.
        """
        collections = CourseCollection.objects.filter(
            courses__status='published',
            courses__is_active=True
        ).distinct().prefetch_related(
            'courses__category',
            'courses__instructors',
            'courses__instructors__profile',
            'courses__tags'
        ).order_by('display_order', 'name')
        
        serializer = CourseCollectionDetailSerializer(collections, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_course_featured_status(request, course_id, action):
    """
    Toggle featured status for a single course
    """
    try:
        course = Course.objects.get(id=course_id)
        if action == 'feature':
            course.is_featured = True
            message = 'تم تمييز الدورة بنجاح'
        elif action == 'unfeature':
            course.is_featured = False
            message = 'تم إلغاء تمييز الدورة بنجاح'
        else:
            return Response(
                {'error': 'إجراء غير صالح'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        course.save()
        return Response({'success': True, 'message': message})
    except Course.DoesNotExist:
        return Response(
            {'error': 'لم يتم العثور على الدورة'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_course_status(request, action):
    """
    Bulk update featured status for multiple courses
    """
    course_ids = request.data.get('course_ids', [])
    if not isinstance(course_ids, list):
        return Response(
            {'error': 'يجب إرسال مصفوفة من معرفات الدورات'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if action == 'feature':
        updated = Course.objects.filter(id__in=course_ids).update(is_featured=True)
        message = f'تم تمييز {updated} دورة بنجاح'
    elif action == 'unfeature':
        updated = Course.objects.filter(id__in=course_ids).update(is_featured=False)
        message = f'تم إلغاء تمييز {updated} دورة بنجاح'
    else:
        return Response(
            {'error': 'إجراء غير صالح'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'success': True, 'message': message, 'updated_count': updated})


def get_admin_dashboard_data():
    """
    Get data for the admin dashboard
    """
    from users.models import User
    from courses.models import Course, Enrollment
    # from certificates.models import Certificate  # Module deleted
    
    now = timezone.now()
    
    # Get active banners
    active_banners = Banner.objects.filter(
        is_active=True,
        start_date__lte=now,
    ).filter(Q(end_date__isnull=True) | Q(end_date__gte=now))
    
    # Get recent courses with student count
    recent_courses = Course.objects.annotate(
        student_count=Count('students')
    ).order_by('-created_at')[:10]
    
    # Get recent users
    recent_users = User.objects.filter(is_staff=False).order_by('-date_joined')[:5]
    
    # Get recent enrollments
    recent_enrollments = Enrollment.objects.select_related(
        'student', 'course'
    ).order_by('-enrollment_date')[:5]
    
    # Get recent certificates
    recent_certificates = Certificate.objects.select_related(
        'user', 'course'
    ).order_by('-date_issued')[:5]
    
    # Get statistics
    stats = {
        'total_users': User.objects.count(),
        'total_courses': Course.objects.count(),
        'total_enrollments': Enrollment.objects.count(),
        'total_certificates': Certificate.objects.count(),
    }
    
    # Try to get student and teacher counts if the fields exist
    try:
        stats['total_students'] = User.objects.filter(groups__name='Students').count()
    except Exception:
        stats['total_students'] = 0
        
    try:
        stats['total_teachers'] = User.objects.filter(groups__name='Teachers').count()
    except Exception:
        stats['total_teachers'] = 0
    
    return {
        'active_banners': active_banners,
        'recent_courses': recent_courses,
        'recent_users': recent_users,
        'recent_enrollments': recent_enrollments,
        'recent_certificates': recent_certificates,
        'stats': stats,
    }

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['list', 'retrieve', 'featured']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Return appropriate serializer class based on action.
        """
        if self.action == 'retrieve':
            return CourseCollectionDetailSerializer
        return super().get_serializer_class()
    
    def get_queryset(self):
        """
        Optionally filter by featured collections only.
        """
        queryset = super().get_queryset()
        
        # Filter featured collections if requested
        if self.request.query_params.get('featured_only', '').lower() in ('true', '1'):
            queryset = queryset.filter(is_featured=True)
            
        # Filter by course if course_id is provided
        course_id = self.request.query_params.get('course_id')
        if course_id:
            queryset = queryset.filter(courses__id=course_id)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request, *args, **kwargs):
        """
        Get all featured course collections.
        """
        queryset = self.filter_queryset(self.get_queryset()).filter(is_featured=True)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PrivacyPolicyViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Privacy Policy.
    Read-only for public, admin can manage via admin panel.
    """
    queryset = PrivacyPolicy.objects.filter(is_active=True)
    serializer_class = PrivacyPolicySerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest active privacy policy"""
        latest_policy = self.get_queryset().first()
        if latest_policy:
            serializer = self.get_serializer(latest_policy)
            return Response(serializer.data)
        return Response({'detail': 'No privacy policy available'}, status=status.HTTP_404_NOT_FOUND)


class TermsAndConditionsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Terms and Conditions.
    Read-only for public, admin can manage via admin panel.
    """
    queryset = TermsAndConditions.objects.filter(is_active=True)
    serializer_class = TermsAndConditionsSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest active terms and conditions"""
        latest_terms = self.get_queryset().first()
        if latest_terms:
            serializer = self.get_serializer(latest_terms)
            return Response(serializer.data)
        return Response({'detail': 'No terms and conditions available'}, status=status.HTTP_404_NOT_FOUND)


class RefundingFAQViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Refunding FAQ.
    Read-only for public, admin can manage via admin panel.
    """
    queryset = RefundingFAQ.objects.filter(is_active=True).order_by('display_order', '-created_at')
    serializer_class = RefundingFAQSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order', '-created_at']
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get all active FAQs (for Refund Policy page)"""
        faqs = self.get_queryset()
        if faqs.exists():
            serializer = self.get_serializer(faqs, many=True)
            return Response(serializer.data)
        return Response({'detail': 'No refund policy FAQs available'}, status=status.HTTP_404_NOT_FOUND)


class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Contact Info.
    Read-only for public, admin can manage via admin panel.
    """
    queryset = ContactInfo.objects.filter(is_active=True)
    serializer_class = ContactInfoSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get the latest active contact info"""
        latest_info = self.get_queryset().first()
        if latest_info:
            serializer = self.get_serializer(latest_info)
            return Response(serializer.data)
        return Response({'detail': 'No contact information available'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active contact info (alias for latest)"""
        return self.latest(request)


class PartnershipViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Partnerships.
    Read-only for public, admin can manage via admin panel.
    """
    queryset = Partnership.objects.filter(is_active=True).order_by('display_order', 'name')
    serializer_class = PartnershipSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'name', 'created_at']
    ordering = ['display_order', 'name']


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Contact Messages.
    Public can create messages, admin can manage all.
    """
    queryset = ContactMessage.objects.all()
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['status', 'is_urgent']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ContactMessageCreateSerializer
        return ContactMessageSerializer
    
    def get_permissions(self):
        """Set permissions based on action"""
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        """Create a new contact message"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'success': True, 'message': 'تم إرسال الرسالة بنجاح'},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get contact message statistics for admin"""
        stats = {
            'total_messages': ContactMessage.objects.count(),
            'new_messages': ContactMessage.objects.filter(status='new').count(),
            'read_messages': ContactMessage.objects.filter(status='read').count(),
            'replied_messages': ContactMessage.objects.filter(status='replied').count(),
            'urgent_messages': ContactMessage.objects.filter(is_urgent=True).count(),
        }
        return Response(stats)
