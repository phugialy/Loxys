import { NextRequest, NextResponse } from 'next/server';
import { tasks } from '@trigger.dev/sdk';
import type { processDeliveries } from '@/src/trigger/process-deliveries';

/**
 * Trigger the process-deliveries task
 * Can be called from cron or manually
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 50;

    // Trigger the task
    const handle = await tasks.trigger<typeof processDeliveries>(
      'process-deliveries',
      { batchSize }
    );

    return NextResponse.json({
      success: true,
      runId: handle.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error triggering process-deliveries task:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger task',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support GET for easy testing
export async function GET(request: NextRequest) {
  return POST(request);
}

