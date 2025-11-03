from django.urls import path
from .views import ToggleLikeAPIView

urlpatterns = [
    path('posts/<int:post_id>/toggle_like/', ToggleLikeAPIView.as_view(), name='toggle_like'),
]