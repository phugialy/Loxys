import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
import type { TablesInsert } from '@/types/database.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone_e164, account_id, channel } = body;

    if (!account_id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (!email && !phone_e164) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      );
    }

    if (!channel || !['sms', 'email'].includes(channel)) {
      return NextResponse.json(
        { error: 'Valid channel (sms or email) is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Create unsubscribe record
    const unsubscribeData: TablesInsert<'unsubscribes'> = {
      account_id,
      channel,
      email: email || null,
      phone_e164: phone_e164 || null,
      reason: 'User requested unsubscribe via web',
    };

    // Use insert with conflict handling
    const { error: insertError } = await supabase
      .from('unsubscribes')
      .insert(unsubscribeData);

    // If duplicate, that's fine - they're already unsubscribed
    if (insertError && !insertError.message.includes('duplicate')) {
      throw insertError;
    }

    // Also revoke consent
    if (email || phone_e164) {
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('account_id', account_id)
        .or(
          email
            ? `email.eq.${email}`
            : `phone_e164.eq.${phone_e164}`
        );

      if (customers && customers.length > 0) {
        const customerIds = customers.map((c) => c.id);
        await supabase.from('consents').insert(
          customerIds.map((customerId) => ({
            customer_id: customerId,
            channel,
            status: 'revoked',
            captured_via: 'web',
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

