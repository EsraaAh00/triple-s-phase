from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from datetime import timedelta

from ...courses.models import Course
from ..models import CourseReview, ReviewReply, Comment, CommentLike

User = get_user_model()


class CourseReviewModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='reviewuser',
            email='review@example.com',
            password='testpass123'
        )
        self.teacher = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
    
    def test_create_review(self):
        review = CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=5,
            review_text='Great course!'
        )
        self.assertEqual(str(review), f"{self.user.username}'s review for {self.course.title}")
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.review_text, 'Great course!')
    
    def test_update_course_rating_on_save(self):
        # Initial rating should be None
        self.assertIsNone(self.course.rating)
        
        # Create a review
        review = CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=5,
            review_text='Great course!'
        )
        
        # Refresh course from database
        self.course.refresh_from_db()
        self.assertEqual(self.course.rating, 5.0)
        
        # Add another review
        another_user = User.objects.create_user(
            username='anotheruser',
            email='another@example.com',
            password='testpass123'
        )
        CourseReview.objects.create(
            course=self.course,
            user=another_user,
            rating=3,
            review_text='Good course.'
        )
        
        # Check average rating
        self.course.refresh_from_db()
        self.assertEqual(self.course.rating, 4.0)


class ReviewReplyModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='replyuser',
            email='reply@example.com',
            password='testpass123'
        )
        self.teacher = User.objects.create_user(
            username='teacher2',
            email='teacher2@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
        self.review = CourseReview.objects.create(
            course=self.course,
            user=self.user,
            rating=4,
            review_text='Good course.'
        )
    
    def test_create_reply(self):
        reply = ReviewReply.objects.create(
            review=self.review,
            user=self.teacher,
            reply_text='Thank you for your feedback!'
        )
        self.assertEqual(str(reply), f"Reply by {self.teacher.username} on {self.review}")
        self.assertEqual(reply.reply_text, 'Thank you for your feedback!')
        self.assertTrue(reply.is_approved)


class CommentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='commentuser',
            email='comment@example.com',
            password='testpass123'
        )
        self.teacher = User.objects.create_user(
            username='teacher3',
            email='teacher3@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
    
    def test_create_comment(self):
        comment = Comment.objects.create(
            user=self.user,
            course=self.course,
            content='This is a test comment.'
        )
        self.assertEqual(str(comment), f"Comment by {self.user.username} on {self.course.title}")
        self.assertEqual(comment.content, 'This is a test comment.')
        self.assertTrue(comment.is_active)
        self.assertIsNone(comment.parent)
    
    def test_create_reply_comment(self):
        parent_comment = Comment.objects.create(
            user=self.user,
            course=self.course,
            content='Parent comment'
        )
        reply_comment = Comment.objects.create(
            user=self.teacher,
            course=self.course,
            content='This is a reply',
            parent=parent_comment
        )
        self.assertEqual(reply_comment.parent, parent_comment)
        self.assertTrue(reply_comment.is_reply)
        self.assertEqual(parent_comment.replies.count(), 1)


class CommentLikeModelTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        self.teacher = User.objects.create_user(
            username='teacher4',
            email='teacher4@example.com',
            password='testpass123',
            is_teacher=True
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description',
            price=99.99,
            teacher=self.teacher
        )
        self.comment = Comment.objects.create(
            user=self.teacher,
            course=self.course,
            content='Test comment.'
        )
    
    def test_like_comment(self):
        like = CommentLike.objects.create(
            user=self.user1,
            comment=self.comment
        )
        self.assertEqual(str(like), f"{self.user1.username} likes {self.comment}")
        self.assertEqual(self.comment.like_count, 1)
        
        # Test unique constraint
        with self.assertRaises(Exception):
            CommentLike.objects.create(
                user=self.user1,
                comment=self.comment
            )
        
        # Test like count with multiple likes
        CommentLike.objects.create(
            user=self.user2,
            comment=self.comment
        )
        self.assertEqual(self.comment.like_count, 2)
