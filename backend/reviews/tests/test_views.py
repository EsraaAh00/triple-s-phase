from django.urls import reverse
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from ...courses.models import Course
from ..models import CourseReview, ReviewReply, Comment, CommentLike

User = get_user_model()


def create_user(**params):
    return User.objects.create_user(**params)


def create_teacher(**params):
    params['is_teacher'] = True
    return create_user(**params)


def create_course(**params):
    return Course.objects.create(**params)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class CourseReviewAPITests(APITestCase):
    def setUp(self):
        self.teacher = create_teacher(
            username='teacher',
            email='teacher@example.com',
            password='testpass123'
        )
        self.user = create_user(
            username='testuser',
            email='user@example.com',
            password='testpass123'
        )
        self.course = create_course(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_create_review(self):
        url = reverse('create-review', kwargs={'course_id': self.course.id})
        data = {
            'rating': 5,
            'review_text': 'Great course!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CourseReview.objects.count(), 1)
        self.assertEqual(CourseReview.objects.get().rating, 5)
    
    def test_get_course_reviews(self):
        # Create a review first
        CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=4,
            review_text='Good course.'
        )
        url = reverse('course-reviews', kwargs={'course_id': self.course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['rating'], 4)
    
    def test_update_review(self):
        review = CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=3,
            review_text='Average course.'
        )
        url = reverse('review-detail', kwargs={'pk': review.id})
        data = {
            'rating': 4,
            'review_text': 'Actually, it\'s better than average.'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.rating, 4)
        self.assertEqual(review.review_text, 'Actually, it\'s better than average.')


class ReviewReplyAPITests(APITestCase):
    def setUp(self):
        self.teacher = create_teacher(
            username='teacher2',
            email='teacher2@example.com',
            password='testpass123'
        )
        self.user = create_user(
            username='testuser2',
            email='user2@example.com',
            password='testpass123'
        )
        self.course = create_course(
            title='Test Course 2',
            description='Test Description 2',
            price=49.99,
            teacher=self.teacher
        )
        self.review = CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=4,
            review_text='Good course.'
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.teacher)["access"]}')
    
    def test_create_reply(self):
        url = reverse('review-replies', kwargs={'review_id': self.review.id})
        data = {
            'reply_text': 'Thank you for your review!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReviewReply.objects.count(), 1)
        self.assertEqual(ReviewReply.objects.get().reply_text, 'Thank you for your review!')
    
    def test_get_replies(self):
        # Create a reply first
        ReviewReply.objects.create(
            review=self.review,
            user=self.teacher,
            reply_text='Thank you!'
        )
        url = reverse('review-replies', kwargs={'review_id': self.review.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['reply_text'], 'Thank you!')


class CommentAPITests(APITestCase):
    def setUp(self):
        self.teacher = create_teacher(
            username='teacher3',
            email='teacher3@example.com',
            password='testpass123'
        )
        self.user = create_user(
            username='testuser3',
            email='user3@example.com',
            password='testpass123'
        )
        self.course = create_course(
            title='Test Course 3',
            description='Test Description 3',
            price=29.99,
            teacher=self.teacher
        )
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user)["access"]}')
    
    def test_create_comment(self):
        url = reverse('course-comments', kwargs={'course_id': self.course.id})
        data = {
            'content': 'This is a test comment.'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
        self.assertEqual(Comment.objects.get().content, 'This is a test comment.')
    
    def test_create_reply_comment(self):
        # Create parent comment first
        parent_comment = Comment.objects.create(
            user=self.teacher,
            course=self.course,
            content='Original comment'
        )
        
        url = reverse('course-comments', kwargs={'course_id': self.course.id})
        data = {
            'content': 'This is a reply',
            'parent_id': parent_comment.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 2)
        self.assertEqual(Comment.objects.get(parent=parent_comment).content, 'This is a reply')
    
    def test_get_comments(self):
        # Create some comments
        Comment.objects.create(
            user=self.teacher,
            course=self.course,
            content='First comment'
        )
        Comment.objects.create(
            user=self.user,
            course=self.course,
            content='Second comment'
        )
        
        url = reverse('course-comments', kwargs={'course_id': self.course.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class CommentLikeAPITests(APITestCase):
    def setUp(self):
        self.teacher = create_teacher(
            username='teacher4',
            email='teacher4@example.com',
            password='testpass123'
        )
        self.user1 = create_user(
            username='user4',
            email='user4@example.com',
            password='testpass123'
        )
        self.user2 = create_user(
            username='user5',
            email='user5@example.com',
            password='testpass123'
        )
        self.course = create_course(
            title='Test Course 4',
            description='Test Description 4',
            price=19.99,
            teacher=self.teacher
        )
        self.comment = Comment.objects.create(
            user=self.teacher,
            course=self.course,
            content='Test comment for liking.'
        )
        self.client = APIClient()
    
    def test_like_comment(self):
        # User1 likes the comment
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user1)["access"]}')
        url = reverse('comment-like', kwargs={'comment_id': self.comment.id})
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CommentLike.objects.count(), 1)
        self.assertEqual(self.comment.like_count, 1)
        
        # User2 likes the comment
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user2)["access"]}')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CommentLike.objects.count(), 2)
        self.assertEqual(CommentLike.objects.get(user=self.user2).comment, self.comment)
        self.assertEqual(self.comment.like_count, 2)
    
    def test_unlike_comment(self):
        # First, user1 likes the comment
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.user1)["access"]}')
        url = reverse('comment-like', kwargs={'comment_id': self.comment.id})
        self.client.post(url, {})
        
        # Now unlike it
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CommentLike.objects.count(), 0)
        self.assertEqual(self.comment.like_count, 0)
    
    def test_cannot_like_own_comment(self):
        # Teacher tries to like their own comment
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {get_tokens_for_user(self.teacher)["access"]}')
        url = reverse('comment-like', kwargs={'comment_id': self.comment.id})
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(CommentLike.objects.count(), 0)
