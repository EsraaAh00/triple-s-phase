from django import forms
from django_ckeditor_5.widgets import CKEditor5Widget

class CKEditor5FormField(forms.CharField):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.widget = CKEditor5Widget(
            attrs={'class': 'django-ckeditor-5'},
            config_name='extends'
        )

# Example usage in forms:
# content = CKEditor5FormField(
#     label='Content',
#     required=False,
#     widget=CKEditor5Widget(
#         attrs={'class': 'django-ckeditor-5'},
#         config_name='extends'
#     )
# )
