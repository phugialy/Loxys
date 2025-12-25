/**
 * Test Supabase connection
 * Run this to verify environment variables are set correctly
 */

export async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Check .env.local file.'
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection by fetching a simple query
  const { data, error } = await supabase.from('_realtime').select('*').limit(1);

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "relation does not exist" which is fine for connection test
    console.error('Connection test error:', error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    url: supabaseUrl,
    message: 'Supabase connection successful',
  };
}

