import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useShareTasking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  const shareTasking = async (taskingId: string, userId: string, action: 'add' | 'remove') => {
    if (!session?.access_token) {
      console.error('❌ [useShareTasking] No access token');
      return false;
    }

    setIsLoading(true);

    try {
      console.log(`🔄 [useShareTasking] ${action} user ${userId} for tasking ${taskingId}`);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-tasking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          tasking_id: taskingId,
          user_id: userId,
          action: action
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ [useShareTasking] Server error:', errorData);
        throw new Error(`Failed to ${action} user: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log(`✅ [useShareTasking] ${action} successful:`, data);
      return true;

    } catch (error: any) {
      console.error(`❌ [useShareTasking] Error:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (taskingId: string, userId: string) => {
    return shareTasking(taskingId, userId, 'add');
  };

  const removeUser = async (taskingId: string, userId: string) => {
    return shareTasking(taskingId, userId, 'remove');
  };

  return {
    addUser,
    removeUser,
    isLoading,
  };
}; 