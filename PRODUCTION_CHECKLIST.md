# Production Readiness Checklist

## ✅ Build Status
- [x] TypeScript compilation passes
- [x] Next.js build succeeds
- [x] No build errors or warnings (except deprecation notices)
- [x] Production optimizations configured

## 🔧 Configuration

### Environment Variables (Required)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `TRIGGER_PROJECT_REF` - Trigger.dev project reference
- [ ] `TRIGGER_SECRET_KEY` - Trigger.dev production secret key (NOT dev key)
- [ ] `TRIGGER_API_URL` - Usually `https://api.trigger.dev`

### Environment Variables (Messaging)
- [ ] `TWILIO_ACCOUNT_SID` - Twilio account SID
- [ ] `TWILIO_AUTH_TOKEN` - Twilio auth token
- [ ] `TWILIO_PHONE_NUMBER` - Twilio phone number (E.164 format)
- [ ] `POSTMARK_API_KEY` - Postmark API key (optional)
- [ ] `POSTMARK_FROM_EMAIL` - Postmark from email (optional)

### Environment Variables (Recommended)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (e.g., `https://yourdomain.com`)
  - Required for email unsubscribe links
  - Used as fallback for server-side URL generation

### Environment Variables (Optional)
- [ ] `CRON_SECRET` - For securing API endpoints (if needed)

## 🚀 Deployment Steps

### 1. Database
- [x] All migrations applied to production Supabase
- [x] RLS policies enabled and tested
- [x] Edge Functions deployed

### 2. Trigger.dev
- [ ] Deploy tasks: `pnpm deploy:trigger`
- [ ] Configure schedule in Trigger.dev dashboard:
  - Task: `scheduled-process-deliveries`
  - Cron: `*/5 * * * *` (every 5 minutes)
  - Status: Active
- [ ] Verify task runs in dashboard

### 3. Hosting Platform
- [ ] Connect GitHub repository
- [ ] Add all environment variables
- [ ] Configure build command: `pnpm build`
- [ ] Configure start command: `pnpm start` (if needed)
- [ ] Set Node.js version: 18+ (check `package.json` for exact version)
- [ ] Deploy

### 4. Post-Deployment
- [ ] Test signup flow
- [ ] Test login flow
- [ ] Test join link creation
- [ ] Test public join page
- [ ] Test customer management
- [ ] Test campaign creation
- [ ] Test message sending (with test credentials first)
- [ ] Verify Trigger.dev scheduled task is running
- [ ] Check application logs for errors

## 🔒 Security

### Headers (Configured in `next.config.ts`)
- [x] X-DNS-Prefetch-Control
- [x] Strict-Transport-Security (HSTS)
- [x] X-Frame-Options
- [x] X-Content-Type-Options
- [x] X-XSS-Protection
- [x] Referrer-Policy

### Additional Security Checks
- [ ] Verify RLS policies are active in production
- [ ] Ensure service role key is never exposed to client
- [ ] Verify webhook signature validation is working
- [ ] Check rate limiting is configured (if applicable)

## 📊 Monitoring

### Recommended Setup
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure application logging
- [ ] Set up uptime monitoring
- [ ] Monitor Trigger.dev task execution
- [ ] Monitor Supabase Edge Function logs

## 🧪 Testing

### Pre-Production Tests
- [x] RLS policies tested (`pnpm test:rls`)
- [x] Join flows tested (`pnpm test:join`)
- [x] Campaign sending tested (`pnpm test:campaigns`)

### Production Smoke Tests
- [ ] Signup works
- [ ] Login works
- [ ] Dashboard loads
- [ ] Customer CRUD operations
- [ ] Join link generation
- [ ] Public join page
- [ ] Campaign creation
- [ ] Message delivery (test mode)

## 📝 Documentation

- [x] DEPLOYMENT.md updated
- [x] HOSTING_ALTERNATIVES.md created
- [x] PRODUCTION_CHECKLIST.md created
- [ ] Environment variables documented
- [ ] API endpoints documented (if needed)

## ⚠️ Known Warnings

### Non-Critical
- Middleware deprecation warning (Next.js 16) - Can be ignored for now
- Workspace root warning - Can be ignored if build works

### Action Items
- None currently

## 🎯 Production Optimizations Applied

- [x] Compression enabled
- [x] Security headers configured
- [x] Image optimization configured
- [x] Static page generation where possible
- [x] TypeScript strict mode enabled

## 📞 Support

If you encounter issues:
1. Check application logs
2. Check Trigger.dev dashboard for task failures
3. Check Supabase logs for Edge Function errors
4. Verify all environment variables are set correctly
5. Review DEPLOYMENT.md for platform-specific notes

