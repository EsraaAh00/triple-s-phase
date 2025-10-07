from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter

from .models import Review, CourseReview, InstructorReview
from .serializers import (
    ReviewSerializer, CourseReviewSerializer, InstructorReviewSerializer,
    ReviewDetailSerializer, ReviewCreateSerializer
)
from courses.models import Course
from users.models import Instructor

class ReviewBaseView:
    """Base view for review functionality"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']


class CourseReviewListView(ReviewBaseView, generics.ListCreateAPIView):
    """List and create course reviews"""
    serializer_class = CourseReviewSerializer
    filterset_fields = ['rating', 'course', 'user']
    
    def get_queryset(self):
        return CourseReview.objects.select_related('user__profile', 'course')
    
    def perform_create(self, serializer):
        # Check if user is enrolled in the course
        course = serializer.validated_data['course']
        if not course.enrollments.filter(student=self.request.user).exists():
            raise permissions.PermissionDenied(
                "You must be enrolled in the course to leave a review."
            )
        # Check if user already reviewed the course
        if CourseReview.objects.filter(user=self.request.user, course=course).exists():
            raise permissions.PermissionDenied(
                "You have already reviewed this course."
            )
        serializer.save(user=self.request.user)


class CourseReviewDetailView(ReviewBaseView, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a course review"""
    serializer_class = ReviewDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        return CourseReview.objects.select_related('user__profile', 'course')
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsReviewOwner()]
        return [permissions.AllowAny()]


class InstructorReviewListView(ReviewBaseView, generics.ListCreateAPIView):
    """List and create instructor reviews"""
    serializer_class = InstructorReviewSerializer
    filterset_fields = ['rating', 'instructor', 'user']
    
    def get_queryset(self):
        return InstructorReview.objects.select_related('user__profile', 'instructor__user__profile')
    
    def perform_create(self, serializer):
        # Check if user has taken any courses with this instructor
        instructor = serializer.validated_data['instructor']
        if not Course.objects.filter(
            instructor=instructor,
            enrollments__student=self.request.user
        ).exists():
            raise permissions.PermissionDenied(
                "You must have taken a course with this instructor to leave a review."
            )
        # Check if user already reviewed the instructor
        if InstructorReview.objects.filter(user=self.request.user, instructor=instructor).exists():
            raise permissions.PermissionDenied(
                "You have already reviewed this instructor."
            )
        serializer.save(user=self.request.user)


class InstructorReviewDetailView(ReviewBaseView, generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an instructor review"""
    serializer_class = ReviewDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        return InstructorReview.objects.select_related('user__profile', 'instructor__user__profile')
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsReviewOwner()]
        return [permissions.AllowAny()]


class UserReviewsView(ReviewBaseView, generics.ListAPIView):
    """List all reviews by a specific user"""
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Review.objects.filter(user_id=user_id).select_related(
            'user__profile',
            'content_type'
        )


class CourseRatingView(APIView):
    """Get average rating and review count for a course"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, course_id):
        stats = CourseReview.objects.filter(course_id=course_id).aggregate(
            average_rating=Avg('rating'),
            review_count=Count('id'),
            rating_distribution=Count('rating')
        )
        return Response(stats)


class InstructorRatingView(APIView):
    """Get average rating and review count for an instructor"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, instructor_id):
        stats = InstructorReview.objects.filter(instructor_id=instructor_id).aggregate(
            average_rating=Avg('rating'),
            review_count=Count('id'),
            rating_distribution=Count('rating')
        )
        return Response(stats)


class IsReviewOwner(permissions.BasePermission):
    """Custom permission to only allow review owners to edit/delete"""
    def has_object_permission(self, request, view, obj):
        # Allow GET, HEAD or OPTIONS requests
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check if the review belongs to the current user
        return obj.user == request.user
