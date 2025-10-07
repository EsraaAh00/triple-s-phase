from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssessmentViewSet, QuestionBankViewSet, StudentSubmissionViewSet,
    StudentAnswerViewSet, FlashcardViewSet, StudentFlashcardProgressViewSet
)

# Create router and register viewsets
router = DefaultRouter()
router.register(r'assessments', AssessmentViewSet, basename='assessment')
router.register(r'questions', QuestionBankViewSet, basename='question')
router.register(r'submissions', StudentSubmissionViewSet, basename='submission')
router.register(r'answers', StudentAnswerViewSet, basename='answer')
router.register(r'flashcards', FlashcardViewSet, basename='flashcard')
router.register(r'flashcard-progress', StudentFlashcardProgressViewSet, basename='flashcard-progress')

urlpatterns = [
    path('', include(router.urls)),
]
