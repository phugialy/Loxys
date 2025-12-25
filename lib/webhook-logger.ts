import { createServiceRoleClient } from '@/lib/supabase/service-role';

export interface WebhookEvent {
  provider: string;
  event_type: string;
  raw_payload: any;
  processed?: boolean;
  processing_result?: any;
  error_message?: string;
}

/**
 * Log webhook event for debugging and audit
 */
export async function logWebhookEvent(event: WebhookEvent) {
  try {
    const supabase = createServiceRoleClient();

    // Note: This requires the webhook_events table to be created
    // For MVP, we'll just log to console
    console.log('Webhook Event:', {
      provider: event.provider,
      event_type: event.event_type,
      processed: event.processed,
      timestamp: new Date().toISOString(),
    });

    // Uncomment when webhook_events table is created:
    // await supabase.from('webhook_events').insert({
    //   provider: event.provider,
    //   event_type: event.event_type,
    //   raw_payload: event.raw_payload,
    //   processed: event.processed || false,
    //   processing_result: event.processing_result,
    //   error_message: event.error_message,
    // });
  } catch (error) {
    console.error('Failed to log webhook event:', error);
    // Don't throw - logging failures shouldn't break webhook processing
  }
}

