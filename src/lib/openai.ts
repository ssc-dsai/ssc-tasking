export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY as string;

if (!OPENAI_API_KEY) {
  console.warn('Missing VITE_OPENAI_API_KEY environment variable');
}

export async function getChatCompletion(messages: ChatMessage[]): Promise<string> {
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

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const aiMessage: string = data.choices[0].message.content;
  return aiMessage;
} 