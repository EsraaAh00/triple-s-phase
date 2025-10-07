from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Module, Lesson, LessonResource
from .serializers import (
    ModuleSearchSerializer,
    LessonSearchSerializer,
    ResourceSearchSerializer
)

class ContentSearchView(generics.ListAPIView):
    """Search across modules, lessons, and resources"""
    permission_classes = [IsAuthenticated]
    search_fields = ['title', 'description', 'content']
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['title', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        content_type = self.request.query_params.get('type', 'all')
        course_id = self.request.query_params.get('course_id')
        
        # Base querysets
        modules = Module.objects.all()
        lessons = Lesson.objects.all()
        resources = LessonResource.objects.all()
        
        # Filter by course if specified
        if course_id:
            modules = modules.filter(course_id=course_id)
            lessons = lessons.filter(module__course_id=course_id)
            resources = resources.filter(lesson__module__course_id=course_id)
        
        # Apply search query if provided
        if query:
            modules = modules.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query)
            )
            
            lessons = lessons.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(content__icontains=query)
            )
            
            resources = resources.filter(
                Q(title__icontains=query) |
                Q(description__icontains=query))
        
        # Filter by content type
        if content_type == 'modules':
            return modules
        elif content_type == 'lessons':
            return lessons
        elif content_type == 'resources':
            return resources
        else:
            # Return all content types
            return list(modules) + list(lessons) + list(resources)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get the content type for filtering
        content_type = self.request.query_params.get('type', 'all')
        
        # Serialize based on content type
        if content_type == 'modules' or isinstance(queryset, list):
            modules = [item for item in queryset if isinstance(item, Module)]
            modules_serializer = ModuleSearchSerializer(modules, many=True)
            if content_type == 'modules':
                return Response({
                    'modules': modules_serializer.data,
                    'count': len(modules_serializer.data)
                })
        
        if content_type == 'lessons' or isinstance(queryset, list):
            lessons = [item for item in queryset if isinstance(item, Lesson)]
            lessons_serializer = LessonSearchSerializer(lessons, many=True)
            if content_type == 'lessons':
                return Response({
                    'lessons': lessons_serializer.data,
                    'count': len(lessons_serializer.data)
                })
        
        if content_type == 'resources' or isinstance(queryset, list):
            resources = [item for item in queryset if isinstance(item, LessonResource)]
            resources_serializer = ResourceSearchSerializer(resources, many=True)
            if content_type == 'resources':
                return Response({
                    'resources': resources_serializer.data,
                    'count': len(resources_serializer.data)
                })
        
        # If no specific type or mixed results
        return Response({
            'modules': modules_serializer.data if 'modules_serializer' in locals() else [],
            'lessons': lessons_serializer.data if 'lessons_serializer' in locals() else [],
            'resources': resources_serializer.data if 'resources_serializer' in locals() else [],
            'count': (
                len(modules_serializer.data if 'modules_serializer' in locals() else []) +
                len(lessons_serializer.data if 'lessons_serializer' in locals() else []) +
                len(resources_serializer.data if 'resources_serializer' in locals() else [])
            )
        })
