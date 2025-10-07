"""
This package contains the content management functionality for the LMS.
All imports are lazy-loaded to prevent circular imports.
"""

import sys
from importlib import import_module
from django.utils.module_loading import import_string

# Cache for imported modules and classes
_import_cache = {}

# Define the available imports with their full paths
_IMPORTS = {
    # Views
    'ModuleViewSet': 'content.views.ModuleViewSet',
    'LessonViewSet': 'content.views.LessonViewSet',
    'ContentViewSet': 'content.views.ContentViewSet',
    'ProgressViewSet': 'content.views_progress.ProgressViewSet',
    'SearchViewSet': 'content.views_search.SearchViewSet',
    'ContentSearchView': 'content.views_search.ContentSearchView',
    
    # Serializers
    'ModuleSerializer': 'content.serializers.ModuleSerializer',
    'LessonSerializer': 'content.serializers.LessonSerializer',
    'ContentSerializer': 'content.serializers.ContentSerializer',
    'ModuleProgressSerializer': 'content.serializers_progress.ModuleProgressSerializer',
    'UserProgressSerializer': 'content.serializers_progress.UserProgressSerializer',
    'LessonCompletionSerializer': 'content.serializers_progress.LessonCompletionSerializer',
    'ContentTrackingSerializer': 'content.serializers_progress.ContentTrackingSerializer',
    'SearchSerializer': 'content.serializers_search.SearchSerializer',
    'LessonSearchSerializer': 'content.serializers_search.LessonSearchSerializer',
    'ResourceSearchSerializer': 'content.serializers_search.ResourceSearchSerializer',
}

def __getattr__(name):
    """
    Lazily import and return the requested attribute.
    This helps prevent circular imports by only importing what's needed when it's needed.
    """
    # During Django's app loading, just return a dummy value if we're not fully initialized yet
    if 'django' not in sys.modules or 'django.apps' not in sys.modules:
        return None
        
    if name in _import_cache:
        return _import_cache[name]
        
    if name not in _IMPORTS:
        raise AttributeError(f"module 'content' has no attribute '{name}'")
    
    try:
        module_path, class_name = _IMPORTS[name].rsplit('.', 1)
        module = import_module(module_path)
        _import_cache[name] = getattr(module, class_name)
        return _import_cache[name]
    except (ImportError, AttributeError) as e:
        # If we're still initializing, return None instead of raising an error
        if 'django.setup' in sys._current_frames():
            return None
        raise ImportError(
            f"Could not import '{_IMPORTS[name]}'. "
            f"{name}: {e}"
        ) from e

# Define __all__ for documentation and IDE support
__all__ = list(_IMPORTS.keys())

# Add default_app_config for Django < 3.2 compatibility
try:
    from django.apps import apps
    if not apps.ready:
        default_app_config = 'content.apps.ContentConfig'
except (ImportError, RuntimeError):
    default_app_config = 'content.apps.ContentConfig'
