# AGENTS.md - DIGITN Platform Developer Guide

This file provides guidance for AI agents working on the DIGITN project.

## Build, Lint, and Test Commands

```bash
# Development
npm run dev                    # Start Next.js dev server (port 3000)
cd backend && python manage.py runserver  # Start Django API (port 8000)

# Build & Production
npm run build                  # Next.js production build
npm start                     # Start production server
npm run type-check            # TypeScript validation

# Linting
npm run lint                  # Next.js linting (ESLint)

# Testing
npm run test                  # Run Vitest unit tests
npm run test:watch            # Watch mode for tests
npm run test:e2e              # Run Playwright e2e tests

# Django (Backend)
cd backend
python manage.py migrate      # Run migrations
python manage.py runserver   # Start server
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Django 4.2 + Django REST Framework (in `/backend`)
- **Database**: PostgreSQL via Django backend, SQLite (dev)
- **i18n**: next-intl v4 (Arabic RTL, French, English)

## Code Style Guidelines

### TypeScript
- Use explicit types for function parameters and return types
- Use interfaces for object shapes, types for unions
- Avoid `any`, use `unknown` when type is truly unknown
- Use `null` instead of `undefined` for optional values

### Imports
- Use absolute imports with `@/` prefix (e.g., `@/components/ui/Button`)
- Order: external → internal → relative
- Group: React → libraries → components → utilities

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `User`)

### React Patterns
- Use `'use client'` for client components
- Use Server Components by default in Next.js App Router
- Use `useCallback` for stable function references
- Use `useEffect` for side effects, clean up in return

### Error Handling
- Use try/catch with specific error messages
- Return `null` or default values for non-critical errors
- Use error boundaries for component tree failures
- Log errors appropriately (console.error in API routes)

### CSS/Tailwind
- Use CSS variables (`var(--bg-primary)`, etc.) for platform components
- Use inline styles only for marketing page (intentional)
- Use Tailwind utility classes for everything else
- Keep responsive utilities consistent (mobile-first)

### API Routes
- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Return appropriate status codes (200, 201, 400, 401, 404, 500)
- Validate input with Zod or manual checks
- Use Next.js response helpers for streaming

## Critical Project Rules (NEVER Break)

1. **NEVER mention AI model names**: No Claude, GPT, Gemini, Anthropic, etc. Use "DIGITN AI"

2. **Admin email is `contact@digitn.tech`**: Only this email can access /admin

3. **Projects NEVER expire**: Don't add expiration logic

4. **Windows compatibility**: Use `npx.cmd` instead of `npx` in bridge server

5. **Use Django API client**: All API calls go through `@/lib/api/client` or `@/lib/api/server`

## File Structure Overview

```
digitn-pro/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/       # Public landing page
│   │   ├── (platform)/        # Authenticated app (has layout with sidebar)
│   │   ├── admin/             # Admin dashboard
│   │   ├── api/               # API routes
│   │   └── auth/              # Login/signup pages
│   ├── components/            # React components
│   │   ├── chat/
│   │   ├── builder/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   ├── api/               # Django API clients (client.ts, server.ts)
│   │   └── config/            # Site and platform config
│   └── config/                 # TypeScript config (TIERS, etc.)
├── backend/                    # Django project + DB-backed API layer
│   ├── digitn/                # Django settings
│   └── digitn_api/            # Django app (models, views, urls)
└── bridge/                    # Express.js AI bridge
```

## Common Tasks

### Adding a new API endpoint
1. Create view in `backend/digitn_api/views.py`
2. Add URL in `backend/digitn_api/urls.py`
3. Create client function in `src/lib/api/client.ts` (browser) or `server.ts` (server)

### Adding a new page
1. Create route in `src/app/[path]/page.tsx`
2. Add layout if needed (platform or marketing)
3. Use existing components from `@/components`

### Modifying the sidebar
- Edit `src/components/layout/Sidebar.tsx`
- Navigation items are in `navItems` array

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_API_URL` (Django, e.g., `http://localhost:8000/api`)
- `DJANGO_API_URL` (bridge-to-Django internal URL when needed)
- `BRIDGE_SECRET`
- `BRIDGE_URL`