from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from PIL import Image
from django.urls import reverse
from django_bleach.models import BleachField


class Post(models.Model):
    title = models.CharField(max_length=100)
    content = BleachField()
    pics = models.ImageField(upload_to='post_pics', blank=True, null=True)
    date_posted = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, default=1)

    def __str__(self):
        return self.title


    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.pics:
            img = Image.open(self.pics.path)

            if img.height > 350 or img.width > 700:
                output_size = (650, 350)
                img.thumbnail(output_size)
                img.save(self.pics.path)


    def get_absolute_url(self):
        return reverse('post-detail', kwargs={'pk': self.pk})
