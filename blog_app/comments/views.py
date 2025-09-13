from django.shortcuts import get_object_or_404
from django.views.generic import ListView, CreateView, DetailView
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.decorators.csrf import csrf_exempt
django.utils.decorators import method_decorator

from blog.models import Post
from .models import Comment


class CommentListView(ListView):
    """List comments ordered by interactions (likes + replies)"""
    model = Comment
    template_name = "comments/comments_list.html"
    context_object_name = "comments"


    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        post = get_object_or_404(Post, id=post_id)

        # Rank comments by interactions
        return (
            post.comments.all()
            .annotate(
                interaction_count=(
                    models.Count("likes", distinct=True) +
                    models.Count("replies", distinct=True)
                )
            )
            .order_by("-interaction_count", "-created_at")
        )


class CommentDetailView(DetailView):
    model = Comment


@method_decorator(csrf_exempt, name="dispatch")
class CommentCreateView(LoginRequiredMixin, CreateView):
    """Create a new comment via AJAX"""
    model = Comment
    fields = ["content"]


    def form_valid(self, form):
        """Validate comment form"""
        post_id = self.kwargs["post_id"]
        post = get_object_or_404(Post, id=post_id)
        form.instance.author = self.request.user
        form.instance.post = post
        self.object = form.save()

        return JsonResponse({
            "id": self.object.id,
            "author": self.object.author.username,
            "content": self.object.content,
            "created_at": self.object.created_at.strftime("%Y-%m-%d %H:%M"),
        })


    def form_invalid(self, form):
        return JsonResponse({"error": form.errors}, status=400)