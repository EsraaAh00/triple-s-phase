"""
Bunny CDN integration views for video management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
import logging

from .models import Module, Lesson
from courses.models import Course
from .bunny_utils import (
    BunnyCDNClient, 
    validate_bunny_video_id, 
    get_bunny_video_url,
    get_bunny_embed_url,
    get_bunny_private_url,
    get_bunny_private_embed_url,
    update_module_bunny_video,
    update_lesson_bunny_video,
    update_course_bunny_promotional_video
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_bunny_video(request):
    """
    Validate a Bunny CDN video ID
    
    POST /api/content/bunny/validate/
    {
        "video_id": "your-bunny-video-id"
    }
    """
    video_id = request.data.get('video_id')
    
    if not video_id:
        return Response({
            'error': _('Video ID is required')
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = BunnyCDNClient()
        video_info = client.get_video_info(video_id)
        
        if video_info:
            return Response({
                'valid': True,
                'video_info': {
                    'id': video_info.get('guid'),
                    'title': video_info.get('title', ''),
                    'length': video_info.get('length', 0),
                    'playable_url': video_info.get('playableUrl', ''),
                    'thumbnail': video_info.get('thumbnailFileName', ''),
                    'status': video_info.get('status', ''),
                    'created_at': video_info.get('dateCreated', ''),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'valid': False,
                'error': _('Video not found or invalid ID')
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error validating Bunny video {video_id}: {str(e)}")
        return Response({
            'valid': False,
            'error': _('Error validating video')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_module_bunny_video_view(request, module_id):
    """
    Update a module with Bunny CDN video
    
    POST /api/content/modules/{module_id}/bunny-video/
    {
        "video_id": "your-bunny-video-id"
    }
    """
    module = get_object_or_404(Module, id=module_id)
    video_id = request.data.get('video_id')
    
    # Note: Any authenticated user can update modules
    # Add specific permission checks here if needed
    
    if not video_id:
        return Response({
            'error': _('Video ID is required')
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        success = update_module_bunny_video(module, video_id)
        
        if success:
            return Response({
                'success': True,
                'message': _('Module updated with Bunny video successfully'),
                'module': {
                    'id': module.id,
                    'name': module.name,
                    'bunny_video_id': module.bunny_video_id,
                    'bunny_video_url': module.bunny_video_url,
                    'video_duration': module.video_duration,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': _('Failed to update module with Bunny video')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error updating module {module_id} with Bunny video {video_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error updating module')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_lesson_bunny_video_view(request, lesson_id):
    """
    Update a lesson with Bunny CDN video
    
    POST /api/content/lessons/{lesson_id}/bunny-video/
    {
        "video_id": "your-bunny-video-id"
    }
    """
    lesson = get_object_or_404(Lesson, id=lesson_id)
    video_id = request.data.get('video_id')
    
    # Note: Any authenticated user can update lessons
    # Add specific permission checks here if needed
    
    if not video_id:
        return Response({
            'error': _('Video ID is required')
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        success = update_lesson_bunny_video(lesson, video_id)
        
        if success:
            return Response({
                'success': True,
                'message': _('Lesson updated with Bunny video successfully'),
                'lesson': {
                    'id': lesson.id,
                    'title': lesson.title,
                    'bunny_video_id': lesson.bunny_video_id,
                    'bunny_video_url': lesson.bunny_video_url,
                    'duration_minutes': lesson.duration_minutes,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': _('Failed to update lesson with Bunny video')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error updating lesson {lesson_id} with Bunny video {video_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error updating lesson')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bunny_video_info(request, video_id):
    """
    Get Bunny CDN video information
    
    GET /api/content/bunny/video/{video_id}/
    """
    try:
        client = BunnyCDNClient()
        video_info = client.get_video_info(video_id)
        
        if video_info:
            return Response({
                'video_info': {
                    'id': video_info.get('guid'),
                    'title': video_info.get('title', ''),
                    'length': video_info.get('length', 0),
                    'playable_url': video_info.get('playableUrl', ''),
                    'embed_url': get_bunny_embed_url(video_id),
                    'direct_url': get_bunny_video_url(video_id),
                    'thumbnail': video_info.get('thumbnailFileName', ''),
                    'status': video_info.get('status', ''),
                    'created_at': video_info.get('dateCreated', ''),
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': _('Video not found')
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        logger.error(f"Error fetching Bunny video info {video_id}: {str(e)}")
        return Response({
            'error': _('Error fetching video information')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bunny_embed_url_view(request, video_id):
    """
    Get Bunny CDN embed URL for iframe
    
    GET /api/content/bunny/embed/{video_id}/
    Query parameters:
    - autoplay: true/false (default: false)
    - loop: true/false (default: false)
    - muted: true/false (default: false)
    - start_time: number (default: 0)
    """
    try:
        autoplay = request.GET.get('autoplay', 'false').lower() == 'true'
        loop = request.GET.get('loop', 'false').lower() == 'true'
        muted = request.GET.get('muted', 'false').lower() == 'true'
        start_time = int(request.GET.get('start_time', 0))
        
        embed_url = get_bunny_embed_url(
            video_id=video_id,
            autoplay=autoplay,
            loop=loop,
            muted=muted,
            start_time=start_time
        )
        
        if embed_url:
            return Response({
                'embed_url': embed_url,
                'video_id': video_id,
                'parameters': {
                    'autoplay': autoplay,
                    'loop': loop,
                    'muted': muted,
                    'start_time': start_time
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': _('Failed to generate embed URL')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error generating embed URL for video {video_id}: {str(e)}")
        return Response({
            'error': _('Error generating embed URL')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def remove_bunny_video_from_module(request, module_id):
    """
    Remove Bunny CDN video from a module
    
    DELETE /api/content/modules/{module_id}/bunny-video/
    """
    module = get_object_or_404(Module, id=module_id)
    
    try:
        module.bunny_video_id = None
        module.bunny_video_url = None
        module.save()
        
        return Response({
            'success': True,
            'message': _('Bunny video removed from module successfully'),
            'module': {
                'id': module.id,
                'name': module.name,
                'bunny_video_id': None,
                'bunny_video_url': None,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error removing Bunny video from module {module_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error removing video from module')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def remove_bunny_video_from_lesson(request, lesson_id):
    """
    Remove Bunny CDN video from a lesson
    
    DELETE /api/content/lessons/{lesson_id}/bunny-video/
    """
    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    try:
        lesson.bunny_video_id = None
        lesson.bunny_video_url = None
        lesson.save()
        
        return Response({
            'success': True,
            'message': _('Bunny video removed from lesson successfully'),
            'lesson': {
                'id': lesson.id,
                'title': lesson.title,
                'bunny_video_id': None,
                'bunny_video_url': None,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error removing Bunny video from lesson {lesson_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error removing video from lesson')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_course_bunny_promotional_video_view(request, course_id):
    """
    Update a course with Bunny CDN promotional video
    
    POST /api/content/courses/{course_id}/bunny-promotional-video/
    {
        "video_id": "your-bunny-video-id"
    }
    """
    course = get_object_or_404(Course, id=course_id)
    video_id = request.data.get('video_id')
    
    if not video_id:
        return Response({
            'error': _('Video ID is required')
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        success = update_course_bunny_promotional_video(course, video_id)
        
        if success:
            return Response({
                'success': True,
                'message': _('Course updated with Bunny promotional video successfully'),
                'course': {
                    'id': course.id,
                    'title': course.title,
                    'bunny_promotional_video_id': course.bunny_promotional_video_id,
                    'bunny_promotional_video_url': course.bunny_promotional_video_url,
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'error': _('Failed to update course with Bunny promotional video')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error updating course {course_id} with Bunny promotional video {video_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error updating course')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def remove_bunny_promotional_video_from_course(request, course_id):
    """
    Remove Bunny CDN promotional video from a course
    
    DELETE /api/content/courses/{course_id}/bunny-promotional-video/
    """
    course = get_object_or_404(Course, id=course_id)
    
    try:
        course.bunny_promotional_video_id = None
        course.bunny_promotional_video_url = None
        course.save()
        
        return Response({
            'success': True,
            'message': _('Bunny promotional video removed from course successfully'),
            'course': {
                'id': course.id,
                'title': course.title,
                'bunny_promotional_video_id': None,
                'bunny_promotional_video_url': None,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error removing Bunny promotional video from course {course_id}: {str(e)}")
        return Response({
            'success': False,
            'error': _('Error removing promotional video from course')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bunny_private_url_view(request, video_id):
    """
    Get Bunny CDN private streaming URL with token authentication
    
    GET /api/content/bunny/private/{video_id}/
    Query parameters:
    - expires_in: number (default: 3600 seconds = 1 hour)
    """
    try:
        expires_in = int(request.GET.get('expires_in', 3600))
        user_id = request.user.id
        
        private_url = get_bunny_private_url(
            video_id=video_id,
            user_id=user_id,
            expires_in=expires_in
        )
        
        if private_url:
            return Response({
                'private_url': private_url,
                'video_id': video_id,
                'user_id': user_id,
                'expires_in': expires_in
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': _('Failed to generate private URL')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error generating private URL for video {video_id}: {str(e)}")
        return Response({
            'error': _('Error generating private URL')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bunny_private_embed_url_view(request, video_id):
    """
    Get Bunny CDN private embed URL with token authentication
    
    GET /api/content/bunny/private-embed/{video_id}/
    Query parameters:
    - expires_in: number (default: 3600 seconds = 1 hour)
    - autoplay: true/false (default: false)
    - loop: true/false (default: false)
    - muted: true/false (default: false)
    - start_time: number (default: 0)
    """
    try:
        expires_in = int(request.GET.get('expires_in', 3600))
        autoplay = request.GET.get('autoplay', 'false').lower() == 'true'
        loop = request.GET.get('loop', 'false').lower() == 'true'
        muted = request.GET.get('muted', 'false').lower() == 'true'
        start_time = int(request.GET.get('start_time', 0))
        user_id = request.user.id
        
        private_embed_url = get_bunny_private_embed_url(
            video_id=video_id,
            user_id=user_id,
            expires_in=expires_in,
            autoplay=autoplay,
            loop=loop,
            muted=muted,
            start_time=start_time
        )
        
        if private_embed_url:
            return Response({
                'private_embed_url': private_embed_url,
                'video_id': video_id,
                'user_id': user_id,
                'expires_in': expires_in,
                'parameters': {
                    'autoplay': autoplay,
                    'loop': loop,
                    'muted': muted,
                    'start_time': start_time
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': _('Failed to generate private embed URL')
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error generating private embed URL for video {video_id}: {str(e)}")
        return Response({
            'error': _('Error generating private embed URL')
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
