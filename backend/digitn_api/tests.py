from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from .models import BuildJob, Conversation, Project


class JobRouteTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="jobuser",
            email="jobuser@example.com",
            password="StrongPass123!",
        )
        self.other_user = get_user_model().objects.create_user(
            username="otheruser",
            email="otheruser@example.com",
            password="StrongPass123!",
        )
        self.project = Project.objects.create(
            user=self.user,
            name="Main Project",
            description="Test project",
            stack="react",
        )
        self.other_project = Project.objects.create(
            user=self.other_user,
            name="Other Project",
            description="Other test project",
            stack="django",
        )
        self.user_token = Token.objects.create(user=self.user)
        self.other_token = Token.objects.create(user=self.other_user)

    def authenticate_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.user_token.key}")

    def authenticate_other_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.other_token.key}")

    def test_public_jobs_route_enqueues_job_for_authenticated_owner(self):
        self.authenticate_user()

        response = self.client.post(
            "/api/jobs",
            {
                "project_id": str(self.project.id),
                "prompt": "Build a landing page",
                "stack": "react",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BuildJob.objects.count(), 1)
        job = BuildJob.objects.get()
        self.assertEqual(job.project, self.project)
        self.assertEqual(job.user, self.user)
        self.assertEqual(job.status, "queued")

    def test_public_job_detail_route_returns_owners_job(self):
        self.authenticate_user()
        job = BuildJob.objects.create(project=self.project, user=self.user, prompt="Build it")

        response = self.client.get(f"/api/jobs/{job.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], str(job.id))
        self.assertEqual(str(response.data["project"]), str(self.project.id))

    def test_public_job_detail_route_rejects_other_users_job(self):
        self.authenticate_user()
        other_job = BuildJob.objects.create(
            project=self.other_project,
            user=self.other_user,
            prompt="Secret job",
        )

        response = self.client.get(f"/api/jobs/{other_job.id}")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_bridge_jobs_post_enqueues_and_get_claims_oldest_queued_job(self):
        response = self.client.post(
            "/api/bridge/jobs",
            {
                "project_id": str(self.project.id),
                "user_id": str(self.user.id),
                "prompt": "Build app",
                "stack": "react",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        queued_job = BuildJob.objects.get(id=response.data["id"])
        self.assertEqual(queued_job.status, "queued")

        claim_response = self.client.get("/api/bridge/jobs")

        self.assertEqual(claim_response.status_code, status.HTTP_200_OK)
        self.assertEqual(claim_response.data["job"]["id"], str(queued_job.id))
        queued_job.refresh_from_db()
        self.assertEqual(queued_job.status, "running")
        self.assertIsNotNone(queued_job.claimed_at)

    def test_bridge_jobs_patch_updates_existing_job(self):
        job = BuildJob.objects.create(project=self.project, user=self.user, status="running")

        response = self.client.patch(
            "/api/bridge/jobs",
            {
                "job_id": str(job.id),
                "status": "completed",
                "error_message": "",
                "retry_count": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        job.refresh_from_db()
        self.assertEqual(job.status, "completed")
        self.assertEqual(job.retry_count, 1)


class AuthTests(APITestCase):
    """Tests for authentication endpoints: register, login, logout."""

    def test_register_creates_user_and_returns_token(self):
        response = self.client.post(
            "/api/auth/register",
            {
                "email": "newuser@example.com",
                "password": "StrongPass123!",
                "name": "New User",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["email"], "newuser@example.com")

    def test_register_duplicate_email_fails(self):
        get_user_model().objects.create_user(
            username="existing",
            email="dup@example.com",
            password="StrongPass123!",
        )
        response = self.client.post(
            "/api/auth/register",
            {"email": "dup@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_token(self):
        get_user_model().objects.create_user(
            username="loginuser",
            email="login@example.com",
            password="StrongPass123!",
        )
        response = self.client.post(
            "/api/auth/login",
            {"email": "login@example.com", "password": "StrongPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)

    def test_login_wrong_password_fails(self):
        get_user_model().objects.create_user(
            username="wrongpw",
            email="wrongpw@example.com",
            password="StrongPass123!",
        )
        response = self.client.post(
            "/api/auth/login",
            {"email": "wrongpw@example.com", "password": "WrongPassword!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_invalidates_token(self):
        user = get_user_model().objects.create_user(
            username="logoutuser",
            email="logout@example.com",
            password="StrongPass123!",
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.post("/api/auth/logout")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Token.objects.filter(user=user).exists())


class QuotaCheckTests(APITestCase):
    """Tests for the quota check endpoint."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="quotauser",
            email="quota@example.com",
            password="StrongPass123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_quota_check_allowed(self):
        response = self.client.post(
            "/api/quotas/check",
            {"type": "chat"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["allowed"])
        self.assertEqual(response.data["used"], 1)

    def test_quota_check_invalid_type_rejected(self):
        response = self.client.post(
            "/api/quotas/check",
            {"type": "invalid"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_quota_check_unauthenticated_rejected(self):
        self.client.credentials()  # clear auth
        response = self.client.post(
            "/api/quotas/check",
            {"type": "chat"},
            format="json",
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class ProjectCRUDTests(APITestCase):
    """Tests for project create and list endpoints."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="projuser",
            email="proj@example.com",
            password="StrongPass123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_create_project(self):
        response = self.client.post(
            "/api/projects",
            {
                "name": "My Project",
                "description": "A test project",
                "stack": "react",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "My Project")
        self.assertEqual(response.data["status"], "analyzing")

    def test_list_projects_returns_own_only(self):
        Project.objects.create(user=self.user, name="P1", stack="react")
        other_user = get_user_model().objects.create_user(
            username="other", email="other@example.com", password="StrongPass123!"
        )
        Project.objects.create(user=other_user, name="P2", stack="django")

        response = self.client.get("/api/projects")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        project_names = [p["name"] for p in response.data["results"]]
        self.assertIn("P1", project_names)
        self.assertNotIn("P2", project_names)

    def test_create_project_unauthenticated_rejected(self):
        self.client.credentials()
        response = self.client.post(
            "/api/projects",
            {"name": "Fail", "stack": "react"},
            format="json",
        )
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class ConversationListTests(APITestCase):
    """Tests for conversation list endpoint."""

    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="convuser",
            email="conv@example.com",
            password="StrongPass123!",
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

    def test_list_conversations_empty(self):
        response = self.client.get("/api/conversations")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    def test_list_conversations_returns_own_only(self):
        Conversation.objects.create(user=self.user, mode="chat", title="My Chat")
        other_user = get_user_model().objects.create_user(
            username="convother", email="convother@example.com", password="StrongPass123!"
        )
        Conversation.objects.create(user=other_user, mode="chat", title="Other Chat")

        response = self.client.get("/api/conversations")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [c["title"] for c in response.data["results"]]
        self.assertIn("My Chat", titles)
        self.assertNotIn("Other Chat", titles)

    def test_list_conversations_filter_by_mode(self):
        Conversation.objects.create(user=self.user, mode="chat", title="Chat One")
        Conversation.objects.create(user=self.user, mode="builder", title="Build One")

        response = self.client.get("/api/conversations?mode=builder")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [c["title"] for c in response.data["results"]]
        self.assertIn("Build One", titles)
        self.assertNotIn("Chat One", titles)
