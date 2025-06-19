import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'

interface ProcessedFile {
  file: File;
  extractedText?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  public_url: string;
}

interface UploadResponse {
  success: boolean;
  file: UploadedFile;
}

interface UseFileUploadOptions {
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = (taskingId: string, options: UseFileUploadOptions = {}) => {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const uploadMutation = useMutation({
    mutationFn: async (processedFile: ProcessedFile): Promise<UploadResponse> => {
      const { file, extractedText } = processedFile;
      
      console.log('🔄 [File Upload] Starting upload:', file.name, `(${file.size} bytes, has text: ${!!extractedText})`);
      
      if (!session) {
        throw new Error('No session available')
      }

      const token = session.access_token
      if (!token) {
        throw new Error('No access token in session')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Add extracted text if available
      if (extractedText) {
        formData.append('extractedText', extractedText)
        console.log('📝 [File Upload] Added extracted text:', extractedText.length, 'characters');
      }

      // Edge function URL
      const uploadUrl = `https://dwdznehxubvejbwngnud.supabase.co/functions/v1/upload-file?tasking_id=${taskingId}`

      // Simulate progress updates
      setUploadProgress(0)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return null
          const newProgress = prev + Math.random() * 20
          return newProgress >= 90 ? 90 : newProgress
        })
      }, 200)

      try {        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (!response.ok) {
          const errorData = await response.text()
          console.error('❌ [File Upload] Upload failed:', response.status, errorData);
          throw new Error(`Upload failed (${response.status}): ${errorData}`)
        }

        const data = await response.json() as UploadResponse
        console.log('✅ [File Upload] Upload successful:', file.name, '-> File ID:', data.file.id);
        
        // Complete progress
        setTimeout(() => setUploadProgress(null), 1000)
        
        return data
      } catch (error) {
        console.error('❌ [File Upload] Upload error:', error instanceof Error ? error.message : 'Unknown error');
        clearInterval(progressInterval)
        setUploadProgress(null)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('✅ [File Upload] Mutation success:', data.file.name)
      
      // Invalidate and refetch tasking details to show new file
      queryClient.invalidateQueries({ queryKey: ['tasking-details', taskingId] })
      
      // Call success callback
      options.onSuccess?.(data.file)
    },
    onError: (error) => {
      console.error('💥 [File Upload] Mutation error:', error)
      setUploadProgress(null)
      
      // Call error callback
      options.onError?.(error as Error)
    }
  })

  return {
    uploadFile: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    error: uploadMutation.error,
    isSuccess: uploadMutation.isSuccess
  }
} 