import { DEV } from '@/lib/log';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  similarity: number;
  metadata: {
    fileName: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

if (!OPENAI_API_KEY) {
  console.warn('Missing VITE_OPENAI_API_KEY environment variable');
}

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
  const startTime = Date.now();
  if (DEV) {
    console.log('[openai] req', messages.length, 'msgs');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1024 // Increased for better responses with context
    })
  });

  const elapsed = Date.now() - startTime;
  DEV && console.log(`[openai] ${response.status} in ${elapsed}ms`);

  if (!response.ok) {
    const err = await response.text();
    DEV && console.error('[openai] error', err);
    throw new Error(`OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  DEV && console.log('[openai] ok');

  const aiMessage: string = data.choices[0].message.content;
  return aiMessage;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const startTime = Date.now();
  if (DEV) {
    console.log('[openai] embedding req for text length:', text.length);
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    })
  });

  const elapsed = Date.now() - startTime;
  DEV && console.log(`[openai] embedding ${response.status} in ${elapsed}ms`);

  if (!response.ok) {
    const err = await response.text();
    DEV && console.error('[openai] embedding error', err);
    throw new Error(`OpenAI embeddings error ${response.status}: ${err}`);
  }

  const data = await response.json();
  DEV && console.log('[openai] embedding ok');

  return data.data[0].embedding;
}

export async function getChatCompletionWithContext(
  messages: ChatMessage[], 
  relevantContext: DocumentChunk[]
): Promise<string> {
  // Create a system message with the relevant context
  const contextText = relevantContext
    .map((chunk, index) => 
      `Document ${index + 1} (${chunk.metadata.fileName}, similarity: ${chunk.similarity.toFixed(3)}):\n${chunk.content}`
    )
    .join('\n\n---\n\n');

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are a helpful AI assistant that answers questions based on uploaded documents in a friendly, conversational way.

DOCUMENT CONTEXT:
${contextText}

Instructions:
- Answer in a natural, conversational tone like you're chatting with a colleague
- Use proper paragraph breaks and line spacing for readability
- When listing multiple points, add a blank line between each point
- Use the document content to provide accurate information
- If you can't find the answer in the documents, just say so naturally
- Be helpful and direct without being overly formal
- Format your response with clear spacing to make it easy to read`
  };

  // Combine system message with user messages
  const messagesWithContext = [systemMessage, ...messages];

  return getChatCompletion(messagesWithContext);
} 