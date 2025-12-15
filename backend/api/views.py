from django.shortcuts import render
from django_ratelimit.decorators import ratelimit
from django.core.paginator import Paginator
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger('api')

# Create your views here.
# backend/api/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "ok"})


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.utils import timezone
from .models import EmailOTP
from django.conf import settings
import random


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='10/h', method='POST')  # افزایش rate limit برای development
def send_otp(request):
    try:
        # Check rate limit
        was_limited = getattr(request, 'limited', False)
        if was_limited:
            logger.warning(f"Rate limit exceeded for OTP request from IP: {request.META.get('REMOTE_ADDR')}")
            return Response({"error": "Too many requests. Please try again later."}, status=429)
        
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=400)

        # اعتبارسنجی ساده ایمیل
        if '@' not in email or '.' not in email.split('@')[1]:
            return Response({"error": "Invalid email format"}, status=400)

        # Clean up old OTPs (older than 15 minutes)
        EmailOTP.objects.filter(
            created_at__lt=timezone.now() - timedelta(minutes=15)
        ).delete()

        # حذف OTP های استفاده نشده قبلی برای همین ایمیل
        EmailOTP.objects.filter(email=email, is_used=False).delete()

        # ایجاد OTP جدید
        otp_code = str(random.randint(100000, 999999))
        otp = EmailOTP.objects.create(
            email=email,
            code=otp_code
        )

        logger.info(f"OTP generated for email: {email}")
        
        # نمایش کد OTP در ترمینال برای دیباگ (همیشه)
        print(f"\n{'='*60}")
        print(f"🔐 OTP CODE FOR LOGIN")
        print(f"{'='*60}")
        print(f"📧 Email: {email}")
        print(f"🔑 Code: {otp.code}")
        print(f"⏰ Valid for: 15 minutes")
        print(f"{'='*60}\n")
        logger.info(f"OTP Code: {otp.code} for email: {email}")

        # ارسال ایمیل (در development اگر fail شود، خطا نمی‌دهد)
        email_sent = False
        if settings.EMAIL_BACKEND != 'django.core.mail.backends.console.EmailBackend':
            try:
                send_mail(
                    subject="Your Login Code",
                    message=f"Your login code is: {otp.code}\n\nThis code is valid for 15 minutes.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True  # در development fail silently
                )
                email_sent = True
                logger.info(f"OTP email sent successfully to: {email}")
            except Exception as e:
                logger.warning(f"Failed to send OTP email to {email}: {str(e)} (Code is still available in terminal)")
        else:
            # اگر console backend است، در console نمایش می‌دهد
            email_sent = True

        return Response({
            "message": "OTP sent successfully",
            "email_sent": email_sent
        })
        
    except Exception as e:
        logger.error(f"Error in send_otp: {str(e)}")
        return Response({"error": "An error occurred. Please try again."}, status=500)



from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='20/h', method='POST')  # افزایش rate limit برای development
def verify_otp(request):
    try:
        was_limited = getattr(request, 'limited', False)
        if was_limited:
            logger.warning(f"Rate limit exceeded for OTP verification from IP: {request.META.get('REMOTE_ADDR')}")
            return Response({"error": "Too many requests. Please try again later."}, status=429)
        
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response({"error": "Email and code are required"}, status=400)

        # اعتبارسنجی فرمت
        if not code.isdigit() or len(code) != 6:
            return Response({"error": "Code must be a 6-digit number"}, status=400)

        # جستجوی OTP معتبر
        otp = EmailOTP.objects.filter(
            email=email, 
            code=code, 
            is_used=False,
            created_at__gte=timezone.now() - timedelta(minutes=15)
        ).first()

        if not otp:
            logger.warning(f"Invalid OTP attempt for email: {email}, code: {code}")
            # بررسی اینکه آیا OTP منقضی شده یا استفاده شده
            expired_otp = EmailOTP.objects.filter(
                email=email,
                code=code,
                created_at__lt=timezone.now() - timedelta(minutes=15)
            ).exists()
            
            if expired_otp:
                return Response({"error": "Code has expired. Please request a new code."}, status=400)
            else:
                return Response({"error": "Invalid code. Please check and try again."}, status=400)

        # استفاده از transaction برای اطمینان از atomicity
        with transaction.atomic():
            otp.is_used = True
            otp.save()

            # ایجاد یا دریافت کاربر
            user, created = User.objects.get_or_create(email=email)
            
        if created:
            logger.info(f"New user created via OTP: {email}")
        else:
            logger.info(f"User logged in via OTP: {email}")

        # ایجاد JWT tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            "access": str(access),
            "refresh": str(refresh),
            "is_new_user": created,
            "message": "Login successful"
        })
        
    except Exception as e:
        logger.error(f"Error in verify_otp: {str(e)}")
        return Response({"error": "An error occurred. Please try again."}, status=500)




