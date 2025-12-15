from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import EmailOTP


class Command(BaseCommand):
    help = 'Clean up expired OTP codes (older than 24 hours)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Delete OTPs older than specified hours (default: 24)',
        )

    def handle(self, *args, **options):
        hours = options['hours']
        cutoff_time = timezone.now() - timedelta(hours=hours)
        
        deleted_count, _ = EmailOTP.objects.filter(
            created_at__lt=cutoff_time
        ).delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deleted {deleted_count} expired OTP codes older than {hours} hours'
            )
        )
