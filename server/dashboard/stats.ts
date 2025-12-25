import { createClient } from '@/lib/supabase/server';

export interface DashboardStats {
  totalCustomers: number;
  totalCampaigns: number;
  totalMessagesSent: number;
  recentCustomers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone_e164: string | null;
    created_at: string;
  }>;
  recentCampaigns: Array<{
    id: string;
    channel: string;
    body: string;
    status: string;
    created_at: string;
  }>;
}

/**
 * Get dashboard statistics for the current account
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Get account ID
  const { data: accountId, error: accountIdError } = await supabase.rpc('current_account_id');
  
  if (accountIdError || !accountId) {
    throw new Error('Failed to get account ID');
  }

  // Get total customers count
  const { count: customersCount, error: customersError } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  if (customersError) {
    throw new Error(`Failed to fetch customers count: ${customersError.message}`);
  }

  // Get total campaigns count
  const { count: campaignsCount, error: campaignsError } = await supabase
    .from('message_campaigns')
    .select('*', { count: 'exact', head: true });

  if (campaignsError) {
    throw new Error(`Failed to fetch campaigns count: ${campaignsError.message}`);
  }

  // Get total messages sent (delivered + sent status)
  const { count: messagesCount, error: messagesError } = await supabase
    .from('message_deliveries')
    .select('*', { count: 'exact', head: true })
    .in('status', ['sent', 'delivered']);

  if (messagesError) {
    throw new Error(`Failed to fetch messages count: ${messagesError.message}`);
  }

  // Get recent customers (last 5)
  const { data: recentCustomers, error: recentCustomersError } = await supabase
    .from('customers')
    .select('id, name, email, phone_e164, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentCustomersError) {
    throw new Error(`Failed to fetch recent customers: ${recentCustomersError.message}`);
  }

  // Get recent campaigns (last 5)
  const { data: recentCampaigns, error: recentCampaignsError } = await supabase
    .from('message_campaigns')
    .select('id, channel, body, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentCampaignsError) {
    throw new Error(`Failed to fetch recent campaigns: ${recentCampaignsError.message}`);
  }

  return {
    totalCustomers: customersCount || 0,
    totalCampaigns: campaignsCount || 0,
    totalMessagesSent: messagesCount || 0,
    recentCustomers: recentCustomers || [],
    recentCampaigns: recentCampaigns || [],
  };
}

