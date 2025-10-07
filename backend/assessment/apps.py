from django.apps import AppConfig


class AssessmentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'assessment'
    verbose_name = 'نظام التقييمات'
    
    def ready(self):
        """Import signals when the app is ready"""
        try:
            import assessment.signals
        except ImportError:
            pass
