from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from comments.models import Comment
from likes.models import Like
from .models import Post
from .serializers import PostSerializer
from .permissions import IsAuthorOrReadOnly


class PostViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Posts.
    Public can read, authenticated users can write.
    """
    queryset = Post.objects.all().order_by('-date_posted')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]

    def perform_create(self, serializer):
        """Assign logged-in user as author."""
        serializer.save(author=self.request.user)

    def get_queryset(self):
        """Filter posts by username."""
        username = self.request.query_params.get('username')
        if username:
            user = get_object_or_404(User, username=username)
            return Post.objects.filter(author=user).order_by('-date_posted')
        return super().get_queryset()

    def retrieve(self, request, *args, **kwargs):
        """Retrieve a single post with comments and like info."""
        post = self.get_object()

        # comments always public
        comments = Comment.objects.filter(post=post).order_by('-created_at')

        # determine if user liked (JWT)
        if request.user.is_authenticated:
            has_liked = Like.objects.filter(user=request.user, post=post).exists()
        else:
            has_liked = False

        serializer = self.get_serializer(post)

        return Response({
            "post": serializer.data,
            "comments": [
                {
                    "id": c.id,
                    "author": c.author.username,
                    "text": c.text,
                    "created_at": c.created_at,
                }
                for c in comments
            ],
            "comments_count": comments.count(),
            "user_liked": has_liked,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def user_posts(self, request):
        """List posts by the authenticated user."""
        posts = Post.objects.filter(author=request.user).order_by('-date_posted')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
