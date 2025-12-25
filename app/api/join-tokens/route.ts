import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getJoinTokens,
  createJoinToken,
} from '@/server/join-tokens/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokens = await getJoinTokens();

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('Error fetching join tokens:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch join tokens' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const token = await createJoinToken(body);

    return NextResponse.json({ token }, { status: 201 });
  } catch (error) {
    console.error('Error creating join token:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create join token' },
      { status: 500 }
    );
  }
}

