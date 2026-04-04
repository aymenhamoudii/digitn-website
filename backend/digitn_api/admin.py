from django.contrib import admin
from .models import (
    User,
    UsageQuota,
    Subscription,
    Conversation,
    Message,
    Project,
    BuilderChatMessage,
    BuildJob,
    TerminalEvent,
    AdminConfig,
)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "name", "tier", "role", "language", "created_at"]
    list_filter = ["tier", "role", "language"]
    search_fields = ["email", "name"]
    ordering = ["-created_at"]


@admin.register(UsageQuota)
class UsageQuotaAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "date", "requests_used", "requests_limit"]
    list_filter = ["date"]
    search_fields = ["user__email"]
    ordering = ["-date"]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "tier", "status", "provider", "current_period_end"]
    list_filter = ["tier", "status", "provider"]
    search_fields = ["user__email"]
    ordering = ["-created_at"]


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "mode", "title", "created_at"]
    list_filter = ["mode"]
    search_fields = ["user__email", "title"]
    ordering = ["-created_at"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["id", "conversation", "user", "role", "created_at"]
    list_filter = ["role"]
    search_fields = ["user__email", "content"]
    ordering = ["created_at"]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "name", "status", "type", "created_at"]
    list_filter = ["status", "type"]
    search_fields = ["user__email", "name"]
    ordering = ["-created_at"]


@admin.register(BuilderChatMessage)
class BuilderChatMessageAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "role", "event_type", "phase", "created_at"]
    list_filter = ["role", "event_type", "phase"]
    search_fields = ["project__name", "content"]
    ordering = ["sequence_number"]


@admin.register(BuildJob)
class BuildJobAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "user", "status", "stack", "retry_count", "claimed_at", "completed_at", "created_at"]
    list_filter = ["status", "stack"]
    search_fields = ["project__name", "user__email", "prompt"]
    ordering = ["-created_at"]


@admin.register(TerminalEvent)
class TerminalEventAdmin(admin.ModelAdmin):
    list_display = ["id", "project", "role", "event_type", "phase", "sequence_number", "created_at"]
    list_filter = ["event_type", "phase", "role"]
    search_fields = ["project__name", "content"]
    ordering = ["-created_at"]


@admin.register(AdminConfig)
class AdminConfigAdmin(admin.ModelAdmin):
    list_display = ["id", "key", "updated_at"]
    search_fields = ["key"]
    ordering = ["key"]
