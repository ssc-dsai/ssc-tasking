import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log('get-tasking-details function loaded')

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the tasking ID from the URL
    const url = new URL(req.url)
    const taskingId = url.searchParams.get('id')
    
    if (!taskingId) {
      return new Response(
        JSON.stringify({ error: 'Tasking ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the user from the JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('User authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'User not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Fetching tasking details for:', taskingId, 'user:', user.id)

    // Get the main tasking with all related data
    const { data: tasking, error: taskingError } = await supabaseClient
      .from('taskings')
      .select(`
        *,
        files (
          id,
          name,
          file_path,
          file_size,
          mime_type,
          created_at,
          document_embeddings (
            id,
            content,
            metadata,
            created_at
          )
        ),
        briefings (
          id,
          title,
          summary,
          content,
          created_at,
          updated_at
        ),
        chat_messages!inner (
          id,
          sender,
          content,
          created_at
        )
      `)
      .eq('id', taskingId)
      .eq('user_id', user.id)
      .single()

    if (taskingError) {
      console.error('Database error:', taskingError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch tasking details', 
          details: taskingError.message 
        }),
        {
          status: taskingError.code === 'PGRST116' ? 404 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!tasking) {
      return new Response(
        JSON.stringify({ error: 'Tasking not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate summary statistics
    const fileCount = tasking.files?.length || 0
    const briefingCount = tasking.briefings?.length || 0
    const embeddingCount = tasking.files?.reduce((total, file) => 
      total + (file.document_embeddings?.length || 0), 0) || 0

    // Transform the data to include summary statistics
    const detailedTasking = {
      ...tasking,
      file_count: fileCount,
      briefing_count: briefingCount,
      embedding_count: embeddingCount,
      last_activity: tasking.updated_at || tasking.created_at,
      // Transform files to include embedding counts
      files: tasking.files?.map(file => ({
        ...file,
        embedding_count: file.document_embeddings?.length || 0,
        embeddings: file.document_embeddings || []
      }))
    }

    console.log('Successfully fetched tasking details:', {
      id: tasking.id,
      name: tasking.name,
      files: fileCount,
      briefings: briefingCount,
      embeddings: embeddingCount
    })

    return new Response(
      JSON.stringify({
        data: detailedTasking,
        summary: {
          file_count: fileCount,
          briefing_count: briefingCount,
          embedding_count: embeddingCount,
          total_file_size: tasking.files?.reduce((total, file) => total + file.file_size, 0) || 0
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