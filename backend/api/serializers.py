from rest_framework import serializers
from .models import StudentProfile, Notification, PlannerRequest


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = "__all__"
        read_only_fields = ["user"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "body", "is_read", "created_at"]


class PlannerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlannerRequest
        fields = [
            'id',
            'exam_provider',
            'exam_date',
            'daily_hours',
            'form_data',
            'status',
            'generated_plan',
            'exam_code',
            'target_rank',
            'period_days',
            'created_at',
            'updated_at',
            'expires_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'expires_at', 'status', 'generated_plan']
