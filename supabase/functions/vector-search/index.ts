import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

interface SearchResult {
  id: string;
  file_id: string;
  content: string;
  similarity: number;
  metadata: {
    fileName: string;
    chunkIndex: number;
    totalChunks: number;
    fileSize: number;
  };
}

// Function to get embeddings from OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embeddings error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
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
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Get search parameters from request body
    const { query, taskingId, maxResults = 5, threshold = 0.3 } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    console.log('🔍 [Vector Search] Searching for:', query, 'in tasking:', taskingId)

    // Get embedding for the search query
    const queryEmbedding = await getEmbedding(query);
    console.log('🔍 [Vector Search] Query embedding generated');

    // Perform vector similarity search using the database function
    const { data: searchResults, error: searchError } = await supabase
      .rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: maxResults,
        filter_tasking_id: taskingId || null
      });

    if (searchError) {
      console.error('❌ [Vector Search] Search error:', searchError);
      return new Response(
        JSON.stringify({ error: 'Vector search failed', details: searchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    console.log('✅ [Vector Search] Found', searchResults?.length || 0, 'results');

    // Enrich results with file metadata
    const enrichedResults: SearchResult[] = [];
    
    if (searchResults && searchResults.length > 0) {
      // Get file information for all results
      const fileIds = [...new Set(searchResults.map((r: any) => r.file_id))];
      
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('id, name, file_size')
        .in('id', fileIds);

      if (filesError) {
        console.error('❌ [Vector Search] Files query error:', filesError);
      }

      const fileMap = new Map(files?.map(f => [f.id, f]) || []);

      for (const result of searchResults) {
        const file = fileMap.get(result.file_id);
        
        enrichedResults.push({
          id: result.id,
          file_id: result.file_id,
          content: result.content,
          similarity: result.similarity,
          metadata: {
            fileName: file?.name || 'Unknown File',
            chunkIndex: result.metadata?.chunkIndex || 0,
            totalChunks: result.metadata?.totalChunks || 1,
            fileSize: file?.file_size || 0
          }
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: enrichedResults,
        query,
        resultCount: enrichedResults.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('💥 [Vector Search] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
}) 