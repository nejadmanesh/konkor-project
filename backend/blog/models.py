from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Author(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='author_profile')
    display_name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    expertise = models.CharField(max_length=200, blank=True)
    profile_image = models.ImageField(upload_to='authors/', blank=True, null=True)
    twitter_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.display_name


class Category(models.Model):
    GRADE_CHOICES = [
        ('10', 'دهم'),
        ('11', 'یازدهم'),
        ('12', 'دوازدهم'),
        ('konkur', 'کنکور'),
    ]

    FIELD_CHOICES = [
        ('riazi', 'ریاضی'),
        ('tajrobi', 'تجربی'),
        ('ensani', 'انسانی'),
    ]

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=150, unique=True, allow_unicode=True)
    description = models.TextField(blank=True)
    grade = models.CharField(max_length=10, choices=GRADE_CHOICES, blank=True)
    field = models.CharField(max_length=10, choices=FIELD_CHOICES, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['grade', 'field']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, allow_unicode=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [models.Index(fields=['slug'])]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)


class Post(models.Model):
    STATUS_CHOICES = [
        ('draft', 'پیش‌نویس'),
        ('published', 'منتشر شده'),
        ('scheduled', 'زمان‌بندی شده'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, allow_unicode=True)
    subtitle = models.CharField(max_length=250, blank=True)
    excerpt = models.TextField(max_length=300)
    content = models.TextField()
    featured_image = models.ImageField(upload_to='blog/featured/', blank=True, null=True)
    featured_image_alt = models.CharField(max_length=200, blank=True)
    author = models.ForeignKey(Author, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField(Tag, related_name='posts', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reading_time = models.IntegerField(default=5)
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)
    og_title = models.CharField(max_length=95, blank=True)
    og_description = models.CharField(max_length=200, blank=True)
    og_image = models.ImageField(upload_to='blog/og/', blank=True, null=True)
    schema_type = models.CharField(max_length=50, default='Article')
    key_points = models.JSONField(default=list, blank=True)
    faq = models.JSONField(default=list, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    related_posts = models.ManyToManyField('self', blank=True, symmetrical=False)
    enable_comments = models.BooleanField(default=True)

    class Meta:
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['author', 'status']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
            original_slug = self.slug
            counter = 1
            while Post.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        if self.content:
            word_count = len(self.content.split())
            self.reading_time = max(1, word_count // 200)

        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()

        if not self.meta_title:
            self.meta_title = self.title[:70]
        if not self.meta_description:
            self.meta_description = self.excerpt[:160]
        if not self.og_title:
            self.og_title = self.title[:95]
        if not self.og_description:
            self.og_description = self.excerpt[:200]

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/blog/{self.slug}"

    @property
    def is_published(self):
        return self.status == 'published' and self.published_at and self.published_at <= timezone.now()

    def increment_view_count(self):
        self.view_count += 1
        self.save(update_fields=['view_count'])


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    content = models.TextField()
    is_approved = models.BooleanField(default=False)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['post', 'is_approved'])]

    def __str__(self):
        return f"{self.name or (getattr(self.user, 'username', 'ناشناس'))} - {self.post.title}"