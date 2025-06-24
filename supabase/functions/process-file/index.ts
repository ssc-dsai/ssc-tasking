import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

interface ChunkData {
  content: string;
  embedding: number[];
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    fileName: string;
    fileSize: number;
  };
}

// Function to extract text from PDF - server-side fallback only
async function extractTextFromPdf(fileBuffer: ArrayBuffer): Promise<string> {
  console.log('📄 [PDF Extract] Server-side PDF extraction - fallback only');
  console.log('⚠️ [PDF Extract] Client-side extraction should be preferred for better results');
  
  // Go directly to basic extraction since pdf.ts API was incorrect
  return await extractTextFromPdfBasic(fileBuffer);
}

// Fallback basic PDF text extraction
async function extractTextFromPdfBasic(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    console.log('📄 [PDF Extract] Using basic PDF text extraction');
    
    // Try multiple text decoders for better compatibility
    let pdfContent = '';
    try {
      // Try UTF-8 first
      pdfContent = new TextDecoder('utf-8').decode(fileBuffer);
    } catch {
      try {
        // Fallback to latin1
        pdfContent = new TextDecoder('latin1').decode(fileBuffer);
      } catch {
        // Last resort - ascii
        pdfContent = new TextDecoder('ascii').decode(fileBuffer);
      }
    }
    
    console.log(`📄 [PDF Extract] Decoded PDF content length: ${pdfContent.length}`);
    
    // Multiple extraction strategies
    const extractedTexts: string[] = [];
    
    // Strategy 1: Text in parentheses (most common)
    const parenthesesMatches = pdfContent.match(/\(([^)]+)\)/g);
    if (parenthesesMatches) {
      const parenthesesText = parenthesesMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .map(text => text
          .replace(/\\n/g, ' ')
          .replace(/\\r/g, ' ')
          .replace(/\\t/g, ' ')
          .replace(/\\\\/g, '\\')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
        )
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (parenthesesText.length > 10) {
        extractedTexts.push(parenthesesText);
        console.log(`📄 [PDF Extract] Parentheses strategy: ${parenthesesText.length} chars`);
      }
    }
    
    // Strategy 2: Text between 'BT' and 'ET' markers (text objects)
    const btEtMatches = pdfContent.match(/BT\s+.*?ET/gs);
    if (btEtMatches) {
      const btEtText = btEtMatches
        .map(match => {
          // Extract text from PDF text commands
          const textCommands = match.match(/\([^)]*\)\s*Tj/g);
          if (textCommands) {
            return textCommands
              .map(cmd => cmd.match(/\(([^)]*)\)/)?.[1] || '')
              .filter(text => text.length > 0)
              .join(' ');
          }
          return '';
        })
        .filter(text => text.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (btEtText.length > 10) {
        extractedTexts.push(btEtText);
        console.log(`📄 [PDF Extract] BT/ET strategy: ${btEtText.length} chars`);
      }
    }
    
    // Choose the best extraction result
    const bestText = extractedTexts.reduce((best, current) => 
      current.length > best.length ? current : best, '');
    
    if (bestText.length > 10) {
      console.log(`📄 [PDF Extract] Best extraction: ${bestText.length} chars`);
      console.log(`📄 [PDF Extract] Sample: "${bestText.substring(0, 200)}..."`);
      return bestText;
    }
    
    console.log('⚠️ [PDF Extract] No readable text found with basic extraction');
    return "No readable text could be extracted from this PDF using server-side extraction. The PDF may be image-based, encrypted, or use complex formatting. Please ensure client-side extraction is working properly.";
    
  } catch (error) {
    console.error('❌ [PDF Extract] Basic extraction failed:', error);
    return `Server-side PDF extraction failed: ${error.message}. Please ensure client-side extraction is working.`;
  }
}

// Function to extract text from TXT
function extractTextFromTxt(fileBuffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(fileBuffer);
}

