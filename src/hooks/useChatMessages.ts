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
    queryKey: ['chat-messages', taskingId, user?.id],
    queryFn: async (): Promise<ChatRow[]> => {
      DEV && console.log('[chat] fetch for tasking:', taskingId);
      DEV && console.log('[chat] user:', user?.id);
      DEV && console.log('[chat] session exists:', !!session);
      
             try {
         const { data, error } = await supabase
           .from('chat_messages')
           .select('*')
           .eq('tasking_id', taskingId)
           .order('created_at', { ascending: true });
           
         DEV && console.log('[chat] query result:', { data, error });
         
         if (error) {
           console.error('[chat] query error:', error);
           throw error;
         }
         
         DEV && console.log('[chat] fetched', data?.length || 0, 'messages');
         return data || [];
       } catch (err) {
         console.error('[chat] fetch error:', err);
         throw err;
       }
    },
    enabled: isEnabled,
    staleTime: 30000,
    retry: 1,
  });
}; 