import logging
import os

from django.conf import settings
from django.contrib.auth import authenticate, login, logout as django_logout
from django.db import models, transaction
from django.db.models import F
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, generics, throttling as rest_framework_throttling
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination

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
from .serializers import (
    UserSerializer,
    UserUpdateSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    UsageQuotaSerializer,
    SubscriptionSerializer,
    ConversationSerializer,
    MessageSerializer,
    ProjectSerializer,
    BuilderChatMessageSerializer,
    BuildJobSerializer,
    TerminalEventSerializer,
    AdminConfigSerializer,
)

logger = logging.getLogger("digitn_api")


# ──────────────────────────────────────────────
# Pagination
# ──────────────────────────────────────────────
class StandardPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


# ──────────────────────────────────────────────
# Permissions
# ──────────────────────────────────────────────
class IsAdminUserCustom(IsAuthenticated):
    """Allows access only to users with role='admin'."""

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and getattr(request.user, "role", None) == "admin"
        )


# ──────────────────────────────────────────────
# Auth Views
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            logger.info("New user registered: %s", user.email)
            data = UserSerializer(user).data
            data["token"] = token.key
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"error": "This account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        token, _ = Token.objects.get_or_create(user=user)
        logger.info("User logged in: %s", user.email)
        data = UserSerializer(user).data
        data["token"] = token.key
        return Response(data)


@method_decorator(csrf_exempt, name="dispatch")
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Delete the token to invalidate it server-side
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        # Clear the session cookie as well
        django_logout(request)
        logger.info("User logged out: %s", request.user.email)
        return Response({"message": "Logged out successfully."})


class MeView(APIView):
    """Returns the current authenticated user. Same as /users/me."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class CurrentUserView(APIView):
    """Get or update the current authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class ChangePasswordView(APIView):
    """Allows a logged-in user to change their own password."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()
        # Keep session alive after password change
        login(request, user)
        return Response({"message": "Password changed successfully."})


# ──────────────────────────────────────────────
# Admin User Views
# ──────────────────────────────────────────────
class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserCustom]
    pagination_class = StandardPagination


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUserCustom]

    def get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_user(pk)
        if user is None:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(UserSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_user(pk)
        if user is None:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        tier = request.data.get("tier")
        role = request.data.get("role")

        if tier is not None:
            if tier not in ["free", "pro", "plus"]:
                return Response(
                    {"error": "Invalid tier. Must be 'free', 'pro', or 'plus'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.tier = tier
        if role is not None:
            if role not in ["user", "admin"]:
                return Response(
                    {"error": "Invalid role. Must be 'user' or 'admin'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.role = role

        user.save()
        logger.info(
            "Admin %s updated user %s (tier=%s, role=%s)",
            request.user.email,
            user.email,
            tier,
            role,
        )
        return Response(UserSerializer(user).data)


# ──────────────────────────────────────────────
# Quota Views
# ──────────────────────────────────────────────
class QuotaView(APIView):
    """Returns today's quota usage summary for the current user."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().strftime("%Y-%m-%d")
        user = request.user
        tier_config = settings.TIERS.get(user.tier, settings.TIERS["free"])

        chat_date = f"{today}-chat"
        builder_date = f"{today}-builder"

        chat_quota = UsageQuota.objects.filter(user=user, date=chat_date).first()
        builder_quota = UsageQuota.objects.filter(user=user, date=builder_date).first()

        chat_used = chat_quota.requests_used if chat_quota else 0
        chat_limit = tier_config["chat_requests_per_day"]
        builder_used = builder_quota.requests_used if builder_quota else 0
        builder_limit = tier_config["builder_requests_per_day"]

        return Response(
            {
                "chat": {
                    "used": chat_used,
                    "limit": chat_limit,
                    "remaining": max(0, chat_limit - chat_used),
                },
                "builder": {
                    "used": builder_used,
                    "limit": builder_limit,
                    "remaining": max(0, builder_limit - builder_used),
                },
                "tier": user.tier,
            }
        )


