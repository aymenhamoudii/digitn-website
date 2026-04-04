from django.contrib import admin
from django.urls import path, include

from digitn_api.health import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("digitn_api.urls")),
    path("api/", include("digitn_api.urls")),  # backward compat (unversioned)
    path("health/", health_check),
]
