import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, uploadFile, deleteFile, getPublicUrl } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'

type FileRecord = Database['public']['Tables']['files']['Row']
type FileInsert = Database['public']['Tables']['files']['Insert']

export const useTaskingFiles = (taskingId: string) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['files', 'tasking', taskingId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('tasking_id', taskingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user && !!taskingId,
  })
}

export const useUploadFile = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      file,
      taskingId,
      onProgress,
    }: {
      file: File
      taskingId: string
      onProgress?: (progress: number) => void
    }) => {
      if (!user) throw new Error('User not authenticated')

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${taskingId}/${fileName}`

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await uploadFile(
        'documents',
        filePath,
        file,
        {
          cacheControl: '3600',
          upsert: false,
        }
      )

      if (uploadError) throw uploadError

      // Create file record in database
      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          tasking_id: taskingId,
          uploaded_by: user.id,
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await deleteFile('documents', [filePath])
        throw dbError
      }

      return fileRecord
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files', 'tasking', data.tasking_id] })
      queryClient.invalidateQueries({ queryKey: ['taskings'] })
    },
  })
}

export const useDeleteFile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (fileId: string) => {
      // Get file record first
      const { data: fileRecord, error: fetchError } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

      // Delete from storage
      const { error: storageError } = await deleteFile('documents', [fileRecord.file_path])
      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (dbError) throw dbError

      return fileRecord
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['files', 'tasking', data.tasking_id] })
      queryClient.invalidateQueries({ queryKey: ['taskings'] })
    },
  })
}

export const useFileUrl = (filePath: string | null) => {
  return useQuery({
    queryKey: ['file-url', filePath],
    queryFn: () => {
      if (!filePath) return null
      return getPublicUrl('documents', filePath).data.publicUrl
    },
    enabled: !!filePath,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for batch file upload
export const useBatchUploadFiles = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      files,
      taskingId,
      onProgress,
    }: {
      files: File[]
      taskingId: string
      onProgress?: (progress: number) => void
    }) => {
      if (!user) throw new Error('User not authenticated')

      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${taskingId}/${fileName}`

        // Upload to storage
        const { data: uploadData, error: uploadError } = await uploadFile(
          'documents',
          filePath,
          file
        )

        if (uploadError) throw uploadError

        // Create database record
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            file_path: filePath,
            file_size: file.size,
            mime_type: file.type,
            tasking_id: taskingId,
            uploaded_by: user.id,
          })
          .select()
          .single()

        if (dbError) {
          await deleteFile('documents', [filePath])
          throw dbError
        }

        return fileRecord
      })

      const results = await Promise.all(uploadPromises)
      return results
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['files', 'tasking', data[0].tasking_id] })
        queryClient.invalidateQueries({ queryKey: ['taskings'] })
      }
    },
  })
} 