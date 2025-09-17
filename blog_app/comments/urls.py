from django.urls import path
from .views import (
        CommentListView,
        CommentCreateView,
        CommentDetailView
)


urlpatterns = [
    path("<int:post_id>/comments/", CommentListView.as_view(), name="comment-list"),
    path("<int:post_id>/comments/add/", CommentCreateView.as_view(), name="comment-add"),
    path("<int:post_id>/comments/<int:pk>/", CommentDetailView.as_view(), name="comment-detail"),
]