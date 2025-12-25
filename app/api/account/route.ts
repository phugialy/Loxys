import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/types/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get account ID
    const { data: accountId, error: accountIdError } = await supabase
      .rpc('current_account_id');

    if (accountIdError || !accountId) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Get account
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .maybeSingle();

    if (accountError) {
      return NextResponse.json(
        { error: accountError.message || 'Failed to fetch account' },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch account' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get account ID
    const { data: accountId, error: accountIdError } = await supabase
      .rpc('current_account_id');

    if (accountIdError || !accountId) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: Partial<TablesUpdate<'accounts'>> = {};

    if (body.name !== undefined) {
      updates.name = body.name;
    }
    if (body.timezone !== undefined) {
      updates.timezone = body.timezone;
    }

    // Update account
    const { data: account, error: updateError } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', accountId)
      .select()
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Failed to update account' },
        { status: 500 }
      );
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or update did not affect any rows' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update account' },
      { status: 500 }
    );
  }
}

