from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404

from blog.models import Post
from .models import Like


class ToggleLikeAPIView(APIView):
    """Toggle like on a post (JWT required)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id, *args, **kwargs):
        post = get_object_or_404(Post, id=post_id)

        # ✅ Check if user already liked the post
        like = Like.objects.filter(user=request.user, post=post).first()

        if like:
            like.delete()
            liked = False
        else:
            Like.objects.create(user=request.user, post=post)
            liked = True

        likes_count = Like.objects.filter(post=post).count()

        return Response(
            {
                "liked": liked,
                "likes_count": likes_count,
                "post_id": post.id,
            },
            status=status.HTTP_200_OK,
        )