@method_decorator(csrf_exempt, name="dispatch")
class QuotaCheckView(APIView):
    """Checks if quota is available and increments usage by 1."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        quota_type = request.data.get("type", "chat")
        if quota_type not in ["chat", "builder"]:
            return Response(
                {"error": "Invalid quota type. Must be 'chat' or 'builder'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        tier_config = settings.TIERS.get(user.tier, settings.TIERS["free"])
        today = timezone.now().strftime("%Y-%m-%d")
        date_key = f"{today}-{quota_type}"

        if quota_type == "chat":
            limit = tier_config["chat_requests_per_day"]
        else:
            limit = tier_config["builder_requests_per_day"]

        with transaction.atomic():
            quota, _ = UsageQuota.objects.select_for_update().get_or_create(
                user=user,
                date=date_key,
                defaults={"requests_used": 0, "requests_limit": limit},
            )

            if quota.requests_used >= limit:
                return Response(
                    {
                        "allowed": False,
                        "error": f"Daily {quota_type} quota exceeded.",
                        "used": quota.requests_used,
                        "limit": limit,
                        "remaining": 0,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

            UsageQuota.objects.filter(pk=quota.pk).update(
                requests_used=F("requests_used") + 1
            )
            new_used = quota.requests_used + 1

        return Response(
            {
                "allowed": True,
                "used": new_used,
                "limit": limit,
                "remaining": limit - new_used,
            }
        )


# ──────────────────────────────────────────────
# Subscription Views
# ──────────────────────────────────────────────
class SubscriptionListView(APIView):
    """List current user's subscriptions."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        subs = Subscription.objects.filter(user=request.user).order_by("-created_at")
        serializer = SubscriptionSerializer(subs, many=True)
        return Response(serializer.data)


