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
 * Get a join token by token UUID or slug
 */
export async function getJoinTokenByToken(tokenOrSlug: string) {
  const supabase = await createClient();

  // Try to find by slug first (if it looks like a slug - lowercase alphanumeric with hyphens)
  // Otherwise try by token UUID
  const isSlug = /^[a-z0-9-]+$/.test(tokenOrSlug) && !tokenOrSlug.includes('{');
  
  let query = supabase
    .from('join_tokens')
    .select('*');
  
  if (isSlug) {
    query = query.eq('slug', tokenOrSlug);
  } else {
    query = query.eq('token', tokenOrSlug);
  }
  
  const { data, error } = await query.single();

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

  // Validate slug if provided
  if (tokenData.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(tokenData.slug)) {
      throw new Error('Slug must contain only lowercase letters, numbers, and hyphens');
    }
    if (tokenData.slug.length > 50) {
      throw new Error('Slug must be 50 characters or less');
    }
  }

  const newToken: TablesInsert<'join_tokens'> = {
    account_id: accountData,
    channel_hint: tokenData.channel_hint || null,
    slug: tokenData.slug || null,
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

/**
 * Delete a join token
 */
export async function deleteJoinToken(tokenId: string) {
  const supabase = await createClient();

  // First verify the token exists and belongs to the current account
  const { data: existing, error: fetchError } = await supabase
    .from('join_tokens')
    .select('id, account_id')
    .eq('id', tokenId)
    .single();

  if (fetchError) {
    throw new Error(`Join token not found: ${fetchError.message}`);
  }

  if (!existing) {
    throw new Error('Join token not found');
  }

  // Delete the token
  const { error } = await supabase
    .from('join_tokens')
    .delete()
    .eq('id', tokenId);

  if (error) {
    throw new Error(`Failed to delete join token: ${error.message}`);
  }

  return { success: true };
}

