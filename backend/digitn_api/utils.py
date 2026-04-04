from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that always returns JSON with a consistent
    { "error": "..." } shape on errors.
    """
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        # Flatten common DRF error shapes into a single "error" string
        if isinstance(errors, dict):
            if "detail" in errors:
                errors = {"error": str(errors["detail"])}
            else:
                # Keep field-level validation errors as-is but wrap top level
                errors = {"error": errors}
        elif isinstance(errors, list):
            errors = {"error": errors}
        response.data = errors

    return response
