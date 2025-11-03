import os
from .models import Post
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver


# Auto-delete old pic if updated with a new one
@receiver(pre_save, sender=Post)
def auto_del_old_pics_on_change(sender, instance, **kwargs):
    if not instance.pk:  # New post, delete nothing
        return

    try:
        old_pics = Post.objects.get(pk=instance.pk).pics
    except Post.DoesNotExist:
        return

    new_pics = instance.pics

    if old_pics and old_pics != new_pics:
        if os.path.isfile(old_pics.path):
            os.remove(old_pics.path)


# Auto-delete pics from filesystem if post is deleted
@receiver(post_delete, sender=Post)
def auto_del_pics_on_post_del(sender, instance, **kwargs):
    if instance.pics and os.path.isfile(instance.pics.path):
        os.remove(instance.pics.path)