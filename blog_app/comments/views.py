# comments/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Count

from .models import Comment
from blog.models import Post
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    """
    A ViewSet to list, create, retrieve, update, and delete comments.
    - Lists all comments for a post.
    - Creates new comments for authenticated users.
    - Supports nested replies.
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        queryset = Comment.objects.filter(post_id=post_id)

        # Annotate each comment with interaction counts (likes + replies)
        queryset = queryset.annotate(
            interaction_count=Count('replies', distinct=True)
        ).order_by('-interaction_count', '-created_at')

        return queryset

    def perform_create(self, serializer):
        """Assign author and post automatically."""
        post = get_object_or_404(Post, id=self.kwargs.get('post_id'))
        serializer.save(author=self.request.user, post=post)

    def create(self, request, *args, **kwargs):
        """Custom JSON response for comment creation (AJAX-friendly)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        post = get_object_or_404(Post, id=self.kwargs.get('post_id'))
        comments_count = post.comments.count()

        comments = Comment.objects.filter(post=post).order_by("-created_at")
        comments_data = CommentSerializer(comments, many=True).data

        return Response({
            "success": True,
            "comments_count": comments_count,
            "comments": comments_data
        }, status=status.HTTP_201_CREATED)