from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.analytics.models import UsageLog
from apps.accounts.models import User


class Command(BaseCommand):
    help = 'Update usage logs for all businesses'

    def handle(self, *args, **options):
        today = timezone.now().date()
        
        # Create usage logs for all businesses for today
        for user in User.objects.filter(is_active=True):
            usage_log, created = UsageLog.objects.get_or_create(
                business=user,
                date=today
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created usage log for {user.business_name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Usage log already exists for {user.business_name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully updated usage logs')
        )
