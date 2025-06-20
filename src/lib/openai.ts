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
    content: `You are a friendly AI assistant that chats about uploaded documents. Be conversational, helpful, and personable.

DOCUMENT CONTEXT:
${contextText}

Instructions:
- Chat naturally like you're talking to a friend or colleague
- Keep responses concise and easy to read
- Use casual language and contractions (I'll, you're, here's, etc.)
- Start responses with friendly phrases like "Hey!", "Sure thing!", "Absolutely!", "Great question!"
- Break up long responses with line breaks for easy reading
- If you can't find something in the docs, just say "I don't see that info in your documents" or similar
- Be enthusiastic and helpful without being overly formal or robotic
- Feel free to ask follow-up questions to be more helpful`
  };

  // Combine system message with user messages
  const messagesWithContext = [systemMessage, ...messages];

  return getChatCompletion(messagesWithContext);
} 