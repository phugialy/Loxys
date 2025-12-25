import { task } from "@trigger.dev/sdk";
import { processQueuedDeliveries } from "@/server/campaigns/send";

/**
 * Process queued message deliveries in batches
 * This task runs periodically to send queued SMS/email messages
 */
export const processDeliveries = task({
  id: "process-deliveries",
  run: async (payload: { batchSize?: number }) => {
    const batchSize = payload.batchSize || 50;

    console.log(`Processing deliveries with batch size: ${batchSize}`);

    const result = await processQueuedDeliveries(batchSize);

    console.log(`Processed ${result.processed} deliveries:`, {
      success: result.success,
      failed: result.failed,
    });

    return {
      ...result,
      timestamp: new Date().toISOString(),
    };
  },
});

