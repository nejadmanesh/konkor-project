from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import PlannerRequest


class Command(BaseCommand):
    help = 'Clean up expired planner requests (older than 60 days)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=60,
            help='Delete requests older than specified days (default: 60)',
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_time = timezone.now() - timedelta(days=days)
        
        deleted_count, _ = PlannerRequest.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deleted {deleted_count} expired planner requests'
            )
        )









