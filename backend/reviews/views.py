from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAuthenticatedOrReadOnly
from rest_framework.parsers import JSONParser
from rest_framework.serializers import ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Q
from django.utils import timezone

from courses.models import Course
from users.models import User
from .models import CourseReview, ReviewReply, Comment, CommentLike, ReviewLike
from .serializers import (
    ReviewCreateSerializer, ReviewSerializer, ReviewReplySerializer,
    CommentSerializer, CommentCreateSerializer, CommentLikeSerializer, ReviewLikeSerializer
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser])
def create_review(request, course_id):
    """إنشاء تقييم للدورة"""
    course = get_object_or_404(Course, id=course_id)
    
    # Debug logging
    print(f"Creating review for course {course_id}")
    print(f"Request data: {request.data}")
    print(f"User: {request.user}")
    
    # Check if user is enrolled
    if not course.enrollments.filter(student=request.user, status__in=['active', 'completed']).exists():
        print(f"User {request.user} is not enrolled in course {course_id}")
        return Response({
            'error': 'يجب أن تكون مسجلاً في الدورة لتتمكن من تقييمها'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if user already reviewed
    if CourseReview.objects.filter(course=course, user=request.user).exists():
        print(f"User {request.user} already reviewed course {course_id}")
        return Response({
            'error': 'لقد قمت بتقييم هذه الدورة بالفعل'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    data = request.data.copy()
    data['course'] = course.id
    
    print(f"=== VIEW DATA PROCESSING DEBUG ===")
    print(f"Original request.data: {request.data}")
    print(f"Request data type: {type(request.data)}")
    print(f"Request data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'No keys'}")
    print(f"Processed data: {data}")
    print(f"review_text in processed data: {'review_text' in data}")
    if 'review_text' in data:
        print(f"review_text value: '{data['review_text']}'")
    print(f"===================================")
    
    serializer = ReviewCreateSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        print(f"Serializer is valid. Saving review...")
        review = serializer.save()
        print(f"Review saved successfully. ID: {review.id}, Text: '{review.review_text}'")
        return Response({
            'message': 'تم إضافة تقييمك بنجاح',
            'review': ReviewSerializer(review).data
        }, status=status.HTTP_201_CREATED)
    
    print(f"Serializer errors: {serializer.errors}")
    return Response({
        'error': 'بيانات غير صحيحة',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def course_reviews(request, course_id):
    """جلب تقييمات الدورة"""
    course = get_object_or_404(Course, id=course_id)
    reviews = course.reviews.all().order_by('-created_at')
    
    # Pagination
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(reviews, request)
    
    serializer = ReviewSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


# Review Management
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a review"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return CourseReview.objects.all()
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own reviews.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own reviews.")
        instance.delete()


# Review Replies
class ReviewReplyListCreateView(generics.ListCreateAPIView):
    """View to list and create replies to a review"""
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        review_id = self.kwargs['review_id']
        return ReviewReply.objects.filter(
            review_id=review_id,
            is_approved=True
        ).order_by('created_at')
    
    def perform_create(self, serializer):
        review = get_object_or_404(CourseReview, id=self.kwargs['review_id'])
        serializer.save(
            review=review,
            user=self.request.user
        )


class ReviewReplyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a reply"""
    serializer_class = ReviewReplySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ReviewReply.objects.filter(
            review_id=self.kwargs['review_id'],
            is_approved=True
        )
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own replies.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own replies.")
        instance.delete()


# Comments
class CommentListCreateView(generics.ListCreateAPIView):
    """View to list and create comments on a course"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        course_id = self.kwargs['course_id']
        return Comment.objects.filter(
            course_id=course_id,
            parent__isnull=True,  # Only top-level comments
            is_active=True
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        course = get_object_or_404(Course, id=self.kwargs['course_id'])
        parent_id = self.request.data.get('parent_id')
        parent = None
        
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id)
            if parent.course_id != course.id:
                raise ValidationError("Parent comment must be from the same course.")
        
        serializer.save(
            course=course,
            user=self.request.user,
            parent=parent
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update or delete a comment"""
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Comment.objects.filter(
            course_id=self.kwargs['course_id'],
            is_active=True
        )
    
    def perform_update(self, serializer):
        if serializer.instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own comments.")
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own comments.")
        instance.is_active = False
        instance.save()


# Comment Likes
class CommentLikeView(generics.CreateAPIView, generics.DestroyAPIView):
    """View to like or unlike a comment"""
    serializer_class = CommentLikeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CommentLike.objects.filter(
            comment_id=self.kwargs['comment_id'],
            user=self.request.user
        )
    
    def perform_create(self, serializer):
        comment = get_object_or_404(
            Comment,
            id=self.kwargs['comment_id'],
            is_active=True
        )
        
        if comment.user == self.request.user:
            raise ValidationError("You cannot like your own comment.")
        
        if self.get_queryset().exists():
            raise ValidationError("You have already liked this comment.")
        
        serializer.save(
            comment=comment,
            user=self.request.user
        )
    
    def delete(self, request, *args, **kwargs):
        like = self.get_queryset().first()
        if like:
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(
            {"detail": "Like not found"},
            status=status.HTTP_404_NOT_FOUND
        )


# Review Likes
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_review(request, review_id):
    """Like or unlike a review"""
    try:
        review = get_object_or_404(CourseReview, id=review_id, is_approved=True)
        
        # Check if user is trying to like their own review
        if review.user == request.user:
            return Response(
                {"detail": "You cannot like your own review."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has already liked this review
        if review.likes.filter(id=request.user.id).exists():
            # Unlike the review
            review.likes.remove(request.user)
            return Response(
                {"detail": "Review unliked successfully", "liked": False},
                status=status.HTTP_200_OK
            )
        else:
            # Like the review
            review.likes.add(request.user)
            return Response(
                {"detail": "Review liked successfully", "liked": True},
                status=status.HTTP_201_CREATED
            )
            
    except CourseReview.DoesNotExist:
        return Response(
            {"detail": "Review not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error processing like: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def course_rating_stats(request, course_id):
    """Get course rating statistics"""
    try:
        course = get_object_or_404(Course, id=course_id)
        
        # Get all approved reviews for this course
        reviews = CourseReview.objects.filter(course=course, is_approved=True)
        
        # Calculate statistics
        total_reviews = reviews.count()
        average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            count = reviews.filter(rating=i).count()
            percentage = (count / total_reviews * 100) if total_reviews > 0 else 0
            rating_distribution[i] = {
                'count': count,
                'percentage': round(percentage, 1)
            }
        
        return Response({
            'course_id': course_id,
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 1),
            'rating_distribution': rating_distribution
        })
        
    except Course.DoesNotExist:
        return Response(
            {"detail": "Course not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"detail": f"Error getting rating stats: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Moderation
class ReviewModerationView(generics.UpdateAPIView):
    """Moderate a review (approve/reject)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return CourseReview.objects.all()
    
    def patch(self, request, *args, **kwargs):
        review = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            review.is_approved = True
            review.save()
            return Response({"status": "Review approved"})
        elif action == 'reject':
            review.is_approved = False
            review.save()
            return Response({"status": "Review rejected"})
        
        return Response(
            {"error": "Invalid action. Use 'approve' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )


class ReplyModerationView(generics.UpdateAPIView):
    """Moderate a reply (approve/reject)"""
    permission_classes = [IsAdminUser]
    serializer_class = ReviewReplySerializer
    
    def get_queryset(self):
        return ReviewReply.objects.all()
    
    def patch(self, request, *args, **kwargs):
        reply = self.get_object()
        action = request.data.get('action')
        
        if action == 'approve':
            reply.is_approved = True
            reply.save()
            return Response({"status": "Reply approved"})
        elif action == 'reject':
            reply.is_approved = False
            reply.save()
            return Response({"status": "Reply rejected"})
        
        return Response(
            {"error": "Invalid action. Use 'approve' or 'reject'"},
            status=status.HTTP_400_BAD_REQUEST
        )
