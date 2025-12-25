import { task } from "@trigger.dev/sdk";
import { processQueuedDeliveries } from "@/server/campaigns/send";

/**
 * Scheduled task to process queued deliveries
 * This can be scheduled via Trigger.dev dashboard or called manually
 * For now, we'll use the manual trigger approach - scheduling can be configured in the dashboard
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

