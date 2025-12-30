from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("user","User"),
        ("employee","Employee"),
        ("admin","Admin"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

class Branch(models.Model):
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    working_hours = models.CharField(max_length=120)

    def __str__(self):
        return f"{self.name} - {self.city}"
