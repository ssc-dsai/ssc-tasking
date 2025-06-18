import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'

type Tasking = Database['public']['Tables']['taskings']['Row']
type TaskingInsert = Database['public']['Tables']['taskings']['Insert']
type TaskingUpdate = Database['public']['Tables']['taskings']['Update']

export const useTaskings = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['taskings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('taskings')
        .select(`
          *,
          files (
            id,
            name,
            file_size,
            mime_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export const useTasking = (id: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tasking', id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('taskings')
        .select(`
          *,
          files (
            id,
            name,
            file_path,
            file_size,
            mime_type,
            created_at
          ),
          briefings (
            id,
            title,
            summary,
            created_at
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user && !!id,
  })
}

export const useCreateTasking = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (tasking: Omit<TaskingInsert, 'user_id'>) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('taskings')
        .insert({
          ...tasking,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskings'] })
    },
  })
}

export const useUpdateTasking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TaskingUpdate }) => {
      const { data, error } = await supabase
        .from('taskings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['taskings'] })
      queryClient.invalidateQueries({ queryKey: ['tasking', data.id] })
    },
  })
}

export const useDeleteTasking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('taskings')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskings'] })
    },
  })
} 