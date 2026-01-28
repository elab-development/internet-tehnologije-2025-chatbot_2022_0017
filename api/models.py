from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from datetime import time


class User(AbstractUser):
    ROLE_CHOICES = (
        ("user", "User"),
        ("employee", "Employee"),
        ("admin", "Admin"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")

    branch = models.ForeignKey(
        "Branch",            
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="employees",
    )

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Branch(models.Model):
    name = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    # Standardno 08:00–16:00
    open_time = models.TimeField(default=time(8, 0))
    close_time = models.TimeField(default=time(16, 0))

    # Fiksni slotovi (npr. 30 minuta)
    slot_minutes = models.PositiveIntegerField(default=30)

    def __str__(self):
        return f"{self.name} - {self.city}"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ("booked", "Booked"),
        ("canceled", "Canceled"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="appointments"
    )
    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="appointments"
    )
    start_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="booked")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["branch", "start_time", "status"]),
            models.Index(fields=["user", "start_time", "status"]),
        ]

    def __str__(self):
        return f"{self.user} @ {self.branch} - {self.start_time} ({self.status})"


# ----------------------------
# Chatbot: FAQ entries u bazi
# ----------------------------
class FAQEntry(models.Model):
    intent = models.CharField(max_length=50, default="faq", db_index=True)
    question = models.CharField(max_length=255)
    answer = models.TextField()
    link = models.URLField(blank=True, default="")
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["intent", "is_active"]),
        ]

    def __str__(self):
        return f"[{self.intent}] {self.question}"


# ----------------------------
# Chatbot: pamćenje poruka
# ----------------------------
class ChatMessage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="chat_messages"
    )
    session_id = models.CharField(max_length=64, db_index=True)
    role = models.CharField(max_length=10)  # "user" | "assistant"
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["session_id", "created_at"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.session_id} [{self.role}] {self.created_at}"