// Function to clean text content of problematic characters
function cleanText(text: string): string {
  return text
    // Remove null bytes and other control characters except newlines, tabs, and carriage returns
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    // Remove any remaining problematic Unicode sequences
    .replace(/\uFFFD/g, '') // Remove replacement characters
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

// Function to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = 2000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  
  // First try to split by paragraphs for better semantic chunking
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (trimmedParagraph.length === 0) continue;
    
    // If this paragraph alone is larger than max chunk size, split it by sentences
    if (trimmedParagraph.length > maxChunkSize) {
      // Save current chunk if it has content
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      // Split large paragraph by sentences
      const sentences = trimmedParagraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let sentenceChunk = '';
      
      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.length === 0) continue;
        
        if (sentenceChunk.length + trimmedSentence.length > maxChunkSize && sentenceChunk.length > 0) {
          chunks.push(sentenceChunk.trim());
          sentenceChunk = trimmedSentence;
        } else {
          sentenceChunk += (sentenceChunk.length > 0 ? '. ' : '') + trimmedSentence;
        }
      }
      
      if (sentenceChunk.trim().length > 0) {
        currentChunk = sentenceChunk.trim();
      }
    } else {
      // If adding this paragraph would exceed the chunk size, save current chunk
      if (currentChunk.length + trimmedParagraph.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Start new chunk with some overlap from the previous chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 10)); // Rough overlap
        currentChunk = overlapWords.join(' ') + '\n\n' + trimmedParagraph;
      } else {
        currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + trimmedParagraph;
      }
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  console.log(`📝 [Process File] Text chunking: ${text.length} chars -> ${chunks.length} chunks (avg ${Math.round(text.length / chunks.length)} chars/chunk)`);
  
  return chunks.length > 0 ? chunks : [text]; // Fallback to original text if no chunks
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

    // Get file ID and extracted text from request body
    const { fileId, extractedText: preExtractedText } = await req.json()
    
    if (!fileId) {
      return new Response(
        JSON.stringify({ error: 'Missing fileId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    console.log('🔄 [Process File] Processing file:', fileId)
    console.log('📝 [Process File] Has pre-extracted text:', !!preExtractedText, preExtractedText ? `(${preExtractedText.length} chars)` : '')

    // Get file record from database
    const { data: fileRecord, error: fileError } = await supabase
      .from('files')
      .select(`
        id,
        name,
        file_path,
        file_size,
        mime_type,
        tasking_id,
        taskings!inner(user_id)
      `)
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Check if user has access to the file (owner or shared user)
    const isOwner = fileRecord.taskings.user_id === user.id;
    
    let isSharedUser = false;
    if (!isOwner) {
      const { data: sharedTasking } = await supabase
        .from('shared_taskings')
        .select('id')
        .eq('tasking_id', fileRecord.tasking_id)
        .eq('user_id', user.id)
        .single();
      
      isSharedUser = !!sharedTasking;
    }
    
    if (!isOwner && !isSharedUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(fileRecord.file_path)

    if (downloadError || !fileData) {
      return new Response(
        JSON.stringify({ error: 'Failed to download file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    // Extract text - use pre-extracted text if available, otherwise extract from file
    let extractedText: string;
    
    if (preExtractedText) {
      console.log('📝 [Process File] Using pre-extracted text from client');
      extractedText = preExtractedText;
    } else {
      console.log('📝 [Process File] Extracting text from file on server');
      
      // Convert to ArrayBuffer
      const fileBuffer = await fileData.arrayBuffer()

      // Extract text based on file type
      if (fileRecord.mime_type === 'application/pdf') {
        extractedText = await extractTextFromPdf(fileBuffer);
      } else {
        return new Response(
          JSON.stringify({ error: 'Only PDF files are supported. Please upload a PDF file.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
        )
      }
    }

    console.log('📝 [Process File] Raw extracted text length:', extractedText.length)
    
    // Clean the extracted text to remove problematic characters
    extractedText = cleanText(extractedText);
    console.log('📝 [Process File] Cleaned text length:', extractedText.length)

    // Chunk the text
    const chunks = chunkText(extractedText);
    console.log('📝 [Process File] Created chunks:', chunks.length)

    // Process each chunk
    const chunkData: ChunkData[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Safety check: skip chunks that are too long (rough token estimation: 1 token ≈ 4 chars)
        const estimatedTokens = Math.ceil(chunk.length / 4);
        if (estimatedTokens > 7000) {
          console.log(`⚠️ [Process File] Skipping chunk ${i + 1} - too large (${estimatedTokens} estimated tokens)`);
          continue;
        }
        
        const embedding = await getEmbedding(chunk);
        
        chunkData.push({
          content: cleanText(chunk), // Clean chunk content before storing
          embedding,
          metadata: {
            chunkIndex: i,
            totalChunks: chunks.length,
            fileName: fileRecord.name,
            fileSize: fileRecord.file_size
          }
        });
        
        console.log(`✅ [Process File] Processed chunk ${i + 1}/${chunks.length} (${estimatedTokens} est. tokens)`);
        
        // Add small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ [Process File] Error processing chunk ${i}:`, error);
        // Continue with other chunks
      }
    }

    console.log('💾 [Process File] Storing embeddings in database');

    // Store embeddings in database
    const embeddings = chunkData.map(chunk => ({
      file_id: fileId,
      content: chunk.content,
      embedding: chunk.embedding, // Store as array for vector type
      metadata: chunk.metadata
    }));

    const { error: insertError } = await supabase
      .from('document_embeddings')
      .insert(embeddings);

    if (insertError) {
      console.error('❌ [Process File] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store embeddings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
      )
    }

    console.log('✅ [Process File] Successfully processed file with', chunkData.length, 'embeddings');

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksProcessed: chunkData.length,
        textLength: extractedText.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )

  } catch (error) {
    console.error('💥 [Process File] Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    )
  }
})