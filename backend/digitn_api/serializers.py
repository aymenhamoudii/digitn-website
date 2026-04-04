from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "avatar_url",
            "tier",
            "role",
            "language",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "tier",
            "role",
            "created_at",
            "updated_at",
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin views that need access to sensitive payment fields."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "avatar_url",
            "tier",
            "role",
            "language",
            "stripe_customer_id",
            "konnect_customer_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "email",
            "tier",
            "role",
            "stripe_customer_id",
            "konnect_customer_id",
            "created_at",
            "updated_at",
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["name", "avatar_url", "language"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = ["email", "password", "name"]

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        from django.conf import settings
        from django.db import IntegrityError

        admin_email = getattr(settings, "ADMIN_EMAIL", "contact@digitn.tech")
        email = validated_data["email"]
        username = email.split("@")[0]

        # Ensure username is unique
        base_username = username
        counter = 1

        while True:
            try:
                user = User.objects.create_user(
                    email=email,
                    username=username,
                    password=validated_data["password"],
                    name=validated_data.get("name", ""),
                    tier="free",
                    role="admin" if email == admin_email else "user",
                )
                return user
            except IntegrityError:
                username = f"{base_username}{counter}"
                counter += 1


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value


class UsageQuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageQuota
        fields = ["id", "date", "requests_used", "requests_limit"]
        read_only_fields = ["id"]


class SubscriptionSerializer(serializers.ModelSerializer):
    tier = serializers.ChoiceField(choices=Subscription.TIER_CHOICES)
    status = serializers.ChoiceField(choices=Subscription.STATUS_CHOICES)
    provider = serializers.ChoiceField(choices=Subscription.PROVIDER_CHOICES)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "tier",
            "status",
            "provider",
            "provider_subscription_id",
            "current_period_end",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "user", "mode", "title", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "role", "content", "created_at"]
        read_only_fields = ["id", "conversation", "created_at"]


class ProjectSerializer(serializers.ModelSerializer):
    # Expose current_phase, current_task, plan_text from analysis_result JSON
    current_phase = serializers.SerializerMethodField()
    current_task = serializers.SerializerMethodField()
    plan_text = serializers.SerializerMethodField()

    def get_current_phase(self, obj):
        if obj.analysis_result and isinstance(obj.analysis_result, dict):
            return obj.analysis_result.get("current_phase")
        return None

    def get_current_task(self, obj):
        if obj.analysis_result and isinstance(obj.analysis_result, dict):
            return obj.analysis_result.get("current_task")
        return None

    def get_plan_text(self, obj):
        if obj.analysis_result and isinstance(obj.analysis_result, dict):
            return obj.analysis_result.get("plan_text")
        return None

    class Meta:
        model = Project
        fields = [
            "id",
            "user",
            "conversation",
            "name",
            "description",
            "stack",
            "type",
            "plan_json",
            "status",
            "serve_path",
            "public_url",
            "zip_path",
            "last_accessed_at",
            "analysis_result",
            "questionnaire_answers",
            "source_text",
            "presentation_json",
            "current_slide",
            "total_slides",
            "current_phase",
            "current_task",
            "plan_text",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]


class BuilderChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuilderChatMessage
        fields = [
            "id",
            "project",
            "role",
            "content",
            "event_type",
            "task_name",
            "phase",
            "sequence_number",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "project", "created_at"]


class BuildJobSerializer(serializers.ModelSerializer):
    project_id = serializers.UUIDField(source="project.id", read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)

    class Meta:
        model = BuildJob
        fields = [
            "id",
            "project",
            "project_id",
            "user",
            "user_id",
            "status",
            "prompt",
            "stack",
            "tier",
            "retry_count",
            "max_retries",
            "error_message",
            "claimed_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "project_id",
            "user",
            "user_id",
            "created_at",
            "updated_at",
        ]


# NOTE: TerminalEventBulkCreateView bypasses serializer validation for bulk inserts.
# If input validation is needed on bulk event creation, use TerminalEventSerializer
# with many=True and is_valid() before saving.
class TerminalEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerminalEvent
        fields = [
            "id",
            "project",
            "role",
            "content",
            "event_type",
            "task_name",
            "phase",
            "metadata",
            "sequence_number",
            "created_at",
        ]
        read_only_fields = ["id", "project", "created_at"]


class AdminConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminConfig
        fields = ["id", "key", "value", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
