from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.analytics.models import APICallLog


class Command(BaseCommand):
    help = 'Clean up old API call logs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Number of days to keep logs (default: 30)'
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Delete old API call logs
        deleted_count, _ = APICallLog.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Deleted {deleted_count} old API call logs')
        )
