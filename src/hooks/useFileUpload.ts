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
      
      console.log('🔄 [File Upload] Starting upload for:', file.name)
      console.log('🔄 [File Upload] TaskingId:', taskingId)
      console.log('🔄 [File Upload] Session exists:', !!session)
      console.log('🔄 [File Upload] Has extracted text:', !!extractedText)
      
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
        console.log('📝 [File Upload] Added extracted text:', extractedText.length, 'characters')
      }

      // Edge function URL
      const uploadUrl = `https://dwdznehxubvejbwngnud.supabase.co/functions/v1/upload-file?tasking_id=${taskingId}`
      
      console.log('🌐 [File Upload] Uploading to:', uploadUrl)

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
        console.log('🚀 [File Upload] Making request with token length:', token.length)
        console.log('🚀 [File Upload] FormData contains file:', !!formData.get('file'))
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        console.log('📡 [File Upload] Response status:', response.status)
        console.log('📡 [File Upload] Response headers:', response.headers)

        if (!response.ok) {
          const errorData = await response.text()
          console.log('❌ [File Upload] Upload failed:', response.status, errorData)
          console.log('❌ [File Upload] Full response:', response)
          throw new Error(`Upload failed (${response.status}): ${errorData}`)
        }

        const data = await response.json() as UploadResponse
        console.log('✅ [File Upload] Upload successful:', data)
        console.log('✅ [File Upload] File details:', data.file)
        
        // Complete progress
        setTimeout(() => setUploadProgress(null), 1000)
        
        return data
      } catch (error) {
        console.error('💥 [File Upload] Caught error during upload:', error)
        console.error('💥 [File Upload] Error type:', typeof error)
        console.error('💥 [File Upload] Error details:', error instanceof Error ? error.message : error)
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