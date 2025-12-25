import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCustomerById,
  updateCustomer,
  archiveCustomer,
} from '@/server/customers/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const customer = await getCustomerById(id);

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Handle archive action
    if (body.action === 'archive') {
      const customer = await archiveCustomer(id);
      return NextResponse.json({ customer });
    }

    if (body.action === 'restore') {
      const customer = await updateCustomer(id, { status: 'active' });
      return NextResponse.json({ customer });
    }

    // Regular update
    const customer = await updateCustomer(id, body);

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update customer' },
      { status: 500 }
    );
  }
}

