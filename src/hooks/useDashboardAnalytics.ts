import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface DashboardAnalytics {
  totalTaskings: number
  totalFiles: number
  totalBriefings: number
  totalChatMessages: number
  totalFileSize: number
  recentActivity: number
  taskingsThisWeek: number
  briefingsThisWeek: number
  filesThisWeek: number
  avgFilesPerTasking: number
  avgBriefingsPerTasking: number
  mostActiveTasking: {
    id: string
    name: string
    activityCount: number
  } | null
  fileTypeDistribution: Array<{
    type: string
    count: number
    percentage: number
  }>
  activityTrend: Array<{
    date: string
    taskings: number
    files: number
    briefings: number
  }>
}

export const useDashboardAnalytics = () => {
  const { user, session } = useAuth()

  return useQuery({
    queryKey: ['dashboard-analytics', user?.id],
    queryFn: async (): Promise<DashboardAnalytics> => {
      console.log('🔍 [Dashboard Analytics] Starting analytics fetch...')
      
      if (!user || !session) {
        console.log('❌ [Dashboard Analytics] No user or session')
        throw new Error('User not authenticated')
      }

      try {
        // Get all taskings with related data
        console.log('📊 [Dashboard Analytics] Fetching taskings...')
        const { data: taskings, error: taskingsError } = await supabase
          .from('taskings')
          .select(`
            id,
            name,
            created_at,
            files (
              id,
              file_size,
              mime_type,
              created_at
            ),
            briefings (
              id,
              created_at
            )
          `)
          .eq('user_id', user.id)

        if (taskingsError) {
          console.error('❌ [Dashboard Analytics] Taskings error:', taskingsError)
          throw taskingsError
        }

        console.log('✅ [Dashboard Analytics] Taskings fetched:', taskings?.length || 0)

        // Get chat messages count - only if we have taskings
        let totalChatMessages = 0
        if (taskings && taskings.length > 0) {
          console.log('💬 [Dashboard Analytics] Fetching chat messages...')
          const { count, error: chatError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .in('tasking_id', taskings.map(t => t.id))

          if (chatError) {
            console.warn('⚠️ [Dashboard Analytics] Chat messages error (non-fatal):', chatError)
            // Don't throw - just use 0 for chat messages
          } else {
            totalChatMessages = count || 0
            console.log('✅ [Dashboard Analytics] Chat messages counted:', totalChatMessages)
          }
        }

        // Calculate analytics
        const now = new Date()
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const allFiles = taskings?.flatMap(t => t.files || []) || []
        const allBriefings = taskings?.flatMap(t => t.briefings || []) || []

        // Basic counts
        const totalTaskings = taskings?.length || 0
        const totalFiles = allFiles.length
        const totalBriefings = allBriefings.length
        const totalFileSize = allFiles.reduce((sum, file) => sum + (file.file_size || 0), 0)

        // Recent activity (last 7 days)
        const recentTaskings = taskings?.filter(t => 
          new Date(t.created_at) > oneWeekAgo
        ).length || 0
        const recentFiles = allFiles.filter(f => 
          new Date(f.created_at) > oneWeekAgo
        ).length
        const recentBriefings = allBriefings.filter(b => 
          new Date(b.created_at) > oneWeekAgo
        ).length

        const recentActivity = recentTaskings + recentFiles + recentBriefings

        // Averages
        const avgFilesPerTasking = totalTaskings > 0 ? totalFiles / totalTaskings : 0
        const avgBriefingsPerTasking = totalTaskings > 0 ? totalBriefings / totalTaskings : 0

        // Most active tasking
        const taskingActivity = taskings?.map(t => ({
          id: t.id,
          name: t.name,
          activityCount: (t.files?.length || 0) + (t.briefings?.length || 0)
        })).sort((a, b) => b.activityCount - a.activityCount) || []

        const mostActiveTasking = taskingActivity.length > 0 && taskingActivity[0].activityCount > 0 
          ? taskingActivity[0] 
          : null

        // File type distribution
        const fileTypes = allFiles.reduce((acc, file) => {
          const type = file.mime_type?.split('/')[0] || 'unknown'
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const fileTypeDistribution = Object.entries(fileTypes).map(([type, count]) => ({
          type,
          count,
          percentage: totalFiles > 0 ? (count / totalFiles) * 100 : 0
        })).sort((a, b) => b.count - a.count)

        // Activity trend (last 7 days)
        const activityTrend = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
          const dateStr = date.toISOString().split('T')[0]
          
          return {
            date: dateStr,
            taskings: taskings?.filter(t => 
              t.created_at.startsWith(dateStr)
            ).length || 0,
            files: allFiles.filter(f => 
              f.created_at.startsWith(dateStr)
            ).length,
            briefings: allBriefings.filter(b => 
              b.created_at.startsWith(dateStr)
            ).length
          }
        })

        const result = {
          totalTaskings,
          totalFiles,
          totalBriefings,
          totalChatMessages,
          totalFileSize,
          recentActivity,
          taskingsThisWeek: recentTaskings,
          briefingsThisWeek: recentBriefings,
          filesThisWeek: recentFiles,
          avgFilesPerTasking,
          avgBriefingsPerTasking,
          mostActiveTasking,
          fileTypeDistribution,
          activityTrend
        }

        console.log('✅ [Dashboard Analytics] Analytics calculated:', result)
        return result

      } catch (error) {
        console.error('❌ [Dashboard Analytics] Fatal error:', error)
        throw error
      }
    },
    enabled: !!user && !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  })
} 