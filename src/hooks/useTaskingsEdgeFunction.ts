import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface TaskingFromEdgeFunction {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'shared';
  user_id: string;
  created_at: string;
  updated_at: string;
  files: Array<{
    id: string;
    name: string;
    file_size: number;
    mime_type: string;
    created_at: string;
  }>;
  briefings: Array<{
    id: string;
    title: string;
    summary: string;
    created_at: string;
  }>;
  file_count: number;
  briefing_count: number;
  last_activity: string;
}

interface TaskingsResponse {
  data: TaskingFromEdgeFunction[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

interface UseTaskingsEdgeFunctionOptions {
  limit?: number;
  offset?: number;
  category?: 'personal' | 'shared';
  search?: string;
}

export const useTaskingsEdgeFunction = (options: UseTaskingsEdgeFunctionOptions = {}) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['taskings-edge', user?.id, options],
    queryFn: async (): Promise<TaskingsResponse> => {
      if (!user) throw new Error('User not authenticated')

      // Get the current session to get the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('No valid session found')
      }

      // Build query parameters
      const params = new URLSearchParams()
      if (options.limit) params.append('limit', options.limit.toString())
      if (options.offset) params.append('offset', options.offset.toString())
      if (options.category) params.append('category', options.category)
      if (options.search) params.append('search', options.search)

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('get-taskings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        // For GET requests with query params, we need to use the URL approach
        // Since supabase.functions.invoke doesn't directly support query params
      })

      if (error) {
        console.error('Edge function error:', error)
        throw new Error(`Failed to fetch taskings: ${error.message}`)
      }

      return data as TaskingsResponse
    },
    enabled: !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes
  })
}

// Alternative approach using direct fetch for better query param support
export const useTaskingsEdgeFunctionDirect = (options: UseTaskingsEdgeFunctionOptions = {}) => {
  const { user, session } = useAuth()

  return useQuery({
    queryKey: ['taskings-edge-direct', user?.id, options],
    queryFn: async (): Promise<TaskingsResponse> => {
      console.log('🔍 [Edge Function] Starting call...', { user: !!user, session: !!session })
      
      if (!user) {
        console.log('❌ [Edge Function] No user found')
        throw new Error('User not authenticated')
      }

      if (!session) {
        console.log('❌ [Edge Function] No session found')
        throw new Error('No session available')
      }

      try {
        // Use the session directly from auth context
        console.log('🔑 [Edge Function] Using session from auth context...')
        const token = session.access_token
        
        if (!token) {
          console.log('❌ [Edge Function] No access token in session')
          throw new Error('No access token in session')
        }

        console.log('✅ [Edge Function] Got access token from session, length:', token.length)

        // Use the hardcoded URL we know works
        const edgeFunctionUrl = 'https://dwdznehxubvejbwngnud.supabase.co/functions/v1/get-taskings'
        console.log('🌐 [Edge Function] Calling URL:', edgeFunctionUrl)

        // Make the request with the exact same format that worked in browser
        const response = await fetch(edgeFunctionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        console.log('📡 [Edge Function] Response status:', response.status)

        if (!response.ok) {
          console.log('❌ [Edge Function] Response not ok:', response.status, response.statusText)
          const errorData = await response.text()
          console.log('❌ [Edge Function] Error body:', errorData)
          throw new Error(`HTTP ${response.status}: ${errorData}`)
        }

        const data = await response.json()
        console.log('✅ [Edge Function] Success response:', data)
        return data as TaskingsResponse
      } catch (error) {
        console.error('💥 [Edge Function] Caught error:', error)
        throw error
      }
    },
    enabled: !!user && !!session,
    staleTime: 30000,
    gcTime: 300000,
  })
} 