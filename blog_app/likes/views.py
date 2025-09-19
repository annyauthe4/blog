from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views import View
from django.contrib.contenttypes.models import ContentType

from blog.models import Post
from .models import Like


class ToggleLikeView(View):
    """Toggle a like for a post (no login required)."""

    def _get_identifier(self, request):
        """Get session key or IP as identifier."""
        if not request.session.session_key:
            request.session.create()
        return request.session.session_key

    def post(self, request, post_id, *args, **kwargs):
        post = get_object_or_404(Post, id=post_id)
        identifier = self._get_identifier(request)
        content_type = ContentType.objects.get_for_model(Post)

        like, created = Like.objects.get_or_create(
            content_type=content_type,
            object_id=post.id,
            session_key=identifier,
            defaults={"ip_address": request.META.get("REMOTE_ADDR")},
        )

        if not created:  # already liked → unlike
            like.delete()
            liked = False
        else:
            liked = True

        count = Like.objects.filter(content_type=content_type, object_id=post.id).count()

        return JsonResponse({"liked": liked, "count": count})
