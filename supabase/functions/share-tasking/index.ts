import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ShareTaskingRequest {
  tasking_id: string
  user_id?: string
  action: 'add' | 'remove' | 'get'
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
    const body: ShareTaskingRequest = await req.json()
    const { tasking_id, user_id, action } = body

    // Validate required fields
    if (!tasking_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: tasking_id, action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate user_id for actions that need it
    if (['add', 'remove'].includes(action) && !user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required for add and remove actions' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`🔄 [share-tasking] ${action} ${user_id ? `user ${user_id}` : ''} for tasking ${tasking_id}`)

    // Handle the sharing action
    let result;
    let message;

    switch (action) {
      case 'add':
        // Add user to shared tasking
        const { data: addData, error: addError } = await supabaseClient
          .from('shared_taskings')
          .insert({
            tasking_id,
            user_id,
            shared_by: user.id,
          })
          .select()
          .single()

        if (addError) {
          console.error('Add share error:', addError)
          return new Response(
            JSON.stringify({ error: 'Failed to share tasking', details: addError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        result = addData
        message = `Successfully shared tasking`
        break

      case 'remove':
        // Remove user from shared tasking
        const { data: removeData, error: removeError } = await supabaseClient
          .from('shared_taskings')
          .delete()
          .eq('tasking_id', tasking_id)
          .eq('user_id', user_id)
          .select()

        if (removeError) {
          console.error('Remove share error:', removeError)
          return new Response(
            JSON.stringify({ error: 'Failed to remove share', details: removeError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        result = removeData
        message = `Successfully removed user from tasking`
        break

      case 'get':
        // Get shared users for a tasking
        const { data: sharedUsers, error: getError } = await supabaseClient
          .from('shared_taskings')
          .select(`
            user_id,
            created_at,
            shared_by
          `)
          .eq('tasking_id', tasking_id)

        if (getError) {
          console.error('Get shared users error:', getError)
          return new Response(
            JSON.stringify({ error: 'Failed to get shared users', details: getError.message }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Get profile data for each user
        const userProfiles = []
        for (const share of sharedUsers || []) {
          console.log(`🔍 [share-tasking] Looking up profile for user ID: ${share.user_id}`)
          
          // Try to get user profile from profiles table
          const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', share.user_id)
            .single()

          console.log(`📋 [share-tasking] Profile query result:`, { profile, profileError })

          if (profile) {
            console.log(`✅ [share-tasking] Found profile data:`, profile)
            userProfiles.push({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name || profile.email,
              avatar_url: profile.avatar_url,
              shared_at: share.created_at,
              shared_by: share.shared_by,
            })
          } else {
            console.log(`❌ [share-tasking] No profile found for user ${share.user_id}, using fallback`)
            // Fallback if no profile found
            userProfiles.push({
              id: share.user_id,
              email: 'No email available',
              full_name: 'User',
              avatar_url: null,
              shared_at: share.created_at,
              shared_by: share.shared_by,
            })
          }
        }

        console.log(`✅ [share-tasking] Found ${userProfiles.length} shared users`)

        return new Response(
          JSON.stringify({ 
            success: true, 
            users: userProfiles
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be add, remove, or get' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    console.log(`✅ [share-tasking] ${message}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message,
        data: result
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