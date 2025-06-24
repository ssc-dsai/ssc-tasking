import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface SaveBriefingRequest {
  tasking_id: string
  title: string
  content: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with the user's token
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the request body
    const body: SaveBriefingRequest = await req.json()
    const { tasking_id, title, content } = body

    // Validate required fields
    if (!tasking_id || !title || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tasking_id, title, content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`📄 [save-briefing] Saving briefing "${title}" for tasking ${tasking_id}`)

    // Verify the user has access to the tasking (owner or shared user)
    // Let RLS policies handle access control
    const { data: tasking, error: taskingError } = await supabaseClient
      .from('taskings')
      .select('id, user_id')
      .eq('id', tasking_id)
      .single()

    if (taskingError || !tasking) {
      console.error('Tasking verification error:', taskingError)
      return new Response(
        JSON.stringify({ error: 'Tasking not found or access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Insert the briefing
    const { data: briefing, error: insertError } = await supabaseClient
      .from('briefings')
      .insert({
        title,
        content,
        tasking_id,
        created_by: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save briefing', details: insertError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ [save-briefing] Successfully saved briefing ${briefing.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        briefing: {
          id: briefing.id,
          title: briefing.title,
          content: briefing.content,
          created_at: briefing.created_at,
          updated_at: briefing.updated_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 