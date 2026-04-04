import os
import sys
import json

BASE = r"C:\Users\Administrator\Downloads\Telegram Desktop\digitn-pro-website-slim\digitn-pro\backend"
sys.path.insert(0, BASE)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "digitn.settings")
os.environ["BRIDGE_SECRET"] = "test-bridge-secret"

import django

django.setup()

from rest_framework.test import APIClient
from digitn_api.models import User

password = "StrongPass123!"
user_email = "api-smoke@example.com"
admin_email = "contact@digitn.tech"
user = User.objects.get(email=user_email)
admin = User.objects.filter(email=admin_email).first()
if not admin:
    admin = User.objects.create_user(
        username="contact",
        email=admin_email,
        password=password,
        name="Admin",
        role="admin",
    )
else:
    admin.role = "admin"
    admin.set_password(password)
    admin.save()

results = []


def body_of(response):
    try:
        return response.json()
    except Exception:
        return response.content.decode("utf-8", errors="ignore")[:400]


def record(name, method, path, response):
    results.append(
        {
            "name": name,
            "method": method,
            "path": path,
            "status": response.status_code,
            "body": body_of(response),
        }
    )


client = APIClient()
login = client.post("/api/auth/login", {"email": user_email, "password": password}, format="json")
record("login_user", "POST", "/api/auth/login", login)
login_body = body_of(login)
user_token = login_body.get("token") if isinstance(login_body, dict) else None
client.credentials(HTTP_AUTHORIZATION=f"Token {user_token}")

conv_resp = client.post("/api/conversations", {"mode": "chat", "title": "Smoke Conversation"}, format="json")
record("conversation_create", "POST", "/api/conversations", conv_resp)
conv_body = body_of(conv_resp)
conv_id = conv_body.get("id") if isinstance(conv_body, dict) else None
if conv_id:
    record(
        "message_create",
        "POST",
        f"/api/conversations/{conv_id}/messages",
        client.post(f"/api/conversations/{conv_id}/messages", {"role": "user", "content": "hello"}, format="json"),
    )
    record(
        "message_list",
        "GET",
        f"/api/conversations/{conv_id}/messages",
        client.get(f"/api/conversations/{conv_id}/messages"),
    )

project_resp = client.post("/api/projects", {"name": "Smoke Project", "description": "check api", "stack": "react"}, format="json")
record("project_create", "POST", "/api/projects", project_resp)
project_body = body_of(project_resp)
project_id = project_body.get("id") if isinstance(project_body, dict) else None
if project_id:
    record(
        "project_patch",
        "PATCH",
        f"/api/projects/{project_id}",
        client.patch(f"/api/projects/{project_id}", {"status": "planning"}, format="json"),
    )
    record(
        "builder_message_create",
        "POST",
        f"/api/projects/{project_id}/messages",
        client.post(f"/api/projects/{project_id}/messages", {"role": "assistant", "content": "working"}, format="json"),
    )
    record(
        "terminal_event_create",
        "POST",
        f"/api/projects/{project_id}/events",
        client.post(f"/api/projects/{project_id}/events", {"role": "assistant", "content": "event"}, format="json"),
    )
    record(
        "terminal_event_list",
        "GET",
        f"/api/projects/{project_id}/events",
        client.get(f"/api/projects/{project_id}/events"),
    )
    record(
        "terminal_event_bulk",
        "POST",
        f"/api/projects/{project_id}/events/bulk",
        client.post(
            f"/api/projects/{project_id}/events/bulk",
            {"events": [{"role": "assistant", "content": "bulk1"}, {"role": "assistant", "content": "bulk2"}]},
            format="json",
        ),
    )

admin_client = APIClient()
admin_login = admin_client.post("/api/auth/login", {"email": admin_email, "password": password}, format="json")
record("login_admin", "POST", "/api/auth/login", admin_login)
admin_body = body_of(admin_login)
admin_token = admin_body.get("token") if isinstance(admin_body, dict) else None
admin_client.credentials(HTTP_AUTHORIZATION=f"Token {admin_token}")
record("admin_users_list", "GET", "/api/admin/users", admin_client.get("/api/admin/users"))
record("admin_user_detail", "GET", f"/api/admin/users/{user.id}", admin_client.get(f"/api/admin/users/{user.id}"))
record("admin_config_get_missing", "GET", "/api/admin/config/test_key", admin_client.get("/api/admin/config/test_key"))
record("admin_config_put", "PUT", "/api/admin/config/test_key", admin_client.put("/api/admin/config/test_key", {"value": {"x": 1}}, format="json"))
record(
    "admin_subscription_create",
    "POST",
    "/api/admin/subscriptions",
    admin_client.post("/api/admin/subscriptions", {"user_id": str(user.id), "tier": "pro", "provider": "manual"}, format="json"),
)

bridge_client = APIClient()
record("bridge_user_unauthorized", "GET", f"/api/bridge/users/{user.id}", bridge_client.get(f"/api/bridge/users/{user.id}"))
bridge_client.credentials(HTTP_AUTHORIZATION="Bearer test-bridge-secret")
record("bridge_user_ok", "GET", f"/api/bridge/users/{user.id}", bridge_client.get(f"/api/bridge/users/{user.id}"))
bridge_conv = bridge_client.post("/api/bridge/conversations", {"user_id": str(user.id), "mode": "chat", "title": "Bridge Conv"}, format="json")
record("bridge_conversation_create", "POST", "/api/bridge/conversations", bridge_conv)
bridge_conv_body = body_of(bridge_conv)
bridge_conv_id = bridge_conv_body.get("id") if isinstance(bridge_conv_body, dict) else None
if bridge_conv_id:
    record(
        "bridge_message_create",
        "POST",
        "/api/bridge/messages",
        bridge_client.post(
            "/api/bridge/messages",
            {"conversation_id": bridge_conv_id, "user_id": str(user.id), "role": "assistant", "content": "bridge msg"},
            format="json",
        ),
    )
if project_id:
    record("bridge_project_get", "GET", f"/api/bridge/projects/{project_id}", bridge_client.get(f"/api/bridge/projects/{project_id}"))
    record(
        "bridge_project_patch",
        "PATCH",
        f"/api/bridge/projects/{project_id}",
        bridge_client.patch(
            f"/api/bridge/projects/{project_id}",
            {"status": "building", "current_phase": "building", "current_task": "smoke"},
            format="json",
        ),
    )
    record(
        "bridge_event_create",
        "POST",
        "/api/bridge/events",
        bridge_client.post("/api/bridge/events", {"project_id": project_id, "content": "bridge event"}, format="json"),
    )
    build_job = client.post("/api/jobs", {"project_id": project_id, "prompt": "build it", "stack": "react"}, format="json")
    record("build_job_create", "POST", "/api/jobs", build_job)
    build_job_body = body_of(build_job)
    job_id = build_job_body.get("id") if isinstance(build_job_body, dict) else None
    if job_id:
        record("build_job_get", "GET", f"/api/jobs/{job_id}", client.get(f"/api/jobs/{job_id}"))
        record(
            "build_job_patch_as_user",
            "PATCH",
            f"/api/jobs/{job_id}",
            client.patch(f"/api/jobs/{job_id}", {"status": "failed", "error_message": "x"}, format="json"),
        )
    record("bridge_jobs_claim", "POST", "/api/bridge/jobs", bridge_client.post("/api/bridge/jobs", {}, format="json"))
    record("bridge_jobs_list", "GET", "/api/bridge/jobs", bridge_client.get("/api/bridge/jobs"))

print(json.dumps(results, indent=2, default=str))
