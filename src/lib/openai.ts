import { DEV } from '@/lib/log';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
      max_tokens: 512
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