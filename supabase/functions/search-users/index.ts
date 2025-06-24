import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

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

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const searchTerm = url.searchParams.get('q') || ''
    const taskingId = url.searchParams.get('tasking_id')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    if (!searchTerm || searchTerm.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Search term must be at least 2 characters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔍 [search-users] Searching for users with term: "${searchTerm}", tasking: ${taskingId}`)

    // Use the database function to search users
    const { data: users, error: searchError } = await supabaseClient
      .rpc('search_users_for_sharing', {
        search_term: searchTerm,
        limit_count: limit
      })

    if (searchError) {
      console.error('❌ [search-users] Search error:', searchError)
      return new Response(
        JSON.stringify({ error: 'Failed to search users', details: searchError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔍 [search-users] Raw search results:`, users?.length || 0, 'users found')

    // If tasking_id is provided, exclude users who already have access
    let filteredUsers = users || []
    if (taskingId && filteredUsers.length > 0) {
      console.log(`🔍 [search-users] Filtering for tasking: ${taskingId}`)
      
      // Get users who already have access to this tasking
      const { data: existingShares, error: sharesError } = await supabaseClient
        .from('shared_taskings')
        .select('user_id')
        .eq('tasking_id', taskingId)

      if (!sharesError && existingShares) {
        const existingUserIds = existingShares.map(share => share.user_id)
        console.log(`🔍 [search-users] Excluding ${existingUserIds.length} already shared users`)
        filteredUsers = filteredUsers.filter(user => !existingUserIds.includes(user.id))
      }

      // Also exclude the tasking owner
      const { data: tasking, error: taskingError } = await supabaseClient
        .from('taskings')
        .select('user_id')
        .eq('id', taskingId)
        .single()

      if (!taskingError && tasking) {
        console.log(`🔍 [search-users] Excluding tasking owner: ${tasking.user_id}`)
        filteredUsers = filteredUsers.filter(user => user.id !== tasking.user_id)
      }
    }

    console.log(`✅ [search-users] Returning ${filteredUsers.length} filtered users`)

    // Transform the results to ensure consistent structure
    const transformedUsers = filteredUsers.map(user => ({
      id: user.id,
      email: user.email || '',
      full_name: user.full_name || user.email || '',
      avatar_url: user.avatar_url || null,
      display_name: user.full_name || user.email || 'Unknown User'
    }))

    return new Response(
      JSON.stringify({ 
        data: transformedUsers
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ [search-users] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 