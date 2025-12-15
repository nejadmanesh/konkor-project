"""
Monitoring utilities for tracking performance and errors
"""
import logging
import time
from functools import wraps
from django.db import connection

logger = logging.getLogger('api')


def log_performance(func):
    """
    Decorator to log function execution time
    Usage: @log_performance
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        logger.info(f"{func.__name__} executed in {execution_time:.2f} seconds")
        
        # Log slow queries (> 1 second)
        if execution_time > 1.0:
            logger.warning(f"SLOW FUNCTION: {func.__name__} took {execution_time:.2f} seconds")
        
        return result
    return wrapper


def log_database_queries(func):
    """
    Decorator to log database query count
    Usage: @log_database_queries
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Reset query log
        connection.queries_log.clear()
        
        result = func(*args, **kwargs)
        
        # Get query count
        query_count = len(connection.queries)
        
        logger.info(f"{func.__name__} executed {query_count} database queries")
        
        # Warn if too many queries (N+1 problem)
        if query_count > 10:
            logger.warning(f"HIGH QUERY COUNT: {func.__name__} executed {query_count} queries")
        
        return result
    return wrapper


def track_user_action(action_name):
    """
    Decorator to track user actions
    Usage: @track_user_action("login")
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user_email = getattr(request.user, 'email', 'Anonymous')
            ip_address = request.META.get('REMOTE_ADDR', 'Unknown')
            
            logger.info(f"USER ACTION: {action_name} | User: {user_email} | IP: {ip_address}")
            
            result = func(request, *args, **kwargs)
            return result
        return wrapper
    return decorator


def log_api_error(error, request=None, extra_context=None):
    """
    Centralized error logging
    """
    context = {
        'error': str(error),
        'error_type': type(error).__name__,
    }
    
    if request:
        context.update({
            'path': request.path,
            'method': request.method,
            'user': getattr(request.user, 'email', 'Anonymous'),
            'ip': request.META.get('REMOTE_ADDR', 'Unknown'),
        })
    
    if extra_context:
        context.update(extra_context)
    
    logger.error(f"API Error: {context}")
    return context


class PerformanceMonitor:
    """
    Context manager for monitoring code blocks
    
    Usage:
        with PerformanceMonitor('expensive_operation'):
            # your code here
    """
    def __init__(self, operation_name):
        self.operation_name = operation_name
        self.start_time: float = 0.0
    
    def __enter__(self):
        self.start_time = time.time()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        execution_time = time.time() - self.start_time
        logger.info(f"{self.operation_name} took {execution_time:.2f} seconds")
        
        if execution_time > 1.0:
            logger.warning(f"SLOW OPERATION: {self.operation_name} took {execution_time:.2f} seconds")
