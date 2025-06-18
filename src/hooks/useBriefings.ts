import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'

type Briefing = Database['public']['Tables']['briefings']['Row']
type BriefingInsert = Database['public']['Tables']['briefings']['Insert']
type BriefingUpdate = Database['public']['Tables']['briefings']['Update']

export const useBriefings = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('briefings')
        .select(`
          *,
          taskings (
            id,
            name
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
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