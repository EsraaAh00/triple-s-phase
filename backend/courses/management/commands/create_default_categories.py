from django.core.management.base import BaseCommand
from courses.models import Category


class Command(BaseCommand):
    help = 'Create default categories (الدورات, التدريب الإلكتروني, الدبلومات)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of default categories even if they exist',
        )

    def handle(self, *args, **options):
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('Starting to create default categories...')
        )
        
        if force:
            # Delete existing default categories if force is used
            Category.objects.filter(is_default=True).delete()
            self.stdout.write(
                self.style.WARNING('Deleted existing default categories due to --force flag')
            )
        
        # Create default categories
        Category.create_default_categories()
        
        # Display results
        default_categories = Category.objects.filter(is_default=True)
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {default_categories.count()} default categories:')
        )
        
        for category in default_categories:
            self.stdout.write(
                f'  - {category.name} (slug: {category.slug}, order: {category.order})'
            )
        
        self.stdout.write(
            self.style.SUCCESS('Default categories creation completed!')
        )
