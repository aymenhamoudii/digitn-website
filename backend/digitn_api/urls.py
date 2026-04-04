from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────
    path("auth/register", views.RegisterView.as_view(), name="auth-register"),
    path("auth/login", views.LoginView.as_view(), name="auth-login"),
    path("auth/logout", views.LogoutView.as_view(), name="auth-logout"),
    path("auth/me", views.MeView.as_view(), name="auth-me"),
    path(
        "auth/change-password",
        views.ChangePasswordView.as_view(),
        name="auth-change-password",
    ),
    # ── User Profile ──────────────────────────────────────────────────────
    path("users/me", views.CurrentUserView.as_view(), name="user-me"),
    # ── Admin: Users ──────────────────────────────────────────────────────
    path("admin/users", views.AdminUserListView.as_view(), name="admin-users"),
    path(
        "admin/users/<uuid:pk>",
        views.AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
    # ── Admin: Config ─────────────────────────────────────────────────────
    path("admin/config", views.AdminConfigView.as_view(), name="admin-config"),
    path(
        "admin/config/<str:key>",
        views.AdminConfigView.as_view(),
        name="admin-config-key",
    ),
    # ── Admin: Subscriptions ──────────────────────────────────────────────
    path(
        "admin/subscriptions",
        views.SubscriptionCreateView.as_view(),
        name="admin-subscription-create",
    ),
    # ── Quotas ────────────────────────────────────────────────────────────
    path("quotas", views.QuotaView.as_view(), name="quotas"),
    path("quotas/check", views.QuotaCheckView.as_view(), name="quota-check"),
    # ── Subscriptions (user) ──────────────────────────────────────────────
    path("subscriptions", views.SubscriptionListView.as_view(), name="subscriptions"),
    # ── Conversations ─────────────────────────────────────────────────────
    path(
        "conversations",
        views.ConversationListCreateView.as_view(),
        name="conversations",
    ),
    path(
        "conversations/<uuid:pk>",
        views.ConversationDetailView.as_view(),
        name="conversation-detail",
    ),
    path(
        "conversations/<uuid:conversation_id>/messages",
        views.MessageListCreateView.as_view(),
        name="messages",
    ),
    # ── Projects ──────────────────────────────────────────────────────────
    path("projects", views.ProjectListCreateView.as_view(), name="projects"),
    path(
        "projects/<uuid:pk>", views.ProjectDetailView.as_view(), name="project-detail"
    ),
    path(
        "projects/<uuid:project_id>/messages",
        views.BuilderChatMessageListCreateView.as_view(),
        name="builder-messages",
    ),
    path(
        "projects/<uuid:project_id>/events",
        views.TerminalEventListCreateView.as_view(),
        name="terminal-events",
    ),
    path(
        "projects/<uuid:project_id>/events/bulk",
        views.TerminalEventBulkCreateView.as_view(),
        name="terminal-events-bulk",
    ),
    # ── Public Build Jobs ─────────────────────────────────────────────────
    path("jobs", views.BuildJobListCreateView.as_view(), name="jobs"),
    path("jobs/<uuid:pk>", views.BuildJobDetailView.as_view(), name="job-detail"),
    # ── Bridge Internal API (authenticated with BRIDGE_SECRET) ────────────
    path(
        "bridge/conversations",
        views.BridgeConversationView.as_view(),
        name="bridge-conversations",
    ),
    path(
        "bridge/conversations/<uuid:pk>",
        views.BridgeConversationView.as_view(),
        name="bridge-conversation-detail",
    ),
    path("bridge/messages", views.BridgeMessageView.as_view(), name="bridge-messages"),
    path(
        "bridge/projects/<uuid:pk>",
        views.BridgeProjectView.as_view(),
        name="bridge-project",
    ),
    path(
        "bridge/events", views.BridgeTerminalEventView.as_view(), name="bridge-events"
    ),
    path("bridge/users/<uuid:pk>", views.BridgeUserView.as_view(), name="bridge-user"),
    path(
        "bridge/config/<str:key>",
        views.BridgeAdminConfigView.as_view(),
        name="bridge-config",
    ),
    path(
        "bridge/jobs/reset-stuck",
        views.BridgeResetStuckJobsView.as_view(),
        name="bridge-jobs-reset-stuck",
    ),
    path("bridge/jobs", views.BridgeBuildJobQueueView.as_view(), name="bridge-jobs"),
]
