import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

# NOTE: Always use django.utils.timezone.now() instead of datetime.now()
# to ensure timezone-aware datetimes throughout the project.

BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-secret-key-change-in-production")
DEBUG = os.environ.get("DEBUG", "False") == "True"

# Prevent running production with the default dev secret key
if not DEBUG and SECRET_KEY == "dev-secret-key-change-in-production":
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY must be set to a unique, unpredictable value in production."
    )

ALLOWED_HOSTS_ENV = os.environ.get("ALLOWED_HOSTS", "")
ALLOWED_HOSTS = (
    [h.strip() for h in ALLOWED_HOSTS_ENV.split(",") if h.strip()]
    if ALLOWED_HOSTS_ENV
    else ["localhost", "127.0.0.1", "0.0.0.0"]
)
# In DEBUG mode, restrict to known local development hosts
if DEBUG:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# ──────────────────────────────────────────────
# Application
# ──────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "digitn_api",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "digitn.csrf_middleware.CSRFMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "digitn.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "digitn.wsgi.application"

# ──────────────────────────────────────────────
# Database
# Auto-detects DATABASE_URL for PostgreSQL/Supabase,
# falls back to SQLite for local development.
# ──────────────────────────────────────────────
DATABASE_URL = os.environ.get("DATABASE_URL", "")

if DATABASE_URL:
    import re

    # Parse DATABASE_URL: postgres://user:pass@host:port/dbname
    match = re.match(
        r"postgres(?:ql)?://([^:]+):([^@]*)@([^:/]+):?(\d+)?/(.+)", DATABASE_URL
    )
    if match:
        db_user, db_pass, db_host, db_port, db_name = match.groups()
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.postgresql",
                "NAME": db_name,
                "USER": db_user,
                "PASSWORD": db_pass,
                "HOST": db_host,
                "PORT": db_port or "5432",
                "OPTIONS": {
                    "connect_timeout": 10,
                },
                "CONN_MAX_AGE": 60,
            }
        }
    else:
        raise ValueError(f"Invalid DATABASE_URL format: {DATABASE_URL}")
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
            "OPTIONS": {
                # WAL mode — eliminates 'database is locked' under concurrent load
                # SQLite3 module uses 'timeout', not 'init_command' (that's MySQL)
                "timeout": 20,
            },
        }
    }

# ──────────────────────────────────────────────
# Auth & Password Validation
# ──────────────────────────────────────────────
AUTH_USER_MODEL = "digitn_api.User"

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ──────────────────────────────────────────────
# REST Framework
# ──────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "30/minute",
        "user": "120/minute",
        "bridge": "600/minute",
    },
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "EXCEPTION_HANDLER": "digitn_api.utils.custom_exception_handler",
}

# ──────────────────────────────────────────────
# CORS & CSRF
# ──────────────────────────────────────────────
_cors_origins_env = os.environ.get("CORS_ALLOWED_ORIGINS", "")
if _cors_origins_env:
    CORS_ALLOWED_ORIGINS = [
        o.strip() for o in _cors_origins_env.split(",") if o.strip()
    ]
    CORS_ALLOW_ALL_ORIGINS = False
else:
    # In DEBUG/dev, allow all
    CORS_ALLOW_ALL_ORIGINS = DEBUG

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    *[
        o.strip()
        for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",")
        if o.strip()
    ],
]

# Cross-origin cookie settings (frontend on :3000, backend on :8000)
# SameSite=None is required for cross-origin requests with credentials
SESSION_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = not DEBUG  # Must be False in dev (no HTTPS)
SESSION_COOKIE_NAME = "digitn_sessionid"

CSRF_COOKIE_SAMESITE = "None" if not DEBUG else "Lax"
CSRF_COOKIE_HTTPONLY = False  # Must be readable by JS for CSRF token
CSRF_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_NAME = "digitn_csrftoken"

# In dev, allow cross-origin session cookies
if DEBUG:
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SAMESITE = "Lax"
    CSRF_COOKIE_SECURE = False

# ──────────────────────────────────────────────
# Internationalization
# ──────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────
# Static Files
# ──────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ──────────────────────────────────────────────
# App Settings
# ──────────────────────────────────────────────
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "contact@digitn.tech")
BRIDGE_SECRET = os.environ.get("BRIDGE_SECRET", "")

TIERS = {
    "free": {
        "name": "DIGITN FAST",
        "chat_requests_per_day": 50,
        "builder_requests_per_day": 10,
        "max_active_projects": 1,
    },
    "pro": {
        "name": "DIGITN PRO",
        "chat_requests_per_day": 300,
        "builder_requests_per_day": 50,
        "max_active_projects": 3,
    },
    "plus": {
        "name": "DIGITN PLUS",
        "chat_requests_per_day": 9999,
        "builder_requests_per_day": 9999,
        "max_active_projects": 9999,
    },
}

# ──────────────────────────────────────────────
# Logging
# ──────────────────────────────────────────────
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.environ.get("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
        "digitn_api": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}

# ──────────────────────────────────────────────
# Production Security Headers
# ──────────────────────────────────────────────
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = "DENY"

# ──────────────────────────────────────────────
# Startup Environment Validation
# ──────────────────────────────────────────────
if not DEBUG:
    _missing = []
    if not os.environ.get("DJANGO_SECRET_KEY"):
        _missing.append("DJANGO_SECRET_KEY")
    if not os.environ.get("DATABASE_URL"):
        _missing.append("DATABASE_URL")
    if _missing:
        raise ImproperlyConfigured(
            f"Missing required environment variables for production: {', '.join(_missing)}"
        )
