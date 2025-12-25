import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { TablesInsert } from '@/types/database.types';

/**
 * Create a new account for a user on first signup
 * This should be called after user signs up in Supabase Auth
 */
export async function createAccountForUser(
  userId: string,
  accountName: string,
  timezone: string = 'UTC'
) {
  const supabase = createServiceRoleClient();

  // Create the account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert<TablesInsert<'accounts'>>({
      name: accountName,
      timezone,
    })
    .select()
    .single();

  if (accountError || !account) {
    throw new Error(`Failed to create account: ${accountError?.message}`);
  }

  // Create the user_account mapping
  const { error: mappingError } = await supabase
    .from('user_accounts')
    .insert<TablesInsert<'user_accounts'>>({
      user_id: userId,
      account_id: account.id,
      role: 'owner',
    });

  if (mappingError) {
    // Rollback: delete the account if mapping fails
    await supabase.from('accounts').delete().eq('id', account.id);
    throw new Error(`Failed to create user-account mapping: ${mappingError.message}`);
  }

  return account;
}

/**
 * Get the current user's account
 */
export async function getCurrentUserAccount(userId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('user_accounts')
    .select('account_id, accounts(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

