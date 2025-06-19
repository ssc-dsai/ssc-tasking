import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'

export interface Briefing {
  id: string;
  title: string;
  summary: string;
  content: string;
  tasking_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type BriefingInsert = Database['public']['Tables']['briefings']['Insert']
type BriefingUpdate = Database['public']['Tables']['briefings']['Update']

export const useBriefings = (taskingId?: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['briefings', taskingId, user?.id],
    queryFn: async (): Promise<Briefing[]> => {
      console.log('📄 [useBriefings] QueryFn called with:', { taskingId, userId: user?.id });
      
      if (!taskingId || !user) {
        console.log('📄 [useBriefings] Skipping fetch - no taskingId or user')
        return []
      }

      console.log('📄 [useBriefings] Fetching briefings for tasking:', taskingId, 'user:', user.id)

      console.log('📄 [useBriefings] Starting query...')
      
      try {
        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .eq('tasking_id', taskingId)
          .order('created_at', { ascending: false })
        
        console.log('📄 [useBriefings] Query completed - data:', data?.length, 'error:', error)

        if (error) {
          console.error('❌ [useBriefings] Error fetching briefings:', error)
          throw error
        }

        console.log('✅ [useBriefings] Fetched', data?.length || 0, 'briefings')
        return data || []
      } catch (err) {
        console.error('📄 [useBriefings] Query exception:', err)
        throw err
      }
    },
    enabled: !!taskingId && !!user,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 1, // Reduce retries to see errors faster
    retryDelay: 500, // Faster retry
  })
}

export const useBriefing = (id: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['briefing', id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('briefings')
        .select(`
          *,
          taskings (
            id,
            name,
            description
          )
        `)
        .eq('id', id)
        .eq('created_by', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user && !!id,
  })
}

export const useTaskingBriefings = (taskingId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['briefings', 'tasking', taskingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('tasking_id', taskingId)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user && !!taskingId,
  })
}

export const useCreateBriefing = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (briefing: Omit<BriefingInsert, 'created_by'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('briefings')
        .insert({
          ...briefing,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
      queryClient.invalidateQueries({ queryKey: ['briefings', 'tasking', data.tasking_id] })
    },
  })
}

export const useUpdateBriefing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BriefingUpdate }) => {
      const { data, error } = await supabase
        .from('briefings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
      queryClient.invalidateQueries({ queryKey: ['briefing', data.id] })
      queryClient.invalidateQueries({ queryKey: ['briefings', 'tasking', data.tasking_id] })
    },
  })
}

export const useDeleteBriefing = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('briefings')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
    },
  })
} 