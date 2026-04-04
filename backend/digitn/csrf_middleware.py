from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import functools


def skip_csrf(view_func):
    @functools.wraps(view_func)
    def wrapped(request, *args, **kwargs):
        request._dont_enforce_csrf_checks = True
        return view_func(request, *args, **kwargs)

    return wrapped


class CSRFMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only skip CSRF for API endpoints that use Token authentication
        # (i.e., requests with an Authorization header). Session/cookie-based
        # requests must still be protected by CSRF.
        if request.path.startswith("/api/"):
            if request.META.get("HTTP_AUTHORIZATION"):
                request._dont_enforce_csrf_checks = True

        return self.get_response(request)
