from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import random


# ----------------------
# Custom User Manager
# ----------------------
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password if password else self.make_random_password())
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


# ----------------------
# Custom User Model
# ----------------------
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# ----------------------
# Email OTP model
# ----------------------
class EmailOTP(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_used = models.BooleanField(default=False, db_index=True)

    def generate_code(self):
        return f"{random.randint(100000, 999999)}"

    def __str__(self):
        return f"{self.email} - {self.code}"


# ----------------------
# Student Profile
# ----------------------
class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)

    name = models.CharField(max_length=255, db_index=True)
    grade = models.CharField(max_length=10, db_index=True)      # پایه تحصیلی
    field = models.CharField(max_length=20, db_index=True)      # رشته
    daily_hours = models.PositiveIntegerField(default=0)

    phone = models.CharField(max_length=20)
    address = models.TextField(null=True, blank=True)
    birthdate_jalali = models.CharField(max_length=20)

    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    def __str__(self):
        return self.name


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications", db_index=True)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.title}"


# ----------------------
# Planner Request Model
# ----------------------
class PlannerRequest(models.Model):
    """مدل برای ذخیره درخواست‌های برنامه‌ریزی که بعد از 60 روز خودکار پاک می‌شوند"""
    
    STATUS_CHOICES = [
        ('draft', 'پیش‌نویس'),
        ('pending', 'در انتظار'),
        ('processing', 'در حال پردازش'),
        ('completed', 'تکمیل شده'),
        ('failed', 'خطا'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='planner_requests',
        db_index=True
    )
    
    # اطلاعات آزمون
    exam_provider = models.CharField(max_length=50, db_index=True)  # ghalamchi, gaj
    exam_date = models.CharField(max_length=20, db_index=True)  # 1404-09-02
    
    # اطلاعات کلی
    daily_hours = models.PositiveIntegerField(default=8)
    
    # داده‌های فرم به صورت JSON
    form_data = models.JSONField(default=dict)
    
    # وضعیت پردازش
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    
    # نتیجه برنامه (بعد از پردازش LLM)
    generated_plan = models.JSONField(null=True, blank=True)
    
    # اطلاعات اضافی برای LLM
    exam_code = models.CharField(max_length=100, blank=True, null=True)  # کد آزمون برای LLM
    target_rank = models.PositiveIntegerField(null=True, blank=True)  # رتبه هدف
    period_days = models.PositiveIntegerField(default=14)  # تعداد روزهای برنامه
    
    # زمان‌ها
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField(db_index=True)  # برای auto-delete
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['expires_at']),
        ]
        verbose_name = 'درخواست برنامه‌ریزی'
        verbose_name_plural = 'درخواست‌های برنامه‌ریزی'
    
    def save(self, *args, **kwargs):
        # تنظیم expires_at به 60 روز بعد
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=60)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.email} - {self.exam_provider} - {self.exam_date} ({self.status})"
    
    @property
    def is_expired(self):
        """بررسی انقضای درخواست"""
        return timezone.now() > self.expires_at


# ----------------------
# Exam Management Models
# ----------------------

# مدل 1: Book (مطابق با جدول books)
class Book(models.Model):
    """مدل کتاب برای ذخیره اطلاعات کتاب‌های درسی"""
    name = models.CharField(max_length=100, db_index=True)
    grade = models.IntegerField(db_index=True)
    subject_category = models.CharField(max_length=50, db_index=True)

    class Meta:
        ordering = ['grade', 'name']
        indexes = [
            models.Index(fields=['grade', 'subject_category']),
        ]
        verbose_name = 'کتاب'
        verbose_name_plural = 'کتاب‌ها'

    def __str__(self):
        return f"{self.name} (Grade {self.grade})"


# مدل 2: Exam (مطابق با جدول exams)
class Exam(models.Model):
    """مدل آزمون برای ذخیره اطلاعات آزمون‌ها"""
    
    EXAM_TYPE_CHOICES = [
        ('Main', 'اصلی'),
        ('Base', 'پایه'),
    ]
    
    exam_date = models.DateField(db_index=True)
    title = models.CharField(max_length=100, db_index=True)
    exam_type = models.CharField(
        max_length=50, 
        choices=EXAM_TYPE_CHOICES,
        db_index=True
    )  # 'Main' یا 'Base'
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-exam_date']
        indexes = [
            models.Index(fields=['exam_date', 'exam_type']),
        ]
        verbose_name = 'آزمون'
        verbose_name_plural = 'آزمون‌ها'

    def __str__(self):
        return f"{self.title} ({self.exam_type} on {self.exam_date})"


# مدل 3: SyllabusDetail (مطابق با جدول syllabus_details)
class SyllabusDetail(models.Model):
    """مدل جزئیات سرفصل برای ذخیره موضوعات و صفحات مربوط به هر آزمون"""
    
    # Foreign Keys برای ارتباط با Exam و Book
    exam = models.ForeignKey(
        Exam, 
        on_delete=models.CASCADE, 
        related_name='syllabus_details',
        db_index=True
    )
    book = models.ForeignKey(
        Book, 
        on_delete=models.CASCADE, 
        related_name='syllabus_details',
        db_index=True
    )
    
    topic_title = models.CharField(max_length=255)
    pages = models.CharField(max_length=50)

    class Meta:
        ordering = ['exam', 'book', 'topic_title']
        indexes = [
            models.Index(fields=['exam', 'book']),
        ]
        verbose_name = 'جزئیات سرفصل'
        verbose_name_plural = 'جزئیات سرفصل‌ها'

    def __str__(self):
        return f"{self.topic_title} from {self.book.name} for {self.exam.title}"
