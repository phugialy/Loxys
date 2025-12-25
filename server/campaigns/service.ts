import { createClient } from '@/lib/supabase/server';
import type { TablesInsert, TablesUpdate } from '@/types/database.types';
import { getCustomers } from '../customers/service';

/**
 * Get all campaigns for the current account
 */
export async function getCampaigns(filters?: {
  status?: 'draft' | 'sending' | 'completed' | 'cancelled';
}) {
  const supabase = await createClient();

  let query = supabase
    .from('message_campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch campaigns: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single campaign by ID with delivery stats
 */
export async function getCampaignById(campaignId: string) {
  const supabase = await createClient();

  // Get campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('message_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    throw new Error(`Failed to fetch campaign: ${campaignError?.message}`);
  }

  // Get delivery stats
  const { data: deliveries, error: deliveriesError } = await supabase
    .from('message_deliveries')
    .select('status')
    .eq('campaign_id', campaignId);

  if (deliveriesError) {
    throw new Error(`Failed to fetch delivery stats: ${deliveriesError.message}`);
  }

  // Calculate stats
  const stats = {
    total: deliveries?.length || 0,
    queued: deliveries?.filter((d) => d.status === 'queued').length || 0,
    sent: deliveries?.filter((d) => d.status === 'sent').length || 0,
    delivered: deliveries?.filter((d) => d.status === 'delivered').length || 0,
    failed: deliveries?.filter((d) => d.status === 'failed').length || 0,
    suppressed: deliveries?.filter((d) => d.status === 'suppressed').length || 0,
    bounced: deliveries?.filter((d) => d.status === 'bounced').length || 0,
  };

  return {
    ...campaign,
    stats,
  };
}

/**
 * Create a new campaign
 */
export async function createCampaign(
  campaign: Omit<TablesInsert<'message_campaigns'>, 'account_id' | 'id' | 'created_at' | 'updated_at' | 'status' | 'started_at' | 'completed_at'>
) {
  const supabase = await createClient();

  // Get current account ID
  const { data: accountData, error: accountError } = await supabase
    .rpc('current_account_id');

  if (accountError || !accountData) {
    throw new Error('Failed to get account ID');
  }

  const newCampaign: TablesInsert<'message_campaigns'> = {
    account_id: accountData,
    channel: campaign.channel,
    body: campaign.body,
    status: 'draft',
  };

  const { data, error } = await supabase
    .from('message_campaigns')
    .insert(newCampaign)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  return data;
}

/**
 * Update a campaign
 */
export async function updateCampaign(
  campaignId: string,
  updates: Partial<TablesUpdate<'message_campaigns'>>
) {
  const supabase = await createClient();

  // Remove account_id from updates (cannot be changed)
  const { account_id, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('message_campaigns')
    .update(safeUpdates)
    .eq('id', campaignId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update campaign: ${error.message}`);
  }

  return data;
}

/**
 * Start a campaign (enqueue deliveries)
 */
export async function startCampaign(campaignId: string) {
  const supabase = await createClient();

  // Get the campaign
  const campaign = await getCampaignById(campaignId);

  if (campaign.status !== 'draft') {
    throw new Error('Campaign must be in draft status to start');
  }

  // Get active customers for the account
  const customers = await getCustomers({ status: 'active' });

  // Filter customers by channel consent and suppression
  const eligibleCustomers = await filterEligibleCustomers(
    customers,
    campaign.channel as 'sms' | 'email'
  );

  // Create delivery records
  const deliveries: TablesInsert<'message_deliveries'>[] = eligibleCustomers.map(
    (customer) => ({
      campaign_id: campaignId,
      customer_id: customer.id,
      provider: 'twilio', // TODO: Make this configurable
      status: 'queued',
    })
  );

  if (deliveries.length > 0) {
    const { error: deliveryError } = await supabase
      .from('message_deliveries')
      .insert(deliveries);

    if (deliveryError) {
      throw new Error(`Failed to create deliveries: ${deliveryError.message}`);
    }
  }

  // Update campaign status
  const updatedCampaign = await updateCampaign(campaignId, {
    status: 'sending',
    started_at: new Date().toISOString(),
  });

  // Trigger Trigger.dev task to process deliveries
  try {
    const { tasks } = await import('@trigger.dev/sdk');
    await tasks.trigger('process-deliveries', { batchSize: 50 });
  } catch (error) {
    console.error('Error triggering delivery task:', error);
    // Fallback to direct processing if Trigger.dev fails
    try {
      const { processQueuedDeliveries } = await import('./send');
      await processQueuedDeliveries(10);
    } catch (fallbackError) {
      console.error('Error processing deliveries (fallback):', fallbackError);
      // Don't fail the campaign start if sending fails
    }
  }

  return updatedCampaign;
}

/**
 * Filter customers by consent and suppression
 */
async function filterEligibleCustomers(
  customers: Array<{ id: string; phone_e164: string | null; email: string | null }>,
  channel: 'sms' | 'email'
) {
  const supabase = await createClient();

  const eligible: typeof customers = [];

  for (const customer of customers) {
    // Check if unsubscribed
    const contactValue = channel === 'sms' ? customer.phone_e164 : customer.email;
    if (!contactValue) continue;

    const { data: unsubscribed } = await supabase
      .from('unsubscribes')
      .select('id')
      .eq('channel', channel)
      .or(
        channel === 'sms'
          ? `phone_e164.eq.${contactValue}`
          : `email.eq.${contactValue}`
      )
      .limit(1)
      .single();

    if (unsubscribed) {
      // Mark as suppressed in delivery (will be done in startCampaign)
      continue;
    }

    // Check if has consent
    const { data: consent } = await supabase
      .from('consents')
      .select('status')
      .eq('customer_id', customer.id)
      .eq('channel', channel)
      .eq('status', 'granted')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (consent) {
      eligible.push(customer);
    }
  }

  return eligible;
}

