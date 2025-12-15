from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db import connection


@require_GET
def health_check(request):
    """
    Health check endpoint for Docker and load balancers.
    Returns 200 if the service is healthy.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({
            'status': 'ok',
            'service': 'konkour-backend',
            'database': 'connected'
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'service': 'konkour-backend',
            'error': str(e)
        }, status=503)
