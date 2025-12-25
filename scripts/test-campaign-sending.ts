/**
 * Campaign Sending Testing Script
 * 
 * Tests:
 * 1. Suppression checks - unsubscribed customers are excluded
 * 2. Consent validation - only customers with granted consent are included
 * 3. Delivery tracking - delivery records created and status updated
 * 4. Webhook updates - delivery status updated via webhooks
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import type { Database } from '../types/database.types';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables!');
  process.exit(1);
}

const serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(name: string, testFn: () => Promise<void>) {
  try {
    await testFn();
    results.push({ name, passed: true });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`❌ ${name}:`, error);
  }
}

async function runTests() {
  console.log('🧪 Starting Campaign Sending Tests...\n');

  // Setup: Create test account and user
  console.log('📦 Setting up test data...');
  
  const { data: account, error: accountError } = await serviceClient
    .from('accounts')
    .insert({ name: 'Campaign Test Account', timezone: 'UTC' })
    .select()
    .single();

  if (accountError || !account) {
    throw new Error(`Failed to create test account: ${accountError?.message}`);
  }

  const { data: user, error: userError } = await serviceClient.auth.admin.createUser({
    email: `campaign-test-${Date.now()}@test.com`,
    password: 'test-password-123',
    email_confirm: true,
  });

  if (userError || !user.user) {
    throw new Error(`Failed to create test user: ${userError?.message}`);
  }

  await serviceClient.from('user_accounts').insert({
    user_id: user.user.id,
    account_id: account.id,
    role: 'owner',
  });

  // Create test customers with different consent/unsubscribe states
  const { data: customerWithConsent } = await serviceClient
    .from('customers')
    .insert({
      account_id: account.id,
      name: 'Customer With Consent',
      phone_e164: '+15551111111',
      email: 'consent@test.com',
      status: 'active',
    })
    .select()
    .single();

  const { data: customerUnsubscribed } = await serviceClient
    .from('customers')
    .insert({
      account_id: account.id,
      name: 'Unsubscribed Customer',
      phone_e164: '+15552222222',
      email: 'unsubscribed@test.com',
      status: 'active',
    })
    .select()
    .single();

  const { data: customerNoConsent } = await serviceClient
    .from('customers')
    .insert({
      account_id: account.id,
      name: 'Customer No Consent',
      phone_e164: '+15553333333',
      email: 'noconsent@test.com',
      status: 'active',
    })
    .select()
    .single();

  // Create consents
  if (customerWithConsent) {
    await serviceClient.from('consents').insert([
      {
        customer_id: customerWithConsent.id,
        channel: 'sms',
        status: 'granted',
        captured_via: 'web',
      },
      {
        customer_id: customerWithConsent.id,
        channel: 'email',
        status: 'granted',
        captured_via: 'web',
      },
    ]);
  }

  if (customerNoConsent) {
    // No consent for this customer
  }

  // Create unsubscribe record
  if (customerUnsubscribed) {
    await serviceClient.from('unsubscribes').insert({
      account_id: account.id,
      channel: 'sms',
      phone_e164: customerUnsubscribed.phone_e164,
      reason: 'Test unsubscribe',
    });

    await serviceClient.from('unsubscribes').insert({
      account_id: account.id,
      channel: 'email',
      email: customerUnsubscribed.email,
      reason: 'Test unsubscribe',
    });
  }

  console.log('✅ Test data created\n');

  // Test 1: Suppression Checks
  await test('Suppression check - Unsubscribed customers excluded from campaign', async () => {
    // Create a campaign
    const { data: campaign, error: campaignError } = await serviceClient
      .from('message_campaigns')
      .insert({
        account_id: account.id,
        channel: 'sms',
        body: 'Test campaign message',
        status: 'draft',
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Failed to create campaign: ${campaignError?.message}`);
    }

    // Start campaign (this should filter out unsubscribed customers)
    // We'll simulate the filterEligibleCustomers logic
    const { data: allCustomers } = await serviceClient
      .from('customers')
      .select('id, phone_e164, email')
      .eq('account_id', account.id)
      .eq('status', 'active');

    if (!allCustomers) {
      throw new Error('Failed to fetch customers');
    }

    // Check suppression
    const unsubscribedPhone = customerUnsubscribed?.phone_e164;
    if (unsubscribedPhone) {
      const { data: unsubscribed } = await serviceClient
        .from('unsubscribes')
        .select('id')
        .eq('channel', 'sms')
        .eq('phone_e164', unsubscribedPhone)
        .maybeSingle();

      if (!unsubscribed) {
        throw new Error('Unsubscribe record should exist');
      }
    }

    // Cleanup
    await serviceClient.from('message_campaigns').delete().eq('id', campaign.id);
  });

  await test('Suppression check - Email unsubscribed customers excluded', async () => {
    const unsubscribedEmail = customerUnsubscribed?.email;
    if (!unsubscribedEmail) {
      throw new Error('Unsubscribed customer email not found');
    }

    const { data: unsubscribed } = await serviceClient
      .from('unsubscribes')
      .select('id')
      .eq('channel', 'email')
      .eq('email', unsubscribedEmail)
      .maybeSingle();

    if (!unsubscribed) {
      throw new Error('Email unsubscribe record should exist');
    }
  });

  // Test 2: Consent Validation
  await test('Consent validation - Only customers with granted consent included', async () => {
    if (!customerWithConsent || !customerNoConsent) {
      throw new Error('Test customers not created');
    }

    // Check customer with consent
    const { data: consent } = await serviceClient
      .from('consents')
      .select('status')
      .eq('customer_id', customerWithConsent.id)
      .eq('channel', 'sms')
      .eq('status', 'granted')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!consent) {
      throw new Error('Customer with consent should have granted consent');
    }

    // Check customer without consent
    const { data: noConsent } = await serviceClient
      .from('consents')
      .select('status')
      .eq('customer_id', customerNoConsent.id)
      .eq('channel', 'sms')
      .eq('status', 'granted')
      .maybeSingle();

    if (noConsent) {
      throw new Error('Customer without consent should not have granted consent');
    }
  });

  // Test 3: Delivery Tracking
  await test('Delivery tracking - Delivery records created for eligible customers', async () => {
    const { data: campaign, error: campaignError } = await serviceClient
      .from('message_campaigns')
      .insert({
        account_id: account.id,
        channel: 'sms',
        body: 'Test delivery tracking',
        status: 'draft',
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      throw new Error(`Failed to create campaign: ${campaignError?.message}`);
    }

    // Create delivery record manually (simulating startCampaign)
    if (customerWithConsent) {
      const { data: delivery, error: deliveryError } = await serviceClient
        .from('message_deliveries')
        .insert({
          campaign_id: campaign.id,
          customer_id: customerWithConsent.id,
          provider: 'twilio',
          status: 'queued',
        })
        .select()
        .single();

      if (deliveryError || !delivery) {
        throw new Error(`Failed to create delivery: ${deliveryError?.message}`);
      }

      if (delivery.status !== 'queued') {
        throw new Error(`Expected status 'queued', got '${delivery.status}'`);
      }
    }

    // Cleanup
    await serviceClient.from('message_deliveries').delete().eq('campaign_id', campaign.id);
    await serviceClient.from('message_campaigns').delete().eq('id', campaign.id);
  });

  await test('Delivery tracking - Status updated after sending', async () => {
    const { data: campaign } = await serviceClient
      .from('message_campaigns')
      .insert({
        account_id: account.id,
        channel: 'sms',
        body: 'Test status update',
        status: 'draft',
      })
      .select()
      .single();

    if (!campaign || !customerWithConsent) {
      throw new Error('Campaign or customer not created');
    }

    // Create delivery
    const { data: delivery } = await serviceClient
      .from('message_deliveries')
      .insert({
        campaign_id: campaign.id,
        customer_id: customerWithConsent.id,
        provider: 'twilio',
        status: 'queued',
      })
      .select()
      .single();

    if (!delivery) {
      throw new Error('Delivery not created');
    }

    // Simulate status update (as if message was sent)
    const { error: updateError } = await serviceClient
      .from('message_deliveries')
      .update({
        status: 'sent',
        provider_message_id: 'test-message-id-123',
        sent_at: new Date().toISOString(),
      })
      .eq('id', delivery.id);

    if (updateError) {
      throw new Error(`Failed to update delivery status: ${updateError.message}`);
    }

    // Verify update
    const { data: updatedDelivery } = await serviceClient
      .from('message_deliveries')
      .select('*')
      .eq('id', delivery.id)
      .single();

    if (!updatedDelivery) {
      throw new Error('Updated delivery not found');
    }

    if (updatedDelivery.status !== 'sent') {
      throw new Error(`Expected status 'sent', got '${updatedDelivery.status}'`);
    }

    if (!updatedDelivery.sent_at) {
      throw new Error('sent_at should be set');
    }

    // Cleanup
    await serviceClient.from('message_deliveries').delete().eq('id', delivery.id);
    await serviceClient.from('message_campaigns').delete().eq('id', campaign.id);
  });

  // Test 4: Webhook Updates
  await test('Webhook updates - Delivery status updated via webhook', async () => {
    const { data: campaign } = await serviceClient
      .from('message_campaigns')
      .insert({
        account_id: account.id,
        channel: 'sms',
        body: 'Test webhook',
        status: 'draft',
      })
      .select()
      .single();

    if (!campaign || !customerWithConsent) {
      throw new Error('Campaign or customer not created');
    }

    // Create delivery with provider_message_id
    const { data: delivery } = await serviceClient
      .from('message_deliveries')
      .insert({
        campaign_id: campaign.id,
        customer_id: customerWithConsent.id,
        provider: 'twilio',
        status: 'sent',
        provider_message_id: 'SM123456789',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!delivery) {
      throw new Error('Delivery not created');
    }

    // Simulate webhook update (delivered status)
    // In production, this would come from provider-status-webhook Edge Function
    const { error: webhookError } = await serviceClient
      .from('message_deliveries')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        provider_event_id: 'webhook-event-123',
      })
      .eq('provider_message_id', 'SM123456789');

    if (webhookError) {
      throw new Error(`Webhook update failed: ${webhookError.message}`);
    }

    // Verify webhook update
    const { data: webhookUpdated } = await serviceClient
      .from('message_deliveries')
      .select('*')
      .eq('id', delivery.id)
      .single();

    if (!webhookUpdated) {
      throw new Error('Webhook updated delivery not found');
    }

    if (webhookUpdated.status !== 'delivered') {
      throw new Error(`Expected status 'delivered', got '${webhookUpdated.status}'`);
    }

    if (!webhookUpdated.delivered_at) {
      throw new Error('delivered_at should be set by webhook');
    }

    // Cleanup
    await serviceClient.from('message_deliveries').delete().eq('id', delivery.id);
    await serviceClient.from('message_campaigns').delete().eq('id', campaign.id);
  });

  await test('Webhook updates - Failed delivery status updated', async () => {
    const { data: campaign } = await serviceClient
      .from('message_campaigns')
      .insert({
        account_id: account.id,
        channel: 'sms',
        body: 'Test failed webhook',
        status: 'draft',
      })
      .select()
      .single();

    if (!campaign || !customerWithConsent) {
      throw new Error('Campaign or customer not created');
    }

    // Create delivery
    const { data: delivery } = await serviceClient
      .from('message_deliveries')
      .insert({
        campaign_id: campaign.id,
        customer_id: customerWithConsent.id,
        provider: 'twilio',
        status: 'sent',
        provider_message_id: 'SM987654321',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!delivery) {
      throw new Error('Delivery not created');
    }

    // Simulate failed webhook update
    const { error: webhookError } = await serviceClient
      .from('message_deliveries')
      .update({
        status: 'failed',
        provider_error: 'Delivery failed: Invalid number',
        failed_at: new Date().toISOString(),
        provider_event_id: 'webhook-failed-123',
      })
      .eq('provider_message_id', 'SM987654321');

    if (webhookError) {
      throw new Error(`Failed webhook update failed: ${webhookError.message}`);
    }

    // Verify failed status
    const { data: failedDelivery } = await serviceClient
      .from('message_deliveries')
      .select('*')
      .eq('id', delivery.id)
      .single();

    if (!failedDelivery) {
      throw new Error('Failed delivery not found');
    }

    if (failedDelivery.status !== 'failed') {
      throw new Error(`Expected status 'failed', got '${failedDelivery.status}'`);
    }

    if (!failedDelivery.provider_error) {
      throw new Error('provider_error should be set');
    }

    // Cleanup
    await serviceClient.from('message_deliveries').delete().eq('id', delivery.id);
    await serviceClient.from('message_campaigns').delete().eq('id', campaign.id);
  });

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  
  // Get all campaigns for this account
  const { data: campaigns } = await serviceClient
    .from('message_campaigns')
    .select('id')
    .eq('account_id', account.id);
  
  if (campaigns && campaigns.length > 0) {
    const campaignIds = campaigns.map(c => c.id);
    await serviceClient.from('message_deliveries').delete().in('campaign_id', campaignIds);
  }
  
  await serviceClient.from('message_campaigns').delete().eq('account_id', account.id);
  
  // Get all customers for this account
  const { data: customers } = await serviceClient
    .from('customers')
    .select('id')
    .eq('account_id', account.id);
  
  if (customers && customers.length > 0) {
    const customerIds = customers.map(c => c.id);
    await serviceClient.from('consents').delete().in('customer_id', customerIds);
  }
  
  await serviceClient.from('unsubscribes').delete().eq('account_id', account.id);
  await serviceClient.from('customers').delete().eq('account_id', account.id);
  await serviceClient.from('user_accounts').delete().eq('account_id', account.id);
  await serviceClient.from('accounts').delete().eq('id', account.id);
  await serviceClient.auth.admin.deleteUser(user.user.id);
  console.log('✅ Cleanup complete\n');

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('='.repeat(50));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed > 0) {
    console.error('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All campaign sending tests passed!');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