@method_decorator(csrf_exempt, name="dispatch")
class SubscriptionCreateView(APIView):
    """Admin creates/upgrades a subscription for a user."""

    permission_classes = [IsAdminUserCustom]

    def post(self, request):
        user_id = request.data.get("user_id")
        tier = request.data.get("tier")
        provider = request.data.get("provider", "manual")
        provider_subscription_id = request.data.get("provider_subscription_id", "")
        current_period_end = request.data.get("current_period_end")

        if not user_id or not tier:
            return Response(
                {"error": "user_id and tier are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if tier not in ["pro", "plus"]:
            return Response(
                {"error": "Invalid tier. Must be 'pro' or 'plus'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        sub = Subscription.objects.create(
            user=user,
            tier=tier,
            provider=provider,
            provider_subscription_id=provider_subscription_id or "",
            current_period_end=current_period_end,
            status="active",
        )
        # Update user tier
        user.tier = tier
        user.save()

        return Response(
            SubscriptionSerializer(sub).data, status=status.HTTP_201_CREATED
        )


# ──────────────────────────────────────────────
# Conversation Views
# ──────────────────────────────────────────────
class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Conversation.objects.filter(user=self.request.user)
        mode = self.request.query_params.get("mode")
        if mode in ("chat", "builder"):
            qs = qs.filter(mode=mode)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


# ──────────────────────────────────────────────
# Message Views
# ──────────────────────────────────────────────
class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        conversation_id = self.kwargs.get("conversation_id")
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__user=self.request.user,
        )

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get("conversation_id")
        try:
            conversation = Conversation.objects.get(
                id=conversation_id, user=self.request.user
            )
        except Conversation.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Conversation not found.")
        serializer.save(conversation=conversation, user=self.request.user)


# ──────────────────────────────────────────────
# Project Views
# ──────────────────────────────────────────────
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Project.objects.filter(user=self.request.user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)


# ──────────────────────────────────────────────
# Builder Chat Message Views
# ──────────────────────────────────────────────
class BuilderChatMessageListCreateView(generics.ListCreateAPIView):
    serializer_class = BuilderChatMessageSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        project_id = self.kwargs.get("project_id")
        return BuilderChatMessage.objects.filter(
            project_id=project_id,
            project__user=self.request.user,
        )

    def perform_create(self, serializer):
        project_id = self.kwargs.get("project_id")
        try:
            project = Project.objects.get(id=project_id, user=self.request.user)
        except Project.DoesNotExist:
            from rest_framework.exceptions import NotFound

            raise NotFound("Project not found.")
        serializer.save(project=project)


# ──────────────────────────────────────────────
# Admin Config Views
# ──────────────────────────────────────────────
@method_decorator(csrf_exempt, name="dispatch")
class AdminConfigView(APIView):
    permission_classes = [IsAdminUserCustom]

    def get(self, request, key=None):
        if key:
            try:
                config = AdminConfig.objects.get(key=key)
                return Response(AdminConfigSerializer(config).data)
            except AdminConfig.DoesNotExist:
                # Return empty config instead of 404 — lets frontend use defaults
                return Response(
                    {
                        "id": None,
                        "key": key,
                        "value": None,
                        "created_at": None,
                        "updated_at": None,
                    }
                )
        configs = AdminConfig.objects.all()
        return Response(AdminConfigSerializer(configs, many=True).data)

    def post(self, request):
        key = request.data.get("key")
        value = request.data.get("value")
        if not key:
            return Response(
                {"error": "key is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        config, _ = AdminConfig.objects.update_or_create(
            key=key, defaults={"value": value}
        )
        return Response(AdminConfigSerializer(config).data)

    def put(self, request, key):
        value = request.data.get("value")
        config, _ = AdminConfig.objects.update_or_create(
            key=key, defaults={"value": value}
        )
        return Response(AdminConfigSerializer(config).data)


# ──────────────────────────────────────────────
# Build Job Views (used by bridge)
# ──────────────────────────────────────────────
class BuildJobListCreateView(APIView):
    """Bridge calls this to enqueue or list build jobs."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get("status")
        qs = BuildJob.objects.select_related('project', 'user').filter(user=request.user)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(BuildJobSerializer(qs, many=True).data)

    def post(self, request):
        project_id = request.data.get("project_id")
        try:
            project = Project.objects.get(id=project_id, user=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )
        job = BuildJob.objects.create(
            project=project,
            user=request.user,
            prompt=request.data.get("prompt", ""),
            stack=request.data.get("stack", ""),
            status="queued",
        )
        return Response(BuildJobSerializer(job).data, status=status.HTTP_201_CREATED)


class BuildJobDetailView(APIView):
    """Bridge calls this to update job status."""

    permission_classes = [IsAuthenticated]

    def get_job(self, request, pk):
        try:
            return BuildJob.objects.get(pk=pk, user=request.user)
        except BuildJob.DoesNotExist:
            return None

    def get(self, request, pk):
        job = self.get_job(request, pk)
        if not job:
            return Response(
                {"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND
            )
        return Response(BuildJobSerializer(job).data)

    def patch(self, request, pk):
        job = self.get_job(request, pk)
        if not job:
            return Response(
                {"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND
            )
        for field in [
            "status",
            "error_message",
            "retry_count",
            "claimed_at",
            "completed_at",
        ]:
            if field in request.data:
                setattr(job, field, request.data[field])
        job.save()
        return Response(BuildJobSerializer(job).data)


# ────────────────���─────────────────────────────
# Terminal Event Views (used by bridge)
# ───────────────────���──────────────────────────
class TerminalEventListCreateView(APIView):
    """Bridge saves terminal events here. Frontend streams them."""

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        events = TerminalEvent.objects.filter(
            project_id=project_id,
            project__user=request.user,
        )
        after_seq = request.query_params.get("after")
        if after_seq:
            events = events.filter(sequence_number__gt=int(after_seq))
        return Response(TerminalEventSerializer(events, many=True).data)

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, user=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():
            # Lock existing events for this project to get a consistent sequence number
            last = (
                TerminalEvent.objects.select_for_update()
                .filter(project=project)
                .order_by("-sequence_number")
                .first()
            )
            seq = (last.sequence_number + 1) if last else 0

            event = TerminalEvent.objects.create(
                project=project,
                role=request.data.get("role", "assistant"),
                content=request.data.get("content", ""),
                event_type=request.data.get("event_type", "message"),
                task_name=request.data.get("task_name"),
                phase=request.data.get("phase"),
                metadata=request.data.get("metadata"),
                sequence_number=seq,
            )
        return Response(
            TerminalEventSerializer(event).data, status=status.HTTP_201_CREATED
        )


class TerminalEventBulkCreateView(APIView):
    """Bridge saves multiple terminal events at once."""

    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, user=request.user)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        events_data = request.data.get("events", [])

        with transaction.atomic():
            # Lock existing events for this project to get a consistent sequence number
            last = (
                TerminalEvent.objects.select_for_update()
                .filter(project=project)
                .order_by("-sequence_number")
                .first()
            )
            seq = (last.sequence_number + 1) if last else 0

            events = []
            for i, ev in enumerate(events_data):
                events.append(
                    TerminalEvent(
                        project=project,
                        role=ev.get("role", "assistant"),
                        content=ev.get("content", ""),
                        event_type=ev.get("event_type", "message"),
                        task_name=ev.get("task_name"),
                        phase=ev.get("phase"),
                        metadata=ev.get("metadata"),
                        sequence_number=seq + i,
                    )
                )
            TerminalEvent.objects.bulk_create(events)
        return Response({"created": len(events)}, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Bridge-specific internal views
# These endpoints are called by the bridge server (not browser)
# Authentication: Token from BRIDGE_SECRET env var
# ──────────────────────────────────────────────
class BridgePermission(IsAuthenticated):
    """Accept bridge requests authenticated with Token OR BRIDGE_SECRET header."""

    def has_permission(self, request, view):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if bridge_secret and auth_header == f"Bearer {bridge_secret}":
            return True
        return super().has_permission(request, view)


class BridgeThrottle(rest_framework_throttling.SimpleRateThrottle):
    """High-limit throttle for internal bridge-to-Django calls."""

    scope = "bridge"

    def get_cache_key(self, request, view):
        # Key by IP — bridge runs on a fixed server IP so this is stable
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class BridgeConversationView(APIView):
    """Bridge creates/updates conversations."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def post(self, request):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        user_id = request.data.get("user_id")
        if not user_id:
            return Response(
                {"error": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        mode = request.data.get("mode", "chat")
        title = request.data.get("title")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        conv = Conversation.objects.create(user=user, mode=mode, title=title)
        return Response(
            ConversationSerializer(conv).data, status=status.HTTP_201_CREATED
        )

    def patch(self, request, pk):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            conv = Conversation.objects.get(id=pk)
        except Conversation.DoesNotExist:
            return Response(
                {"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND
            )

        title = request.data.get("title")
        if title:
            conv.title = title
            conv.save()
        return Response(ConversationSerializer(conv).data)


class BridgeMessageView(APIView):
    """Bridge saves chat messages."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def post(self, request):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        conversation_id = request.data.get("conversation_id")
        user_id = request.data.get("user_id")
        role = request.data.get("role", "assistant")
        content = request.data.get("content", "")

        try:
            conversation = Conversation.objects.get(id=conversation_id)
            user = User.objects.get(id=user_id)
        except (Conversation.DoesNotExist, User.DoesNotExist) as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        msg = Message.objects.create(
            conversation=conversation,
            user=user,
            role=role,
            content=content,
        )
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class BridgeProjectView(APIView):
    """Bridge updates project status, phase, task."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def get(self, request, pk):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            project = Project.objects.get(id=pk)
            return Response(ProjectSerializer(project).data)
        except Project.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request, pk):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            project = Project.objects.get(id=pk)
        except Project.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        # Fields that map directly to model columns
        direct_fields = [
            "status",
            "stack",
            "serve_path",
            "public_url",
            "zip_path",
            "plan_json",
            "analysis_result",
            "last_accessed_at",
            "source_text",
            "presentation_json",
            "current_slide",
            "total_slides",
        ]
        # Fields stored inside analysis_result JSON blob
        json_fields = ["current_phase", "current_task", "plan_text"]

        for field in direct_fields:
            if field in request.data:
                setattr(project, field, request.data[field])

        # Merge json_fields into analysis_result without clobbering existing keys
        json_updates = {k: request.data[k] for k in json_fields if k in request.data}
        if json_updates:
            if not project.analysis_result or not isinstance(
                project.analysis_result, dict
            ):
                project.analysis_result = {}
            project.analysis_result.update(json_updates)

        project.save()
        return Response(ProjectSerializer(project).data)


class BridgeTerminalEventView(APIView):
    """Bridge saves/reads terminal events (replaces Supabase RPC save_terminal_event)."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def get(self, request):
        """Fetch terminal events for a project (for chat history replay)."""
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response(
                {"error": "project_id required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        page_size = int(request.query_params.get("page_size", 20))
        events = TerminalEvent.objects.filter(project=project).order_by(
            "-sequence_number"
        )[:page_size]
        return Response(
            TerminalEventSerializer(list(reversed(list(events))), many=True).data
        )

    def post(self, request):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        project_id = request.data.get("project_id")
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response(
                {"error": "Project not found."}, status=status.HTTP_404_NOT_FOUND
            )

        import time

        event = None
        for attempt in range(5):
            try:
                with transaction.atomic():
                    agg = TerminalEvent.objects.filter(project=project).aggregate(
                        max_seq=models.Max("sequence_number")
                    )
                    seq = (agg["max_seq"] + 1) if agg["max_seq"] is not None else 0
                    event = TerminalEvent.objects.create(
                        project=project,
                        role=request.data.get("role", "assistant"),
                        content=request.data.get("content", ""),
                        event_type=request.data.get("event_type", "message"),
                        task_name=request.data.get("task_name"),
                        phase=request.data.get("phase"),
                        metadata=request.data.get("metadata"),
                        sequence_number=seq,
                    )
                break
            except Exception as exc:
                if "database is locked" in str(exc) and attempt < 4:
                    time.sleep(0.1 * (attempt + 1))
                    continue
                raise
        return Response(
            {"id": str(event.id), "sequence_number": event.sequence_number},
            status=status.HTTP_201_CREATED,
        )


class BridgeUserView(APIView):
    """Bridge gets user info (tier etc) by ID."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def get(self, request, pk):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            user = User.objects.get(id=pk)
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )


class BridgeAdminConfigView(APIView):
    """Bridge reads admin config (models, bridge settings)."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def get(self, request, key):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            config = AdminConfig.objects.get(key=key)
            return Response({"key": config.key, "value": config.value})
        except AdminConfig.DoesNotExist:
            return Response({"key": key, "value": None})


class BridgeResetStuckJobsView(APIView):
    """Reset jobs stuck in 'running' state back to 'queued'."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False
        return auth_header == f"Bearer {bridge_secret}"

    def post(self, request):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        import datetime

        cutoff = timezone.now() - datetime.timedelta(minutes=10)
        stuck = BuildJob.objects.filter(
            status="running",
            claimed_at__lt=cutoff,
        )
        count = stuck.count()
        stuck.update(status="queued", claimed_at=None)
        logger.info("Reset %d stuck build jobs to queued", count)
        return Response({"reset": count})


class BridgeBuildJobQueueView(APIView):
    """Bridge enqueues a build job without user auth (uses BRIDGE_SECRET)."""

    permission_classes = [AllowAny]
    throttle_classes = [BridgeThrottle]

    def _check_bridge_auth(self, request):
        bridge_secret = (
            settings.BRIDGE_SECRET
            if hasattr(settings, "BRIDGE_SECRET")
            else os.environ.get("BRIDGE_SECRET", "")
        )
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if not bridge_secret:
            return False  # Fail closed
        return auth_header == f"Bearer {bridge_secret}"

    def post(self, request):
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        project_id = request.data.get("project_id")
        user_id = request.data.get("user_id")
        if not project_id or not user_id:
            return Response(
                {"error": "project_id and user_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        prompt = request.data.get("prompt", "")
        stack = request.data.get("stack", "")
        tier = request.data.get("tier", "free")

        try:
            project = Project.objects.get(id=project_id)
            user = User.objects.get(id=user_id)
        except (Project.DoesNotExist, User.DoesNotExist) as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        job = BuildJob.objects.create(
            project=project,
            user=user,
            prompt=prompt,
            stack=stack,
            tier=tier,
            status="queued",
        )
        return Response(BuildJobSerializer(job).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        """Claim next queued job (atomic)."""
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        with transaction.atomic():
            job = (
                BuildJob.objects.select_for_update(skip_locked=True)
                .filter(
                    status="queued",
                    retry_count__lt=models.F("max_retries"),
                )
                .order_by("created_at")
                .first()
            )

            if not job:
                return Response({"job": None})

            job.status = "running"
            job.claimed_at = timezone.now()
            job.save()

        return Response({"job": BuildJobSerializer(job).data})

    def patch(self, request):
        """Update a build job status."""
        if not self._check_bridge_auth(request):
            return Response(
                {"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED
            )

        job_id = request.data.get("job_id")
        try:
            job = BuildJob.objects.get(id=job_id)
        except BuildJob.DoesNotExist:
            return Response(
                {"error": "Job not found."}, status=status.HTTP_404_NOT_FOUND
            )

        for field in ["status", "error_message", "retry_count", "completed_at"]:
            if field in request.data:
                setattr(job, field, request.data[field])
        job.save()
        return Response(BuildJobSerializer(job).data)
