/**
 * RLS Policy Testing Script
 * 
 * Tests:
 * 1. Tenant isolation - users can only access their own account's data
 * 2. Cross-tenant access prevention - users cannot access other accounts' data
 * 3. current_account_id() function works correctly
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
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create service role client for test setup
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
  console.log('🧪 Starting RLS Policy Tests...\n');

  // Setup: Create test accounts and users
  console.log('📦 Setting up test data...');
  
  // Create two test accounts
  const { data: account1, error: account1Error } = await serviceClient
    .from('accounts')
    .insert({ name: 'Test Account 1', timezone: 'UTC' })
    .select()
    .single();

  if (account1Error || !account1) {
    throw new Error(`Failed to create test account 1: ${account1Error?.message}`);
  }

  const { data: account2, error: account2Error } = await serviceClient
    .from('accounts')
    .insert({ name: 'Test Account 2', timezone: 'UTC' })
    .select()
    .single();

  if (account2Error || !account2) {
    throw new Error(`Failed to create test account 2: ${account2Error?.message}`);
  }

  // Create test users
  const { data: user1, error: user1Error } = await serviceClient.auth.admin.createUser({
    email: `test-user-1-${Date.now()}@test.com`,
    password: 'test-password-123',
    email_confirm: true,
  });

  if (user1Error || !user1.user) {
    throw new Error(`Failed to create test user 1: ${user1Error?.message}`);
  }

  const { data: user2, error: user2Error } = await serviceClient.auth.admin.createUser({
    email: `test-user-2-${Date.now()}@test.com`,
    password: 'test-password-123',
    email_confirm: true,
  });

  if (user2Error || !user2.user) {
    throw new Error(`Failed to create test user 2: ${user2Error?.message}`);
  }

  // Link users to accounts
  await serviceClient.from('user_accounts').insert({
    user_id: user1.user.id,
    account_id: account1.id,
    role: 'owner',
  });

  await serviceClient.from('user_accounts').insert({
    user_id: user2.user.id,
    account_id: account2.id,
    role: 'owner',
  });

  // Create test customers for each account
  const { data: customer1 } = await serviceClient
    .from('customers')
    .insert({
      account_id: account1.id,
      name: 'Customer 1',
      phone_e164: '+1234567890',
      email: 'customer1@test.com',
    })
    .select()
    .single();

  const { data: customer2 } = await serviceClient
    .from('customers')
    .insert({
      account_id: account2.id,
      name: 'Customer 2',
      phone_e164: '+0987654321',
      email: 'customer2@test.com',
    })
    .select()
    .single();

  console.log('✅ Test data created\n');

  // Create authenticated clients for each user
  const client1 = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });

  const client2 = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    },
  });

  // Sign in users
  const { data: session1, error: signInError1 } = await client1.auth.signInWithPassword({
    email: user1.user.email!,
    password: 'test-password-123',
  });

  const { data: session2, error: signInError2 } = await client2.auth.signInWithPassword({
    email: user2.user.email!,
    password: 'test-password-123',
  });

  if (signInError1 || !session1?.session) {
    throw new Error(`Failed to sign in test user 1: ${signInError1?.message}`);
  }

  if (signInError2 || !session2?.session) {
    throw new Error(`Failed to sign in test user 2: ${signInError2?.message}`);
  }

  // Test 1: current_account_id() function
  await test('current_account_id() returns correct account for user 1', async () => {
    const { data, error } = await client1.rpc('current_account_id');
    if (error) throw error;
    if (data !== account1.id) {
      throw new Error(`Expected account ${account1.id}, got ${data}`);
    }
  });

  await test('current_account_id() returns correct account for user 2', async () => {
    const { data, error } = await client2.rpc('current_account_id');
    if (error) throw error;
    if (data !== account2.id) {
      throw new Error(`Expected account ${account2.id}, got ${data}`);
    }
  });

  // Test 2: Tenant isolation - customers
  await test('User 1 can read their own customers', async () => {
    const { data, error } = await client1
      .from('customers')
      .select('*')
      .eq('id', customer1!.id)
      .single();
    
    if (error) throw error;
    if (!data || data.id !== customer1!.id) {
      throw new Error('User 1 cannot read their own customer');
    }
  });

  await test('User 1 cannot read other account\'s customers', async () => {
    const { data, error } = await client1
      .from('customers')
      .select('*')
      .eq('id', customer2!.id)
      .single();
    
    if (data) {
      throw new Error('User 1 can read other account\'s customer (RLS violation!)');
    }
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected
      throw error;
    }
  });

  await test('User 2 cannot read other account\'s customers', async () => {
    const { data, error } = await client2
      .from('customers')
      .select('*')
      .eq('id', customer1!.id)
      .single();
    
    if (data) {
      throw new Error('User 2 can read other account\'s customer (RLS violation!)');
    }
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
  });

  // Test 3: Tenant isolation - accounts
  await test('User 1 can read their own account', async () => {
    const { data, error } = await client1
      .from('accounts')
      .select('*')
      .eq('id', account1.id)
      .single();
    
    if (error) throw error;
    if (!data || data.id !== account1.id) {
      throw new Error('User 1 cannot read their own account');
    }
  });

  await test('User 1 cannot read other account', async () => {
    const { data, error } = await client1
      .from('accounts')
      .select('*')
      .eq('id', account2.id)
      .single();
    
    if (data) {
      throw new Error('User 1 can read other account (RLS violation!)');
    }
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
  });

  // Test 4: Tenant isolation - join tokens
  const { data: token1 } = await serviceClient
    .from('join_tokens')
    .insert({
      account_id: account1.id,
      active: true,
    })
    .select()
    .single();

  const { data: token2 } = await serviceClient
    .from('join_tokens')
    .insert({
      account_id: account2.id,
      active: true,
    })
    .select()
    .single();

  await test('User 1 can read their own join tokens', async () => {
    const { data, error } = await client1
      .from('join_tokens')
      .select('*')
      .eq('id', token1!.id)
      .single();
    
    if (error) throw error;
    if (!data || data.id !== token1!.id) {
      throw new Error('User 1 cannot read their own join token');
    }
  });

  await test('User 1 cannot read other account\'s join tokens', async () => {
    const { data, error } = await client1
      .from('join_tokens')
      .select('*')
      .eq('id', token2!.id)
      .single();
    
    if (data) {
      throw new Error('User 1 can read other account\'s join token (RLS violation!)');
    }
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
  });

  // Test 5: INSERT isolation
  await test('User 1 can insert customer in their own account', async () => {
    // RLS will verify account_id matches current_account_id()
    const { data, error } = await client1
      .from('customers')
      .insert({
        account_id: account1.id, // Must match current_account_id() for user1
        name: 'New Customer',
        phone_e164: '+1111111111',
        email: 'new@test.com',
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    if (!data || data.account_id !== account1.id) {
      throw new Error('User 1 cannot insert customer or wrong account_id');
    }
  });

  await test('User 1 cannot insert customer with other account_id', async () => {
    // RLS should reject this because account_id doesn't match current_account_id()
    const { error } = await client1
      .from('customers')
      .insert({
        account_id: account2.id, // Try to insert with other account's ID
        name: 'Hacked Customer',
        phone_e164: '+2222222222',
        email: 'hacked@test.com',
      } as any);
    
    if (!error) {
      throw new Error('User 1 can insert customer with other account_id (RLS violation!)');
    }
    // Error is expected - RLS should block this
  });

  // Test 6: UPDATE isolation
  const { data: updateCustomer1 } = await serviceClient
    .from('customers')
    .insert({
      account_id: account1.id,
      name: 'Update Test Customer',
      phone_e164: '+3333333333',
    })
    .select()
    .single();

  await test('User 1 can update their own customer', async () => {
    const { data, error } = await client1
      .from('customers')
      .update({ name: 'Updated Name' })
      .eq('id', updateCustomer1!.id)
      .select()
      .single();
    
    if (error) throw error;
    if (!data || data.name !== 'Updated Name') {
      throw new Error('User 1 cannot update their own customer');
    }
  });

  await test('User 1 cannot update other account\'s customer', async () => {
    const { data, error } = await client1
      .from('customers')
      .update({ name: 'Hacked Name' })
      .eq('id', customer2!.id)
      .select();
    
    if (data && data.length > 0) {
      throw new Error('User 1 can update other account\'s customer (RLS violation!)');
    }
    // Error is expected here
  });

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await serviceClient.from('customers').delete().eq('account_id', account1.id);
  await serviceClient.from('customers').delete().eq('account_id', account2.id);
  await serviceClient.from('join_tokens').delete().eq('account_id', account1.id);
  await serviceClient.from('join_tokens').delete().eq('account_id', account2.id);
  await serviceClient.from('user_accounts').delete().eq('account_id', account1.id);
  await serviceClient.from('user_accounts').delete().eq('account_id', account2.id);
  await serviceClient.from('accounts').delete().eq('id', account1.id);
  await serviceClient.from('accounts').delete().eq('id', account2.id);
  await serviceClient.auth.admin.deleteUser(user1.user.id);
  await serviceClient.auth.admin.deleteUser(user2.user.id);
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
    console.error('\n❌ Some tests failed! RLS policies may not be working correctly.');
    process.exit(1);
  } else {
    console.log('\n✅ All RLS tests passed! Tenant isolation is working correctly.');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

