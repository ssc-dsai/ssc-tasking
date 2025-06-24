import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  display_name: string;
}

export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const searchUsers = async (searchTerm: string, taskingId?: string) => {
    if (!session?.access_token) {
      setError('No authentication token available');
      return;
    }

    if (!searchTerm || searchTerm.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchTerm,
        limit: '10'
      });

      if (taskingId) {
        params.append('tasking_id', taskingId);
      }

      console.log('🔍 [useUserSearch] Searching for users:', searchTerm);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-users?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [useUserSearch] Server error:', errorData);
        throw new Error(`Failed to search users: ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ [useUserSearch] Found users:', result.data?.length || 0);
      
      setUsers(result.data || []);

    } catch (err: any) {
      console.error('❌ [useUserSearch] Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // This will be controlled by the component using this hook
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    users,
    isLoading,
    error,
    searchUsers,
  };
}; 