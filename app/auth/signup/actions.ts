'use server';

import { createAccountForUser } from '@/server/auth/account';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function createAccountAction(userId: string, accountName: string) {
  // Use service role to check if account exists and create if needed
  const supabase = createServiceRoleClient();

  // Check if user already has an account
  const { data: existingMapping } = await supabase
    .from('user_accounts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMapping) {
    // User already has an account, return success
    return { success: true, message: 'Account already exists' };
  }

  // Create the account
  const account = await createAccountForUser(
    userId,
    accountName || 'My Business'
  );

  return { success: true, account };
}

