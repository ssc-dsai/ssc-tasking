import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Create Tasking function up and running!")

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

    console.log('Authenticated user:', user.id)

    // Parse request body
    const { name, description, category = 'personal' } = await req.json()

    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Name is required and must be a string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Creating tasking:', { name, description, category, user_id: user.id })

    // Create the tasking
    const { data: tasking, error: taskingError } = await supabaseClient
      .from('taskings')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category,
        user_id: user.id,
      })
      .select()
      .single()

    if (taskingError) {
      console.error('Database error creating tasking:', taskingError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create tasking',
          details: taskingError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Successfully created tasking:', tasking.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        data: tasking 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 