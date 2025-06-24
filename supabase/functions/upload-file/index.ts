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

    // Verify the user has access to the tasking (owner or shared user)
    // Let RLS policies handle access control
    const { data: tasking, error: taskingError } = await supabase
      .from('taskings')
      .select('id, user_id')
      .eq('id', taskingId)
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
    const extractedText = formData.get('extractedText') as string | null
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate file type - only accept PDF files
    const fileType = file.type.toLowerCase();
    const fileNameLower = file.name.toLowerCase();
    
    if (fileType !== 'application/pdf' && !fileNameLower.endsWith('.pdf')) {
      console.log('❌ [Upload File] Invalid file type:', fileType, 'for file:', file.name)
      return new Response(
        JSON.stringify({ error: 'Only PDF files are supported. Please upload a PDF file.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('📁 [Upload File] Processing file:', file.name, 'Size:', file.size)
    console.log('📝 [Upload File] Has extracted text:', !!extractedText, extractedText ? `(${extractedText.length} chars)` : '')

    // Sanitize filename to prevent InvalidKey errors
    const sanitizeFilename = (filename: string): string => {
      // Replace special characters and spaces with underscores
      return filename
        .replace(/[™®©]/g, '') // Remove trademark symbols
        .replace(/[^\w\-_.]/g, '_') // Replace special chars with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    }

    const sanitizedFileName = sanitizeFilename(file.name)
    console.log('📁 [Upload File] Original filename:', file.name)
    console.log('📁 [Upload File] Sanitized filename:', sanitizedFileName)

    // Generate a unique file path following the tasking_id/filename pattern
    // This matches the storage policies that expect tasking_id as the first folder
    const fileName = `${taskingId}/${Date.now()}_${sanitizedFileName}`
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

    // Trigger file processing for vectorization
    try {
      console.log('🔄 [Upload File] Triggering file processing for fileId:', fileRecord.id)
      const processUrl = `${supabaseUrl}/functions/v1/process-file`
      console.log('🔄 [Upload File] Process URL:', processUrl)
      
      const processResponse = await fetch(processUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ 
          fileId: fileRecord.id,
          extractedText: extractedText || undefined
        })
      })
      
      console.log('📡 [Upload File] Process response status:', processResponse.status)
      
      if (processResponse.ok) {
        const processResult = await processResponse.json()
        console.log('✅ [Upload File] File processing triggered successfully:', processResult)
      } else {
        const processError = await processResponse.text()
        console.log('⚠️ [Upload File] File processing trigger failed:', processError)
        console.log('⚠️ [Upload File] Process response status:', processResponse.status)
      }
    } catch (processError) {
      console.log('⚠️ [Upload File] File processing trigger error:', processError)
      console.log('⚠️ [Upload File] Error details:', processError instanceof Error ? processError.message : 'Unknown error')
      // Don't fail the upload if processing fails
    }

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