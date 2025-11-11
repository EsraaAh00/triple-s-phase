from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import (
    QuestionBankProduct, QuestionBankProductEnrollment,
    FlashcardProduct, FlashcardProductEnrollment
)
from .serializers import (
    QuestionBankProductSerializer, QuestionBankProductEnrollmentSerializer,
    FlashcardProductSerializer, FlashcardProductEnrollmentSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for assessment views"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000  # زيادة الحد الأقصى للسماح بأعداد أكبر
    
    def get_page_size(self, request):
        """Get page size from request, using requested size as both default and max"""
        if self.page_size_query_param:
            page_size = request.query_params.get(self.page_size_query_param)
            if page_size is not None:
                try:
                    page_size = int(page_size)
                    if page_size > 0:
                        # استخدام العدد المحدد من الطلب مباشرة
                        # تحديث الحد الأقصى ليكون نفس العدد المطلوب
                        self.max_page_size = max(page_size, self.max_page_size)
                        print(f"=== PAGINATION DEBUG ===")
                        print(f"Requested page_size: {page_size}")
                        print(f"Updated max_page_size: {self.max_page_size}")
                        print(f"Final page_size: {page_size}")
                        return page_size
                except (KeyError, ValueError):
                    pass
        return self.page_size


class QuestionBankProductViewSet(viewsets.ModelViewSet):
    """ViewSet for QuestionBankProduct model"""
    
    queryset = QuestionBankProduct.objects.all()
    serializer_class = QuestionBankProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_free', 'course', 'created_by']
    search_fields = ['title', 'description', 'course__title']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Optionally filter products by student's active enrollments"""
        queryset = super().get_queryset()
        user = self.request.user
        enrolled_only = self.request.query_params.get('enrolled_only')
        if enrolled_only and str(enrolled_only).lower() in ('1', 'true', 'yes'):
            queryset = queryset.filter(
                enrollments__student=user,
                enrollments__status='active'
            )
        return queryset.select_related('course', 'created_by').prefetch_related('chapters').distinct()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get products for a specific course"""
        course_id = request.query_params.get('course_id')
        if course_id:
            products = self.get_queryset().filter(course_id=course_id)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """Enroll a student in this product"""
        product = self.get_object()
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already enrolled
        enrollment, created = QuestionBankProductEnrollment.objects.get_or_create(
            student_id=student_id,
            product=product,
            defaults={'is_active': True}
        )
        
        if not created:
            return Response({'error': 'Student is already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = QuestionBankProductEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class QuestionBankProductEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for QuestionBankProductEnrollment model"""
    
    queryset = QuestionBankProductEnrollment.objects.all()
    serializer_class = QuestionBankProductEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'product', 'student']
    search_fields = ['student__username', 'student__email', 'product__title']
    ordering_fields = ['enrollment_date']
    ordering = ['-enrollment_date']
    
    @action(detail=False, methods=['get'])
    def check_enrollment(self, request):
        """Check if current user is enrolled in any question bank products (only active enrollments)"""
        user = request.user
        enrollments = self.get_queryset().filter(
            student=user,
            status='active'
        )
        
        if enrollments.exists():
            return Response({
                'is_enrolled': True,
                'enrollments': self.get_serializer(enrollments, many=True).data
            })
        else:
            return Response({
                'is_enrolled': False,
                'enrollments': []
            })


class FlashcardProductViewSet(viewsets.ModelViewSet):
    """ViewSet for FlashcardProduct model"""
    
    queryset = FlashcardProduct.objects.all()
    serializer_class = FlashcardProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'is_free', 'course', 'created_by']
    search_fields = ['title', 'description', 'course__title']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Optionally filter products by student's active enrollments"""
        queryset = super().get_queryset()
        user = self.request.user
        enrolled_only = self.request.query_params.get('enrolled_only')
        if enrolled_only and str(enrolled_only).lower() in ('1', 'true', 'yes'):
            queryset = queryset.filter(
                enrollments__student=user,
                enrollments__status='active'
            )
        return queryset.select_related('course', 'created_by').prefetch_related('chapters').distinct()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_course(self, request):
        """Get products for a specific course"""
        course_id = request.query_params.get('course_id')
        if course_id:
            products = self.get_queryset().filter(course_id=course_id)
            serializer = self.get_serializer(products, many=True)
            return Response(serializer.data)
        return Response([])
    
    @action(detail=True, methods=['post'])
    def enroll_student(self, request, pk=None):
        """Enroll a student in this product"""
        product = self.get_object()
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'Student ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already enrolled
        enrollment, created = FlashcardProductEnrollment.objects.get_or_create(
            student_id=student_id,
            product=product,
            defaults={'is_active': True}
        )
        
        if not created:
            return Response({'error': 'Student is already enrolled'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = FlashcardProductEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FlashcardProductEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for FlashcardProductEnrollment model"""
    
    queryset = FlashcardProductEnrollment.objects.all()
    serializer_class = FlashcardProductEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'product', 'student']
    search_fields = ['student__username', 'student__email', 'product__title']
    ordering_fields = ['enrollment_date']
    ordering = ['-enrollment_date']
    
    @action(detail=False, methods=['get'])
    def check_enrollment(self, request):
        """Check if current user is enrolled in any flashcard products (only active enrollments)"""
        user = request.user
        enrollments = self.get_queryset().filter(
            student=user,
            status='active'
        )
        
        if enrollments.exists():
            return Response({
                'is_enrolled': True,
                'enrollments': self.get_serializer(enrollments, many=True).data
            })
        else:
            return Response({
                'is_enrolled': False,
                'enrollments': []
            })
