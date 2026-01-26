from django.contrib import admin
from .models import User, Branch, Appointment, FAQEntry, ChatMessage


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role", "is_staff", "is_superuser")
    list_filter = ("role", "is_staff", "is_superuser")
    search_fields = ("username", "email")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name", "city", "address", "open_time", "close_time", "slot_minutes")
    list_filter = ("city",)
    search_fields = ("name", "city", "address")


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "branch", "start_time", "status", "created_at")
    list_filter = ("status", "branch", "start_time")
    search_fields = ("user__username", "branch__name", "branch__address")
    ordering = ("-start_time",)


@admin.register(FAQEntry)
class FAQEntryAdmin(admin.ModelAdmin):
    list_display = ("intent", "question", "is_active", "updated_at")
    list_filter = ("intent", "is_active")
    search_fields = ("question", "answer")
    ordering = ("intent", "question")
    actions = ["activate_selected", "deactivate_selected"]

    def activate_selected(self, request, queryset):
        queryset.update(is_active=True)

    def deactivate_selected(self, request, queryset):
        queryset.update(is_active=False)

    activate_selected.short_description = "Activate selected FAQ entries"
    deactivate_selected.short_description = "Deactivate selected FAQ entries"


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "session_id", "role", "short_content")
    list_filter = ("role", "created_at")
    search_fields = ("content", "user__username", "session_id")
    ordering = ("-created_at",)

    def short_content(self, obj):
        return (obj.content[:80] + "...") if len(obj.content) > 80 else obj.content
