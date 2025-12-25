# Trigger.dev Usage Guide

## CLI Installation

The Trigger.dev CLI is available via `npx` (no global installation needed).

## Available Commands

### Development
```bash
# Start Trigger.dev dev server (watches for task changes)
pnpm dev:trigger

# Or use npx directly
npx trigger.dev@latest dev
```

### Deployment
```bash
# Deploy tasks to Trigger.dev
pnpm deploy:trigger

# Or use npx directly
npx trigger.dev@latest deploy
```

## First Time Setup

1. **Login to Trigger.dev:**
   ```bash
   npx trigger.dev@latest login
   ```
   This will open your browser to authenticate.

2. **Start the dev server:**
   ```bash
   pnpm dev:trigger
   ```
   This will:
   - Watch for task changes
   - Sync tasks to Trigger.dev
   - Allow you to test tasks locally

## Environment Variables

Make sure these are set in `.env.local`:
```
TRIGGER_PROJECT_REF=proj_quoojnxmnqjckgtvuxgi
TRIGGER_SECRET_KEY=tr_dev_QWsTQEBVLrGnCMiZVfy5
TRIGGER_API_URL=https://api.trigger.dev
```

## Running Tasks

Tasks are automatically triggered when:
- A campaign is started (calls `process-deliveries` task)
- You call `/api/trigger/process-deliveries` endpoint

## Scheduling

To schedule tasks:
1. Go to Trigger.dev dashboard
2. Navigate to your project
3. Create a schedule for `scheduled-process-deliveries`
4. Set cron: `*/5 * * * *` (every 5 minutes)

