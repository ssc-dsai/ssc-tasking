import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SharedUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  shared_at: string;
  shared_by: string;
}

export const useSharedUsers = (taskingId: string) => {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchSharedUsers = async () => {
    if (!session?.access_token || !taskingId) {
      console.log('👥 [useSharedUsers] No session or taskingId, skipping fetch');
      setSharedUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('👥 [useSharedUsers] Fetching shared users for tasking:', taskingId);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/share-tasking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'get',
          tasking_id: taskingId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shared users');
      }

      const data = await response.json();
      console.log('👥 [useSharedUsers] Fetched shared users:', data.users?.length || 0);
      console.log('👥 [useSharedUsers] Full user data:', data.users);
      
      setSharedUsers(data.users || []);

    } catch (err: any) {
      console.error('❌ [useSharedUsers] Error fetching shared users:', err);
      setError(err.message || 'Failed to fetch shared users');
      setSharedUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedUsers();
  }, [taskingId, session?.access_token]);

  return {
    sharedUsers,
    isLoading,
    error,
    refetch: fetchSharedUsers,
  };
}; 