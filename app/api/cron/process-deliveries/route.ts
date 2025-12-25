import { NextRequest, NextResponse } from 'next/server';
import { processQueuedDeliveries } from '@/server/campaigns/send';

/**
 * Cron endpoint to process queued deliveries
 * Can be called by Vercel Cron, Upstash Cron, or any scheduler
 * 
 * To secure this endpoint, add a secret header check:
 * if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Process deliveries in batches
    const result = await processQueuedDeliveries(50);

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      success: true,
    });
  } catch (error) {
    console.error('Error processing deliveries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process deliveries',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for flexibility
export const POST = GET;

