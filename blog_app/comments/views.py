from django.shortcuts import get_object_or_404
from django.views.generic import (
    ListView, CreateView, DetailView, DeleteView)
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin

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
    template = ""
    context_object_name = "comment"


class CommentCreateView(LoginRequiredMixin, CreateView):
    """Create a new comment via AJAX"""
    model = Comment
    fields = ["content"]


    def form_valid(self, form):
        """Validate comment form"""
        post = get_object_or_404(Post, id=self.kwargs["post_id"])

        form.instance.author = self.request.user
        form.instance.post = get_object_or_404(Post, id=self.kwargs["post_id"])
        self.object = form.save()

        # Updated count
        comments_count = post.comments.count()

        comments = Comment.get_comments_for_post(self.kwargs["post_id"])

        return JsonResponse({
                "success": True,
                "comments": [
                        {
                        "id": self.object.id,
                        "user": self.object.author.username,
                        "content": self.object.content,
                        "comments_count": comments_count,
                        "created_at": self.object.created_at.strftime("%Y-%m-%d %H:%M"),
                        }
                        for c in comments
                ]
        })


    def form_invalid(self, form):
        return JsonResponse({"error": form.errors}, status=400)


# class CommentDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
#     model = Comment
#     success_url = "<int:post_id>/comments/"

#     def post(self, request, pk):
#         if not request.user.is_authenticated:
#             return HttpResponseForbidden("Login required to delete")

#         comment = get_object_or_404(Comment, pk=pk)
#         if request.user == comment.author or request.user.is_staff:
#             comment.delete()
#             return JsonResponse({"success": True, "id": pk})
#         return HttpResponseForbidden("You cannot delete this comment")