# remove duplicate verify_otp (merged above)




from .models import StudentProfile, Notification

@api_view(['POST'])
@permission_classes([AllowAny])
@ratelimit(key='ip', rate='5/h', method='POST')
def register(request):
    was_limited = getattr(request, 'limited', False)
    if was_limited:
        return Response({"error": "Too many requests. Please try again later."}, status=429)
    
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response({"error": "نام، ایمیل و رمز عبور الزامی است"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "ایمیل تکراری است"}, status=400)

    with transaction.atomic():
        user = User.objects.create_user(email=email, password=password)
        StudentProfile.objects.get_or_create(
            user=user,
            defaults={
                "name": name,
                "grade": "",
                "field": "",
                "daily_hours": 0,
                "phone": "",
                "address": "",
                "birthdate_jalali": "",
            }
        )

    refresh = RefreshToken.for_user(user)
    access = refresh.access_token

    return Response({
        "access": str(access),
        "refresh": str(refresh),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    from .serializers import StudentProfileSerializer
    
    try:
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)
    except Exception as e:
        return Response({
            'error': 'Failed to fetch profile',
            'message': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    from .serializers import StudentProfileSerializer
    
    try:
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=400)
    except Exception as e:
        return Response({
            'error': 'Failed to update profile',
            'message': str(e)
        }, status=500)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_avatar(request):
    profile, _ = StudentProfile.objects.get_or_create(user=request.user)
    file = request.FILES.get("avatar")

    if not file:
        return Response({"error": "No file uploaded"}, status=400)
    
    # File size validation (max 5MB)
    if file.size > 5 * 1024 * 1024:
        return Response({"error": "File size must be less than 5MB"}, status=400)
    
    # File type validation
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        return Response({"error": "Only JPEG, PNG, and WebP images are allowed"}, status=400)
    
    # File extension validation
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    file_ext = os.path.splitext(file.name)[1].lower()
    if file_ext not in allowed_extensions:
        return Response({"error": "Invalid file extension"}, status=400)

    # Delete old avatar if exists
    if profile.avatar:
        try:
            if os.path.isfile(profile.avatar.path):
                os.remove(profile.avatar.path)
        except:
            pass

    profile.avatar = file
    profile.save()

    return Response({"avatar": profile.avatar.url})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    from .serializers import NotificationSerializer
    
    # Pagination
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 20))
    
    if page_size > 100:
        page_size = 100  # Max limit
    
    qs = Notification.objects.filter(user=request.user).select_related('user')
    paginator = Paginator(qs, page_size)
    
    try:
        notifications = paginator.page(page)
    except:
        notifications = paginator.page(1)
    
    serializer = NotificationSerializer(notifications, many=True)
    
    return Response({
        'results': serializer.data,
        'page': page,
        'total_pages': paginator.num_pages,
        'total_count': paginator.count,
        'has_next': notifications.has_next(),
        'has_previous': notifications.has_previous(),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    title = request.data.get("title") or "اطلاعیه"
    body = request.data.get("body") or "نمونه اعلان برای تست نمایش"
    Notification.objects.create(user=request.user, title=title, body=body)
    return Response({"status": "sent"})


# ----------------------
# Planner Request Views
# ----------------------
from .models import PlannerRequest
from .serializers import PlannerRequestSerializer
from rest_framework import status


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_planner_request(request):
    """ایجاد درخواست برنامه‌ریزی جدید (ذخیره به صورت draft)"""
    try:
        form_data = request.data.get('form_data', {})
        
        # استخراج اطلاعات از form_data
        exam_provider = form_data.get('examProvider', '')
        exam_date = form_data.get('examDate', '')
        daily_hours = form_data.get('dailyHours', 8)
        
        if not exam_provider or not exam_date:
            return Response({
                'error': 'examProvider and examDate are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ایجاد درخواست با وضعیت draft
        planner_request = PlannerRequest.objects.create(
            user=request.user,
            exam_provider=exam_provider,
            exam_date=exam_date,
            daily_hours=daily_hours,
            form_data=form_data,
            status='draft',
        )
        
        serializer = PlannerRequestSerializer(planner_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating planner request: {str(e)}")
        return Response({
            'error': 'Failed to create planner request',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_planner_request(request, request_id):
    """ارسال درخواست برای پردازش LLM (تغییر وضعیت از draft به pending)"""
    try:
        planner_request = PlannerRequest.objects.get(
            id=request_id,
            user=request.user
        )
        
        if planner_request.status != 'draft':
            return Response({
                'error': 'Request is already submitted or processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # به‌روزرسانی وضعیت به pending برای پردازش
        planner_request.status = 'pending'
        planner_request.save()
        
        # در اینجا می‌توانید event به Inngest یا queue بفرستید
        # برای پردازش با LLM
        
        serializer = PlannerRequestSerializer(planner_request)
        return Response({
            'message': 'Planner request submitted successfully',
            'data': serializer.data
        })
        
    except PlannerRequest.DoesNotExist:
        return Response({
            'error': 'Planner request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error submitting planner request: {str(e)}")
        return Response({
            'error': 'Failed to submit planner request',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_planner_request(request, request_id):
    """دریافت یک درخواست برنامه‌ریزی"""
    try:
        planner_request = PlannerRequest.objects.get(
            id=request_id,
            user=request.user
        )
        
        serializer = PlannerRequestSerializer(planner_request)
        return Response(serializer.data)
        
    except PlannerRequest.DoesNotExist:
        return Response({
            'error': 'Planner request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching planner request: {str(e)}")
        return Response({
            'error': 'Failed to fetch planner request',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_planner_requests(request):
    """لیست درخواست‌های برنامه‌ریزی کاربر"""
    try:
        requests = PlannerRequest.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        serializer = PlannerRequestSerializer(requests, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        })
        
    except Exception as e:
        logger.error(f"Error listing planner requests: {str(e)}")
        return Response({
            'error': 'Failed to list planner requests',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_planner_for_llm(request, request_id):
    """دریافت داده‌های کامل برای ارسال به LLM"""
    try:
        planner_request = PlannerRequest.objects.get(
            id=request_id,
            user=request.user
        )
        
        # دریافت پروفایل کاربر
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        
        # ساخت exam_code از provider و date
        exam_code = f"{planner_request.exam_provider}_{planner_request.exam_date}"
        
        # ساخت داده‌های کامل برای LLM
        llm_data = {
            'request_id': planner_request.id,
            'user_id': request.user.id,
            'user_profile': {
                'name': profile.name,
                'grade': profile.grade,
                'field': profile.field,
                'daily_hours': profile.daily_hours or planner_request.daily_hours,
            },
            'exam': {
                'provider': planner_request.exam_provider,
                'date': planner_request.exam_date,
                'code': planner_request.exam_code or exam_code,
            },
            'constraints': planner_request.form_data,
            'target_rank': planner_request.target_rank,
            'period_days': planner_request.period_days,
        }
        
        return Response(llm_data)
        
    except PlannerRequest.DoesNotExist:
        return Response({
            'error': 'Planner request not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error preparing LLM data: {str(e)}")
        return Response({
            'error': 'Failed to prepare LLM data',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)