import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { DEV } from '@/lib/log';
import React from 'react';

export interface ChatRow {
  id: string;
  tasking_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const useChatMessages = (taskingId: string) => {
  const { user, session } = useAuth();

  const isEnabled = !!taskingId && !!user && !!session;
  const didLog = React.useRef(false);
  if (DEV && !didLog.current) {
    console.log('[chat] init', { taskingId });
    didLog.current = true;
  }

  return useQuery({
    queryKey: ['chat-messages', taskingId, user?.id, session?.access_token],
    queryFn: async (): Promise<ChatRow[]> => {
      DEV && console.log('[chat] fetch');
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('tasking_id', taskingId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      DEV && console.log('[chat] fetched', data.length);
      return data as ChatRow[];
    },
    enabled: isEnabled,
    staleTime: 30000,
  });
}; 