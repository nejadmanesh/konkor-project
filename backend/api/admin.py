from django.contrib import admin
from .models import (
    User, EmailOTP, StudentProfile, Notification, 
    PlannerRequest, Book, Exam, SyllabusDetail
)


# ----------------------
# User Admin
# ----------------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'is_staff', 'created_at')
    list_filter = ('is_active', 'is_staff', 'created_at')
    search_fields = ('email',)
    ordering = ('-created_at',)


# ----------------------
# EmailOTP Admin
# ----------------------
@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'created_at', 'is_used')
    list_filter = ('is_used', 'created_at')
    search_fields = ('email', 'code')
    ordering = ('-created_at',)


# ----------------------
# StudentProfile Admin
# ----------------------
@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'grade', 'field', 'daily_hours')
    list_filter = ('grade', 'field')
    search_fields = ('name', 'user__email', 'phone')
    ordering = ('name',)


# ----------------------
# Notification Admin
# ----------------------
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__email', 'title', 'body')
    ordering = ('-created_at',)


# ----------------------
# PlannerRequest Admin
# ----------------------
@admin.register(PlannerRequest)
class PlannerRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'exam_provider', 'exam_date', 'status', 'created_at', 'expires_at')
    list_filter = ('status', 'exam_provider', 'created_at')
    search_fields = ('user__email', 'exam_provider', 'exam_code')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'expires_at')


# ----------------------
# Book Admin
# ----------------------
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('name', 'grade', 'subject_category')
    list_filter = ('grade', 'subject_category')
    search_fields = ('name', 'subject_category')
    ordering = ('grade', 'name')


# ----------------------
# Exam Admin
# ----------------------
@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('title', 'exam_type', 'exam_date')
    list_filter = ('exam_type', 'exam_date')
    search_fields = ('title', 'description')
    ordering = ('-exam_date',)


# ----------------------
# SyllabusDetail Admin
# ----------------------
@admin.register(SyllabusDetail)
class SyllabusDetailAdmin(admin.ModelAdmin):
    list_display = ('topic_title', 'exam', 'book', 'pages')
    list_filter = ('exam', 'book')
    search_fields = ('topic_title', 'exam__title', 'book__name')
    ordering = ('exam', 'book', 'topic_title')
    autocomplete_fields = ['exam', 'book']  # برای جستجوی سریع‌تر
