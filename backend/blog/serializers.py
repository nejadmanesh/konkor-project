from rest_framework import serializers
from .models import Author, Category, Tag, Post, Comment


class AuthorSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Author
        fields = ['id', 'display_name', 'bio', 'expertise', 'profile_image',
                  'twitter_url', 'linkedin_url', 'instagram_url', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'grade', 'field',
                  'meta_description', 'parent', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'post_count']

    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'post', 'parent', 'author_name', 'content',
                  'rating', 'is_approved', 'created_at', 'replies']
        read_only_fields = ['is_approved', 'created_at']

    def get_author_name(self, obj):
        return obj.name if obj.name else (getattr(obj.user, 'username', None) or 'ناشناس')

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []


class PostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'excerpt', 'featured_image',
                  'featured_image_alt', 'author', 'category', 'tags',
                  'published_at', 'reading_time', 'view_count', 'comment_count']

    def get_comment_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class PostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    related_posts = PostListSerializer(many=True, read_only=True)
    schema_markup = serializers.SerializerMethodField()
    breadcrumb = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'title', 'slug', 'subtitle', 'content', 'excerpt',
                  'featured_image', 'featured_image_alt', 'author', 'category',
                  'tags', 'published_at', 'updated_at', 'reading_time',
                  'view_count', 'meta_title', 'meta_description', 'meta_keywords',
                  'og_title', 'og_description', 'og_image', 'key_points', 'faq',
                  'comments', 'related_posts', 'enable_comments', 'schema_markup',
                  'breadcrumb']

    def get_comments(self, obj):
        if obj.enable_comments:
            comments = obj.comments.filter(is_approved=True, parent=None)
            return CommentSerializer(comments, many=True).data
        return []

    def get_schema_markup(self, obj):
        return {
            "@context": "https://schema.org",
            "@type": obj.schema_type,
            "headline": obj.title,
            "description": obj.meta_description or obj.excerpt,
            "image": obj.featured_image.url if obj.featured_image else None,
            "author": {"@type": "Person", "name": obj.author.display_name, "description": obj.author.bio},
            "publisher": {
                "@type": "Organization",
                "name": "مشاور کنکور",
                "logo": {"@type": "ImageObject", "url": "https://your-domain.com/logo.png"},
            },
            "datePublished": obj.published_at.isoformat() if obj.published_at else None,
            "dateModified": obj.updated_at.isoformat(),
            "mainEntityOfPage": {"@type": "WebPage", "@id": f"https://your-domain.com{obj.get_absolute_url()}"},
        }

    def get_breadcrumb(self, obj):
        items = [
            {"@type": "ListItem", "position": 1, "name": "خانه", "item": "https://your-domain.com"},
            {"@type": "ListItem", "position": 2, "name": "وبلاگ", "item": "https://your-domain.com/blog"},
        ]

        if obj.category:
            items.append({"@type": "ListItem", "position": 3, "name": obj.category.name,
                          "item": f"https://your-domain.com/blog/category/{obj.category.slug}"})
            items.append({"@type": "ListItem", "position": 4, "name": obj.title,
                          "item": f"https://your-domain.com{obj.get_absolute_url()}"})
        else:
            items.append({"@type": "ListItem", "position": 3, "name": obj.title,
                          "item": f"https://your-domain.com{obj.get_absolute_url()}"})

        return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items}