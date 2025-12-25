# Routes Overview

## Landing & Public Routes

### `/` (app/page.tsx)
- **Purpose**: Landing page for unauthenticated users
- **Auth**: Redirects to `/dashboard` if authenticated
- **Components**: 
  - Navbar
  - HeroSection
  - StorySection
  - StatsSection
  - FeatureShowcase
  - TestimonialCarousel
  - CTA sections

### `/auth/login` (app/auth/login/page.tsx)
- **Purpose**: User login page
- **Auth**: Redirects to `/dashboard` if authenticated

### `/auth/signup` (app/auth/signup/page.tsx)
- **Purpose**: User signup page with account creation
- **Auth**: Redirects to `/dashboard` if authenticated

### `/join/[token]` (app/join/[token]/page.tsx)
- **Purpose**: Public join page for customers to opt-in
- **Auth**: Public route (no auth required)

### `/unsubscribe` (app/unsubscribe/page.tsx)
- **Purpose**: Unsubscribe page for customers
- **Auth**: Public route (no auth required)

---

## Dashboard Routes (Protected)

All routes under `/dashboard` require authentication (handled by layout.tsx)

### `/dashboard` (app/dashboard/page.tsx)
- **Purpose**: Main dashboard with stats overview
- **Auth**: Required

### `/dashboard/customers` (app/dashboard/customers/page.tsx)
- **Purpose**: Customer list/roster
- **Features**: List, search, archive customers

### `/dashboard/customers/new` (app/dashboard/customers/new/page.tsx)
- **Purpose**: Add new customer form

### `/dashboard/customers/[id]/edit` (app/dashboard/customers/[id]/edit/page.tsx)
- **Purpose**: Edit existing customer

### `/dashboard/campaigns` (app/dashboard/campaigns/page.tsx)
- **Purpose**: Campaign list with stats

### `/dashboard/campaigns/new` (app/dashboard/campaigns/new/page.tsx)
- **Purpose**: Create new campaign

### `/dashboard/join-tokens` (app/dashboard/join-tokens/page.tsx)
- **Purpose**: Manage join tokens (QR codes, SMS keywords)

### `/dashboard/settings` (app/dashboard/settings/page.tsx)
- **Purpose**: Business settings (account name, timezone)

### `/dashboard/profile` (app/dashboard/profile/page.tsx)
- **Purpose**: User profile page

### `/dashboard/profile/edit` (app/dashboard/profile/edit/page.tsx)
- **Purpose**: Edit user profile

### `/dashboard/profile/password` (app/dashboard/profile/password/page.tsx)
- **Purpose**: Change password

---

## API Routes

### Authentication & Account
- `GET /api/account` - Get account info
- `PATCH /api/account` - Update account
- `POST /api/auth/create-account` - Create account after signup

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `PATCH /api/customers/[id]` - Update customer
- `POST /api/customers/check-duplicate` - Check for duplicate customers

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign details
- `POST /api/campaigns/[id]/send` - Send campaign

### Join Tokens
- `GET /api/join-tokens` - List join tokens
- `POST /api/join-tokens` - Create join token
- `GET /api/join-tokens/[id]` - Get join token
- `PATCH /api/join-tokens/[id]` - Update join token

### Background Jobs
- `POST /api/cron/process-deliveries` - Process delivery queue (cron)
- `POST /api/trigger/process-deliveries` - Process deliveries (Trigger.dev)

### Public
- `POST /api/unsubscribe` - Handle unsubscribe requests

---

## Edge Functions (Supabase)

### `join-web`
- **Purpose**: Public join endpoint handler
- **Location**: `supabase/functions/join-web/index.ts`

### `join-sms-webhook`
- **Purpose**: SMS keyword handler (JOIN/STOP)
- **Location**: `supabase/functions/join-sms-webhook/index.ts`

---

## Middleware

### `middleware.ts`
- **Purpose**: Route protection and auth checks
- **Protected routes**: All `/dashboard/*` routes
- **Public routes**: `/`, `/auth/*`, `/join/*`, `/unsubscribe`

---

## Route Protection Summary

1. **Public (no auth)**: `/`, `/auth/*`, `/join/*`, `/unsubscribe`
2. **Protected (auth required)**: All `/dashboard/*` routes
3. **API routes**: Protected via middleware/session checks
4. **Auto-redirects**: 
   - Authenticated users on `/` → `/dashboard`
   - Unauthenticated users on `/dashboard/*` → `/auth/login`
