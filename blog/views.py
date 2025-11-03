from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from comments.models import Comment
from likes.models import Like
from .models import Post
from .serializers import PostSerializer
from .permissions import IsAuthorOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    """
    Handles CRUD operations for Posts.
    Now uses IsAuthorOrReadOnly permission for updates/deletes.
    """
    queryset = Post.objects.all().order_by('-date_posted')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        """Automatically assign the logged-in user as the author."""
        serializer.save(author=self.request.user)

    def get_queryset(self):
        """Allow filtering posts by username."""
        username = self.request.query_params.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            return Post.objects.filter(author=user).order_by('-date_posted')
        return super().get_queryset()

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single post with comments and like info."""
        post = self.get_object()
        content_type = ContentType.objects.get_for_model(Post)
        session_key = request.session.session_key or request.META.get("REMOTE_ADDR")

        comments = Comment.objects.filter(post=post).order_by('-created_at')
        has_liked = Like.objects.filter(
            content_type=content_type,
            object_id=post.id,
            session_key=session_key
        ).exists()

        serializer = self.get_serializer(post)
        return Response({
            "post": serializer.data,
            "comments": [
                {"id": c.id, "author": c.author.username, "text": c.text, "created_at": c.created_at}
                for c in comments
            ],
            "comments_count": comments.count(),
            "has_liked": has_liked,
        })

    @action(detail=False, methods=['get'])
    def user_posts(self, request):
        """List all posts by the authenticated user."""
        posts = Post.objects.filter(author=request.user).order_by('-date_posted')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
