import { createServiceRoleClient } from '@/lib/supabase/service-role';
import { sendSMS, sendEmail } from '@/providers';
import type { TablesUpdate } from '@/types/database.types';

/**
 * Send a single message delivery
 */
export async function sendDelivery(deliveryId: string) {
  const supabase = createServiceRoleClient();

  // Get the delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('message_deliveries')
    .select(`
      *,
      campaigns!inner(channel, body, account_id),
      customers!inner(phone_e164, email, account_id)
    `)
    .eq('id', deliveryId)
    .eq('status', 'queued')
    .single();

  if (deliveryError || !delivery) {
    throw new Error(`Delivery not found or not queued: ${deliveryError?.message}`);
  }

  // Get campaign and customer separately since joins are complex
  const { data: campaign } = await supabase
    .from('message_campaigns')
    .select('channel, body, account_id')
    .eq('id', delivery.campaign_id)
    .single();

  const { data: customer } = await supabase
    .from('customers')
    .select('phone_e164, email, account_id')
    .eq('id', delivery.customer_id)
    .single();

  if (!campaign || !customer) {
    throw new Error('Campaign or customer not found');
  }

  try {
    let result;

    if (campaign.channel === 'sms') {
      if (!customer.phone_e164) {
        throw new Error('Customer phone number not available');
      }

      result = await sendSMS({
        to: customer.phone_e164,
        body: campaign.body,
      });
    } else if (campaign.channel === 'email') {
      if (!customer.email) {
        throw new Error('Customer email not available');
      }

      // Generate unsubscribe URL
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(customer.email)}&account=${campaign.account_id}`;

      result = await sendEmail({
        to: customer.email,
        subject: 'Message from ' + campaign.account_id, // TODO: Get account name
        body: campaign.body,
        unsubscribeUrl,
      });
    } else {
      throw new Error(`Unsupported channel: ${campaign.channel}`);
    }

    // Update delivery status
    const updateData: Partial<TablesUpdate<'message_deliveries'>> = {
      status: result.success ? 'sent' : 'failed',
      provider_message_id: result.messageId || null,
      provider_error: result.error || null,
      sent_at: result.success ? new Date().toISOString() : null,
      failed_at: result.success ? null : new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('message_deliveries')
      .update(updateData)
      .eq('id', deliveryId);

    if (updateError) {
      console.error('Failed to update delivery status:', updateError);
    }

    return result;
  } catch (error) {
    // Mark as failed
    const { error: updateError } = await supabase
      .from('message_deliveries')
      .update({
        status: 'failed',
        provider_error: error instanceof Error ? error.message : 'Unknown error',
        failed_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    if (updateError) {
      console.error('Failed to mark delivery as failed:', updateError);
    }

    throw error;
  }
}

/**
 * Process queued deliveries in batches
 */
export async function processQueuedDeliveries(batchSize: number = 10) {
  const supabase = createServiceRoleClient();

  // Get queued deliveries
  const { data: deliveries, error } = await supabase
    .from('message_deliveries')
    .select('id')
    .eq('status', 'queued')
    .order('queued_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    throw new Error(`Failed to fetch queued deliveries: ${error.message}`);
  }

  if (!deliveries || deliveries.length === 0) {
    return { processed: 0, success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  // Process each delivery
  for (const delivery of deliveries) {
    try {
      await sendDelivery(delivery.id);
      success++;
    } catch (error) {
      console.error(`Failed to send delivery ${delivery.id}:`, error);
      failed++;
    }
  }

  return {
    processed: deliveries.length,
    success,
    failed,
  };
}

