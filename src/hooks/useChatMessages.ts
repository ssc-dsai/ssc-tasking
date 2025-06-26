import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  return useQuery({
    queryKey: ['chat-messages', taskingId, user?.id],
    queryFn: async (): Promise<ChatRow[]> => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('tasking_id', taskingId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('[chat] query error:', error);
          throw error;
        }
        
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