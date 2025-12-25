# Trigger.dev Setup

## Configuration

Trigger.dev is configured and ready to use. The following has been set up:

### Files Created
- `trigger.config.ts` - Trigger.dev configuration
- `src/trigger/process-deliveries.ts` - Main delivery processing task
- `src/trigger/schedule-deliveries.ts` - Scheduled processing task
- `app/api/trigger/process-deliveries/route.ts` - API endpoint to trigger tasks

### Environment Variables
Add these to your `.env.local`:
```
TRIGGER_PROJECT_REF=proj_quoojnxmnqjckgtvuxgi
TRIGGER_SECRET_KEY=tr_dev_QWsTQEBVLrGnCMiZVfy5
TRIGGER_API_URL=https://api.trigger.dev
```

### Development

1. **Start Trigger.dev dev server** (in a separate terminal):
   ```bash
   pnpm dev:trigger
   ```

2. **Start Next.js dev server**:
   ```bash
   pnpm dev
   ```

### Usage

**Manual Trigger:**
- Call `/api/trigger/process-deliveries` (POST) to trigger delivery processing
- Or use `tasks.trigger('process-deliveries', { batchSize: 50 })` in code

**Automatic:**
- Campaign start automatically triggers the `process-deliveries` task
- You can set up scheduled runs in the Trigger.dev dashboard

### Scheduling

To schedule the task to run every 5 minutes:
1. Go to Trigger.dev dashboard
2. Navigate to your project
3. Create a schedule for the `scheduled-process-deliveries` task
4. Set cron: `*/5 * * * *`

### Deployment

When deploying:
1. Set `TRIGGER_SECRET_KEY` to your production key (not dev key)
2. Deploy tasks: `pnpm deploy:trigger`
3. Configure schedules in the dashboard

