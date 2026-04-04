import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    TIER_CHOICES = [
        ("free", "Free"),
        ("pro", "Pro"),
        ("plus", "Plus"),
    ]
    ROLE_CHOICES = [
        ("user", "User"),
        ("admin", "Admin"),
    ]
    LANGUAGE_CHOICES = [
        ("ar", "Arabic"),
        ("fr", "French"),
        ("en", "English"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    tier = models.CharField(max_length=10, choices=TIER_CHOICES, default="free")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="fr")
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    konnect_customer_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email as the login identifier
    USERNAME_FIELD = "email"
    # username is still required by AbstractUser, but we don't use it for login
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class UsageQuota(models.Model):
    """
    Tracks daily API usage per user per quota type.
    The `date` field uses the format "YYYY-MM-DD-{type}" (e.g. "2026-03-26-chat")
    so that chat and builder quotas are tracked independently.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="usage_quotas"
    )
    date = models.CharField(max_length=50)  # "YYYY-MM-DD-chat" or "YYYY-MM-DD-builder"
    requests_used = models.IntegerField(default=0)
    requests_limit = models.IntegerField(default=50)

    class Meta:
        db_table = "usage_quotas"
        unique_together = [["user", "date"]]
        indexes = [
            models.Index(fields=["user", "date"]),
        ]

    def __str__(self):
        return f"{self.user.email} | {self.date} | {self.requests_used}/{self.requests_limit}"


class Subscription(models.Model):
    TIER_CHOICES = [
        ("pro", "Pro"),
        ("plus", "Plus"),
    ]
    STATUS_CHOICES = [
        ("active", "Active"),
        ("cancelled", "Cancelled"),
        ("past_due", "Past Due"),
    ]
    PROVIDER_CHOICES = [
        ("stripe", "Stripe"),
        ("konnect", "Konnect"),
        ("manual", "Manual"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="subscriptions"
    )
    tier = models.CharField(max_length=10, choices=TIER_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    provider = models.CharField(
        max_length=20, choices=PROVIDER_CHOICES, default="manual"
    )
    provider_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    current_period_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscriptions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.user.email} | {self.tier} | {self.status}"


class Conversation(models.Model):
    MODE_CHOICES = [
        ("chat", "Chat"),
        ("builder", "Builder"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="conversations"
    )
    mode = models.CharField(max_length=10, choices=MODE_CHOICES)
    title = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "conversations"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.user.email} | {self.mode} | {self.title or self.id}"


class Message(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "messages"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["conversation", "created_at"]),
        ]

    def __str__(self):
        return f"{self.role} | {self.content[:50]}"


class Project(models.Model):
    TYPE_CHOICES = [
        ("website", "Website"),
        ("webapp", "Web App"),
        ("ecommerce", "E-commerce"),
        ("api", "API"),
        ("presentation", "Presentation"),
    ]
    STATUS_CHOICES = [
        ("analyzing", "Analyzing"),
        ("planning", "Planning"),
        ("building", "Building"),
        ("ready", "Ready"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="projects",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    stack = models.CharField(max_length=100, blank=True, null=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, blank=True, null=True)
    plan_json = models.JSONField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="analyzing"
    )
    serve_path = models.CharField(max_length=500, blank=True, null=True)
    public_url = models.CharField(
        max_length=500, blank=True, null=True
    )  # CharField not URLField — bridge uses relative paths like /projects/{id}
    zip_path = models.CharField(max_length=500, blank=True, null=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)
    analysis_result = models.JSONField(blank=True, null=True)
    questionnaire_answers = models.TextField(blank=True, null=True)
    # Presentation-specific fields
    source_text = models.TextField(
        blank=True, null=True
    )  # Extracted text from uploaded file or user description
    presentation_json = models.JSONField(
        blank=True, null=True
    )  # Full slide structure JSON
    current_slide = models.IntegerField(
        blank=True, null=True
    )  # Currently building slide index
    total_slides = models.IntegerField(blank=True, null=True)  # Total slides planned
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "projects"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "status"]),
        ]

    def __str__(self):
        return f"{self.name} | {self.status} | {self.user.email}"


class BuilderChatMessage(models.Model):
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]
    EVENT_TYPE_CHOICES = [
        ("file_created", "File Created"),
        ("file_updated", "File Updated"),
        ("message", "Message"),
        ("error", "Error"),
        ("phase", "Phase"),
        ("phase_change", "Phase Change"),
        ("plan_start", "Plan Start"),
        ("plan_chunk", "Plan Chunk"),
        ("plan_end", "Plan End"),
        ("status", "Status"),
        ("signature", "Signature"),
        ("complete", "Complete"),
    ]
    PHASE_CHOICES = [
        ("analyzing", "Analyzing"),
        ("planning", "Planning"),
        ("building", "Building"),
        ("ready", "Ready"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="chat_messages"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    event_type = models.CharField(
        max_length=20, choices=EVENT_TYPE_CHOICES, default="message"
    )
    task_name = models.CharField(max_length=255, blank=True, null=True)
    phase = models.CharField(
        max_length=20, choices=PHASE_CHOICES, blank=True, null=True
    )
    sequence_number = models.IntegerField(default=0)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "builder_chat_messages"
        ordering = ["sequence_number"]
        indexes = [
            models.Index(fields=["project", "sequence_number"]),
        ]

    def __str__(self):
        return f"{self.role} | {self.event_type} | {self.content[:50]}"


class BuildJob(models.Model):
    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="build_jobs"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="build_jobs")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    prompt = models.TextField(blank=True, null=True)
    stack = models.CharField(max_length=100, blank=True, null=True)
    tier = models.CharField(
        max_length=10, default="free"
    )  # user's tier at time of job creation
    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)
    error_message = models.TextField(blank=True, null=True)
    claimed_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "build_jobs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["project", "status"]),
        ]

    def __str__(self):
        return f"{self.project.name} | {self.status}"


class TerminalEvent(models.Model):
    """Stores build/chat terminal output events for streaming."""

    EVENT_TYPE_CHOICES = [
        ("file_created", "File Created"),
        ("file_updated", "File Updated"),
        ("message", "Message"),
        ("error", "Error"),
        ("phase", "Phase"),
        ("phase_change", "Phase Change"),
        ("plan_start", "Plan Start"),
        ("plan_chunk", "Plan Chunk"),
        ("plan_end", "Plan End"),
        ("status", "Status"),
        ("signature", "Signature"),
        ("complete", "Complete"),
        ("slide_start", "Slide Start"),
        ("slide_content", "Slide Content"),
        ("slide_complete", "Slide Complete"),
        ("palette", "Palette"),
    ]
    PHASE_CHOICES = [
        ("analyzing", "Analyzing"),
        ("planning", "Planning"),
        ("building", "Building"),
        ("ready", "Ready"),
    ]
    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
        ("system", "System"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="terminal_events"
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="assistant")
    content = models.TextField()
    event_type = models.CharField(
        max_length=20, choices=EVENT_TYPE_CHOICES, default="message"
    )
    task_name = models.CharField(max_length=255, blank=True, null=True)
    phase = models.CharField(
        max_length=20, choices=PHASE_CHOICES, blank=True, null=True
    )
    metadata = models.JSONField(blank=True, null=True)
    sequence_number = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "terminal_events"
        ordering = ["sequence_number", "created_at"]
        indexes = [
            models.Index(fields=["project", "sequence_number"]),
        ]

    def __str__(self):
        return f"{self.event_type} | {self.content[:50]}"


class AdminConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "admin_config"
        ordering = ["key"]

    def __str__(self):
        return self.key
