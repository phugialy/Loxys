# Deployment Guide

## Prerequisites

1. Supabase project set up with all migrations applied
2. Twilio account (for SMS)
3. Postmark account (for email, optional)
4. Trigger.dev account (for background jobs - **no cron limits!**)
5. Hosting platform (see options below)

## Environment Variables

Set these in your deployment platform:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TRIGGER_PROJECT_REF` - Your Trigger.dev project reference
- `TRIGGER_SECRET_KEY` - Your Trigger.dev secret key (production key, not dev)
- `TRIGGER_API_URL` - Usually `https://api.trigger.dev`

### Messaging Providers
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `POSTMARK_API_KEY` (optional)
- `POSTMARK_FROM_EMAIL` (optional)

### Recommended
- `NEXT_PUBLIC_APP_URL` - Your production URL (e.g., `https://yourdomain.com`)
  - **Join URLs**: Will automatically use your domain when viewed in the browser (no config needed)
  - **Unsubscribe links**: Required for email unsubscribe links to work correctly
  - **Server-side rendering**: Used as fallback when generating URLs on the server

### Optional
- `CRON_SECRET` - For securing API endpoints (if using external cron services)

## Hosting Options

**Note:** This app uses Trigger.dev for scheduled jobs, so you're **not limited to Vercel**. You can use any hosting platform that supports Next.js.

### Option 1: Cloudflare Pages (Recommended)
- **Pros:** Free tier, unlimited requests, great performance, no cron limits needed
- **Setup:**
  1. Connect GitHub repository
  2. Add environment variables
  3. Deploy

### Option 2: Railway
- **Pros:** Simple deployment, good for full-stack apps, reasonable pricing
- **Setup:**
  1. Connect GitHub repository
  2. Add environment variables
  3. Deploy

### Option 3: Render
- **Pros:** Free tier available, easy setup
- **Setup:**
  1. Connect GitHub repository
  2. Add environment variables
  3. Deploy

### Option 4: Vercel (if you prefer)
- **Pros:** Excellent Next.js integration, great DX
- **Note:** Vercel cron has limits, but we use Trigger.dev instead, so this is fine
- **Setup:**
  1. Connect GitHub repository
  2. Add environment variables
  3. **Vercel will auto-detect:**
     - Framework: Next.js (from `vercel.json`)
     - Package Manager: pnpm (from `packageManager` field and `pnpm-lock.yaml`)
     - Build Command: `pnpm build` (configured in `vercel.json`)
     - Install Command: `pnpm install` (configured in `vercel.json`)
  4. Deploy
  5. **Note:** `vercel.json` is configured to use pnpm (not npm default)

### Option 5: Self-Hosted (VPS)
- Use any VPS provider (DigitalOcean, Linode, etc.)
- Run `pnpm build && pnpm start`
- Set up reverse proxy (nginx/Caddy)

## Trigger.dev Setup (Required for Background Jobs)

**Important:** This app uses Trigger.dev for scheduled delivery processing, which has **no cron job limits** unlike Vercel.

### 1. Deploy Tasks
```bash
pnpm deploy:trigger
```

### 2. Configure Scheduled Task
1. Go to [Trigger.dev Dashboard](https://cloud.trigger.dev)
2. Navigate to your project
3. Go to **Schedules** section
4. Create a new schedule:
   - **Task:** `scheduled-process-deliveries`
   - **Cron:** `*/5 * * * *` (every 5 minutes)
   - **Status:** Active

This will automatically process queued message deliveries every 5 minutes with no limits!

### 3. Verify
- Check Trigger.dev dashboard for task runs
- Monitor delivery processing in your app logs

## Supabase Edge Functions

Edge Functions are already deployed via Supabase MCP:
- `join-web`
- `join-sms-webhook`
- `provider-status-webhook`

### Webhook Configuration

After deployment, configure webhook URLs in your providers:

**Twilio:**
- SMS webhook: `https://[your-project].supabase.co/functions/v1/join-sms-webhook`
- Status webhook: `https://[your-project].supabase.co/functions/v1/provider-status-webhook`

**Postmark:**
- Webhook URL: `https://[your-project].supabase.co/functions/v1/provider-status-webhook`

## Testing

1. Test signup flow
2. Create a join token
3. Test public join page
4. Create a campaign
5. Test sending (with test credentials)
6. Verify scheduled delivery processing in Trigger.dev dashboard

