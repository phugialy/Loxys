import { createClient } from '@/lib/supabase/server';
import type { TablesInsert, TablesUpdate } from '@/types/database.types';

/**
 * Get all join tokens for the current account
 */
export async function getJoinTokens() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('join_tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch join tokens: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single join token by ID
 */
export async function getJoinTokenById(tokenId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('join_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch join token: ${error.message}`);
  }

  return data;
}

/**
 * Get a join token by token UUID
 */
export async function getJoinTokenByToken(token: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('join_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error) {
    throw new Error(`Failed to fetch join token: ${error.message}`);
  }

  return data;
}

/**
 * Create a new join token
 */
export async function createJoinToken(
  tokenData: Omit<TablesInsert<'join_tokens'>, 'account_id' | 'id' | 'token' | 'created_at' | 'updated_at' | 'active'>
) {
  const supabase = await createClient();

  // Get current account ID
  const { data: accountData, error: accountError } = await supabase
    .rpc('current_account_id');

  if (accountError || !accountData) {
    throw new Error('Failed to get account ID');
  }

  const newToken: TablesInsert<'join_tokens'> = {
    account_id: accountData,
    channel_hint: tokenData.channel_hint || null,
    active: true,
  };

  const { data, error } = await supabase
    .from('join_tokens')
    .insert(newToken)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create join token: ${error.message}`);
  }

  return data;
}

/**
 * Update a join token
 */
export async function updateJoinToken(
  tokenId: string,
  updates: Partial<TablesUpdate<'join_tokens'>>
) {
  const supabase = await createClient();

  // Remove account_id and token from updates (cannot be changed)
  const { account_id, token, ...safeUpdates } = updates;

  const { data, error } = await supabase
    .from('join_tokens')
    .update(safeUpdates)
    .eq('id', tokenId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update join token: ${error.message}`);
  }

  return data;
}

/**
 * Deactivate a join token
 */
export async function deactivateJoinToken(tokenId: string) {
  return updateJoinToken(tokenId, { active: false });
}

/**
 * Activate a join token
 */
export async function activateJoinToken(tokenId: string) {
  return updateJoinToken(tokenId, { active: true });
}

/**
 * Regenerate a join token (deactivate old, create new)
 */
export async function regenerateJoinToken(tokenId: string) {
  const supabase = await createClient();

  // Get the existing token to preserve channel_hint
  const existing = await getJoinTokenById(tokenId);

  // Deactivate the old token
  await deactivateJoinToken(tokenId);

  // Create a new token with the same channel_hint
  return createJoinToken({
    channel_hint: existing.channel_hint,
  });
}

