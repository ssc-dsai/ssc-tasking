import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ [Upload File] No authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('❌ [Upload File] Authentication failed:', userError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ [Upload File] Authenticated user:', user.id)

    // Get tasking ID from query params
    const url = new URL(req.url)
    const taskingId = url.searchParams.get('tasking_id')
    
    if (!taskingId) {
      return new Response(
        JSON.stringify({ error: 'Missing tasking_id parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify the tasking belongs to the user
    const { data: tasking, error: taskingError } = await supabase
      .from('taskings')
      .select('id, user_id')
      .eq('id', taskingId)
      .eq('user_id', user.id)
      .single()

    if (taskingError || !tasking) {
      console.log('❌ [Upload File] Tasking not found or unauthorized:', taskingError)
      return new Response(
        JSON.stringify({ error: 'Tasking not found or unauthorized' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📁 [Upload File] Processing file:', file.name, 'Size:', file.size)

    // Generate a unique file path following the user_id/tasking_id/filename pattern
    const fileName = `${user.id}/${taskingId}/${Date.now()}_${file.name}`
    console.log('📁 [Upload File] Generated file path:', fileName)
    
    // Upload file to Supabase Storage
    console.log('📁 [Upload File] Attempting storage upload to documents bucket...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    console.log('📁 [Upload File] Storage upload result:', { uploadData, uploadError })

    if (uploadError) {
      console.log('❌ [Upload File] Storage upload failed:', uploadError)
      return new Response(
        JSON.stringify({ error: 'File upload failed', details: uploadError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ [Upload File] File uploaded to storage:', uploadData.path)

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(uploadData.path)

    // Create database record
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        tasking_id: taskingId,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      console.log('❌ [Upload File] Database insert failed:', dbError)
      // Try to cleanup the uploaded file
      await supabase.storage.from('documents').remove([uploadData.path])
      
      return new Response(
        JSON.stringify({ error: 'Database record creation failed', details: dbError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ [Upload File] File record created:', fileRecord.id)

    // Return success response
    const response = {
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        file_path: fileRecord.file_path,
        file_size: fileRecord.file_size,
        mime_type: fileRecord.mime_type,
        created_at: fileRecord.created_at,
        public_url: urlData.publicUrl
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 [Upload File] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 