import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from Get Taskings Function!")

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const category = url.searchParams.get('category') // 'personal' or 'shared'
    const search = url.searchParams.get('search')

    // Build the query
    let query = supabaseClient
      .from('taskings')
      .select(`
        *,
        files (
          id,
          name,
          file_size,
          mime_type,
          created_at
        ),
        briefings (
          id,
          title,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: taskings, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch taskings', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Transform the data to match the expected format
    const transformedTaskings = taskings?.map(tasking => ({
      ...tasking,
      file_count: tasking.files?.length || 0,
      briefing_count: tasking.briefings?.length || 0,
      last_activity: tasking.updated_at || tasking.created_at,
    })) || []

    // Get total count for pagination
    const { count: totalCount } = await supabaseClient
      .from('taskings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({
        data: transformedTaskings,
        pagination: {
          total: totalCount || 0,
          limit,
          offset,
          has_more: (offset + limit) < (totalCount || 0)
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 