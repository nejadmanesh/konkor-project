from rest_framework import viewsets, filters, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Author, Category, Tag, Post
from .serializers import (
    AuthorSerializer, CategorySerializer, TagSerializer,
    PostListSerializer, PostDetailSerializer, CommentSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class PostViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Post.objects.filter(status='published', published_at__lte=timezone.now())
    serializer_class = PostListSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'category__grade', 'category__field', 'tags__slug', 'author__id']
    search_fields = ['title', 'content', 'excerpt', 'meta_keywords']
    ordering_fields = ['published_at', 'view_count', 'reading_time']
    ordering = ['-published_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.increment_view_count()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def popular(self, request):
        posts = self.queryset.order_by('-view_count')[:10]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        posts = self.queryset.order_by('-published_at')[:10]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, slug=None):
        post = self.get_object()
        if not post.enable_comments:
            return Response({'error': 'امکان ثبت نظر برای این مقاله غیرفعال است.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(post=post, user=request.user if request.user.is_authenticated else None)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    pagination_class = None

    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        category = self.get_object()
        posts = Post.objects.filter(category=category, status='published', published_at__lte=timezone.now()).order_by('-published_at')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = PostListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    pagination_class = None

    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        tag = self.get_object()
        posts = Post.objects.filter(tags=tag, status='published', published_at__lte=timezone.now()).order_by('-published_at')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = PostListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AuthorViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    pagination_class = None

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        author = self.get_object()
        posts = Post.objects.filter(author=author, status='published', published_at__lte=timezone.now()).order_by('-published_at')
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(posts, request)
        serializer = PostListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)