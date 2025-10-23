from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssessmentViewSet, QuestionBankViewSet, StudentSubmissionViewSet,
    StudentAnswerViewSet, FlashcardViewSet, StudentFlashcardProgressViewSet,
    QuestionBankChapterViewSet, QuestionBankTopicViewSet,
    FlashcardChapterViewSet, FlashcardTopicViewSet, check_enrollment_status
)
from .product_views import (
    QuestionBankProductViewSet, QuestionBankProductEnrollmentViewSet,
    FlashcardProductViewSet, FlashcardProductEnrollmentViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'questions', QuestionBankViewSet, basename='question')
router.register(r'submissions', StudentSubmissionViewSet, basename='submission')
router.register(r'answers', StudentAnswerViewSet, basename='answer')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')
router.register(r'flashcard-progress', StudentFlashcardProgressViewSet, basename='flashcard-progress')

# Product viewsets
router.register(r'question-bank-products', QuestionBankProductViewSet, basename='question-bank-product')
router.register(r'question-bank-enrollments', QuestionBankProductEnrollmentViewSet, basename='question-bank-enrollment')
router.register(r'flashcard-products', FlashcardProductViewSet, basename='flashcard-product')
router.register(r'flashcard-enrollments', FlashcardProductEnrollmentViewSet, basename='flashcard-enrollment')

# New viewsets for chapter and topic management
router.register(r'question-bank-chapters', QuestionBankChapterViewSet, basename='question-bank-chapter')
router.register(r'question-bank-topics', QuestionBankTopicViewSet, basename='question-bank-topic')
router.register(r'flashcard-chapters', FlashcardChapterViewSet, basename='flashcard-chapter')
router.register(r'flashcard-topics', FlashcardTopicViewSet, basename='flashcard-topic')

urlpatterns = [
    path('', include(router.urls)),
    path('enrollment-status/', check_enrollment_status, name='check-enrollment-status'),
]
