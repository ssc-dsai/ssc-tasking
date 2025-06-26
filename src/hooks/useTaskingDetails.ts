import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'

// Types for the detailed tasking response
interface DocumentEmbedding {
  id: string;
  content: string;
  metadata: any;
  created_at: string;
}

interface TaskingFile {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  embedding_count: number;
  embeddings: DocumentEmbedding[];
}

interface TaskingBriefing {
  id: string;
  title: string;
  summary: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface SharedUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  shared_at: string;
  shared_by: string;
}

interface DetailedTasking {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'shared';
  user_id: string;
  created_at: string;
  updated_at: string;
  file_count: number;
  briefing_count: number;
  embedding_count: number;
  last_activity: string;
  files: TaskingFile[];
  briefings: TaskingBriefing[];
  shared_users: SharedUser[];
  owner?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface TaskingDetailsResponse {
  data: DetailedTasking;
  summary: {
    file_count: number;
    briefing_count: number;
    embedding_count: number;
    total_file_size: number;
  };
}

interface UseTaskingDetailsOptions {
  enabled?: boolean;
}

export const useTaskingDetails = (taskingId: string, options: UseTaskingDetailsOptions = {}) => {
  const { user, session } = useAuth()

  return useQuery({
    queryKey: ['tasking-details', taskingId, user?.id],
    queryFn: async (): Promise<TaskingDetailsResponse> => {
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!session) {
        throw new Error('No session available')
      }

      try {
        const token = session.access_token
        
        if (!token) {
          throw new Error('No access token in session')
        }

        const edgeFunctionUrl = `https://dwdznehxubvejbwngnud.supabase.co/functions/v1/get-tasking-details?id=${taskingId}`

        const response = await fetch(edgeFunctionUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.text()
          throw new Error(`HTTP ${response.status}: ${errorData}`)
        }

        const data = await response.json()
        return data as TaskingDetailsResponse
      } catch (error) {
        console.error('Tasking Details error:', error)
        throw error
      }
    },
    enabled: !!user && !!session && !!taskingId && (options.enabled !== false),
    staleTime: 30000,
    gcTime: 300000,
  })
}

export type { DetailedTasking, TaskingFile, TaskingBriefing, DocumentEmbedding, TaskingDetailsResponse, SharedUser } 