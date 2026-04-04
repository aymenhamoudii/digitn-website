# Builder Queue / Worker Architecture

This directory contains the groundwork for evolving the builder
from in-process execution to a proper queue/worker model.

## Current status
The active builder still uses in-process execution via direct-builder.js.
These worker files are prepared but not yet wired into the main flow.

## Planned flow
1. POST /build/start → enqueue job in `build_jobs` table
2. Worker polls for pending jobs
3. Worker executes build (same logic as direct-builder.js)
4. Status/logs stored in DB
5. SSE reads from DB instead of in-memory stream

## Migration steps
1. Ensure the Django backend exposes the build job endpoints and model fields required by the worker flow
2. Wire build route to enqueue instead of direct execute
3. Start worker process alongside bridge
4. Update SSE route to read persisted terminal events from Django-backed storage
