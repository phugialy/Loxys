# Deployment Guide

## Prerequisites

1. Supabase project set up with all migrations applied
2. Twilio account (for SMS)
3. Postmark account (for email, optional)
4. Vercel account (for hosting)

## Environment Variables

Set these in your deployment platform:

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Messaging Providers
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `POSTMARK_API_KEY` (optional)
- `POSTMARK_FROM_EMAIL` (optional)

### Optional
- `CRON_SECRET` - For securing cron endpoints
- `NEXT_PUBLIC_APP_URL` - Your production URL

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add all environment variables
3. Deploy

The cron job is configured in `vercel.json` to run every 5 minutes.

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

