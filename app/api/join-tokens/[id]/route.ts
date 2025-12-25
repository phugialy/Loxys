import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  updateJoinToken,
  deactivateJoinToken,
  activateJoinToken,
  regenerateJoinToken,
} from '@/server/join-tokens/service';

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

    // Handle specific actions
    if (body.action === 'deactivate') {
      const token = await deactivateJoinToken(id);
      return NextResponse.json({ token });
    }

    if (body.action === 'activate') {
      const token = await activateJoinToken(id);
      return NextResponse.json({ token });
    }

    if (body.action === 'regenerate') {
      const token = await regenerateJoinToken(id);
      return NextResponse.json({ token });
    }

    // Regular update
    const token = await updateJoinToken(id, body);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error updating join token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update join token' },
      { status: 500 }
    );
  }
}

