# backend/api/urls.py
from django.urls import path
from .views import (
    health_check, send_otp, verify_otp, get_profile, update_profile, 
    upload_avatar, register, list_notifications, send_test_notification,
    create_planner_request, get_planner_request, list_planner_requests,
    get_planner_for_llm, submit_planner_request
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('health/', health_check),
    path('auth/send-otp/', send_otp),
    path('auth/verify-otp/', verify_otp),
    path('register', register),
    path('profile/', get_profile),
    path('profile/update/', update_profile),
    path('profile/avatar/', upload_avatar),
    path('notifications/', list_notifications),
    path('notifications/test/', send_test_notification),
    # Planner endpoints
    path('planner/create/', create_planner_request),
    path('planner/<int:request_id>/', get_planner_request),
    path('planner/<int:request_id>/submit/', submit_planner_request),
    path('planner/list/', list_planner_requests),
    path('planner/<int:request_id>/llm-data/', get_planner_for_llm),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


