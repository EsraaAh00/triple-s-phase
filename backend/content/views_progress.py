from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import ModuleProgress, UserProgress, Lesson
from .serializers import ModuleProgressSerializer, UserProgressSerializer
from .serializers_progress import LessonCompletionSerializer, ContentTrackingSerializer

class ProgressViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def user_progress(self, request, course_id=None):
        """Get or create user progress for a course"""
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            course_id=course_id
        )
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def track_lesson_progress(self, request, course_id=None):
        """Track user's progress on a lesson"""
        serializer = ContentTrackingSerializer(data=request.data)
        if serializer.is_valid():
            lesson = get_object_or_404(Lesson, id=serializer.validated_data['lesson_id'])
            progress, _ = ModuleProgress.objects.get_or_create(
                user=request.user,
                module=lesson.module
            )
            
            # Update progress based on the tracking data
            if 'video_progress' in serializer.validated_data:
                progress.video_progress = serializer.validated_data['video_progress']
                if progress.video_progress >= 90:  # Consider 90% as watched
                    progress.video_watched = True
            
            if 'is_completed' in serializer.validated_data and serializer.validated_data['is_completed']:
                progress.is_completed = True
                progress.status = 'completed'
            
            progress.save()
            
            # Update overall course progress
            user_progress = UserProgress.objects.get(user=request.user, course_id=course_id)
            user_progress.update_progress()
            
            return Response(ModuleProgressSerializer(progress).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def complete_lesson(self, request, course_id=None):
        """Mark a lesson as completed"""
        serializer = LessonCompletionSerializer(data=request.data)
        if serializer.is_valid():
            lesson = get_object_or_404(Lesson, id=serializer.validated_data['lesson_id'])
            progress, _ = ModuleProgress.objects.get_or_create(
                user=request.user,
                module=lesson.module
            )
            
            progress.is_completed = True
            progress.status = 'completed'
            progress.save()
            
            # Update overall course progress
            user_progress = UserProgress.objects.get(user=request.user, course_id=course_id)
            user_progress.update_progress()
            
            return Response({'status': 'lesson completed'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def module_progress(self, request, module_id=None):
        """Get progress for a specific module"""
        progress = get_object_or_404(
            ModuleProgress.objects.select_related('module'),
            user=request.user,
            module_id=module_id
        )
        return Response(ModuleProgressSerializer(progress).data)

    @action(detail=False, methods=['get'])
    def course_progress(self, request, course_id=None):
        """Get all module progress for a course"""
        progresses = ModuleProgress.objects.filter(
            user=request.user,
            module__course_id=course_id
        ).select_related('module')
        serializer = ModuleProgressSerializer(progresses, many=True)
        return Response(serializer.data)
