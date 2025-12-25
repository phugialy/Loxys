import { task } from "@trigger.dev/sdk";
import { processQueuedDeliveries } from "@/server/campaigns/send";

/**
 * Scheduled task to process queued deliveries
 * 
 * This task is configured to run every 5 minutes via Trigger.dev dashboard.
 * No Vercel cron limits - Trigger.dev handles all scheduling in the cloud.
 * 
 * To enable scheduling:
 * 1. Deploy this task: pnpm deploy:trigger
 * 2. Go to Trigger.dev dashboard → Your project → Schedules
 * 3. Create a new schedule for "scheduled-process-deliveries"
 * 4. Set cron expression: every 5 minutes (format: star-slash-5 star star star star)
 */
export const scheduledProcessDeliveries = task({
  id: "scheduled-process-deliveries",
  run: async () => {
    console.log("Running scheduled delivery processing");

    const result = await processQueuedDeliveries(50);

    console.log(`Scheduled processing completed:`, {
      processed: result.processed,
      success: result.success,
      failed: result.failed,
    });

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  },
});

