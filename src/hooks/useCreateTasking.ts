import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './use-toast';

interface CreateTaskingRequest {
  name: string;
  description?: string;
  category?: 'personal' | 'shared';
}

interface CreateTaskingResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description: string | null;
    category: 'personal' | 'shared';
    user_id: string;
    created_at: string;
    updated_at: string;
  };
}

export const useCreateTasking = () => {
  const { session, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateTaskingRequest): Promise<CreateTaskingResponse> => {
      console.log('🔍 Session debug:', {
        loading,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        sessionKeys: session ? Object.keys(session) : [],
        accessTokenLength: session?.access_token?.length,
        sessionStructure: session ? {
          access_token: session.access_token ? `${session.access_token.substring(0, 20)}...` : 'missing',
          token_type: session.token_type,
          expires_in: session.expires_in
        } : null
      });

      if (loading) {
        throw new Error('Authentication still loading');
      }

      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      console.log('🚀 Calling create-tasking edge function with:', request);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-tasking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Edge function error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Tasking created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate taskings list to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['taskings'] });
      
      toast({
        title: "Tasking Created",
        description: `"${data.data.name}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to create tasking:', error);
      toast({
        title: "Failed to Create Tasking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}; 