// @ts-nocheck
// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

interface IncomingPayload {
  tasking_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ [SaveChat] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Init client with user's JWT
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ [SaveChat] Auth failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [SaveChat] Authenticated user:', user.id);

    // Parse body
    const payload: IncomingPayload = await req.json();
    const { tasking_id, sender, content, tokens } = payload;

    if (!tasking_id || !sender || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership of tasking
    const { data: tasking, error: taskingError } = await supabase
      .from('taskings')
      .select('id')
      .eq('id', tasking_id)
      .eq('user_id', user.id)
      .single();

    if (taskingError || !tasking) {
      console.log('❌ [SaveChat] Tasking not found or unauthorized:', taskingError);
      return new Response(
        JSON.stringify({ error: 'Tasking not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to bypass RLS for insert (after verifying user)
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!serviceKey) {
      console.error('❌ [SaveChat] Missing service role key env');
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);
    // Attach service role bearer so RLS is bypassed
    admin.rest.headers = { ...admin.rest.headers, Authorization: `Bearer ${serviceKey}` };

    const { data: message, error: insertError } = await admin
      .from('chat_messages')
      .insert({
        tasking_id,
        sender,
        content,
        tokens: tokens ?? null
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ [SaveChat] Insert failed:', insertError);
      return new Response(
        JSON.stringify({ error: 'Insert failed', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ [SaveChat] Message stored, id:', message.id);

    return new Response(
      JSON.stringify({ success: true, message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('💥 [SaveChat] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 