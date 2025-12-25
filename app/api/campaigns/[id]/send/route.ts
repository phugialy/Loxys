import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processQueuedDeliveries } from '@/server/campaigns/send';

export async function POST(
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

    // Process queued deliveries for this campaign
    const result = await processQueuedDeliveries(50);

    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error('Error processing deliveries:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process deliveries' },
      { status: 500 }
    );
  }
}

