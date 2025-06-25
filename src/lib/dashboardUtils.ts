export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export const getGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export const getFileTypeIcon = (mimeType: string): string => {
  const type = mimeType.split('/')[0]
  switch (type) {
    case 'application':
      if (mimeType.includes('pdf')) return '📄'
      if (mimeType.includes('word')) return '📝'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈'
      return '📋'
    case 'image':
      return '🖼️'
    case 'video':
      return '🎥'
    case 'audio':
      return '🎵'
    case 'text':
      return '📄'
    default:
      return '📄'
  }
}

export const getFileTypeLabel = (mimeType: string): string => {
  const type = mimeType.split('/')[0]
  switch (type) {
    case 'application':
      if (mimeType.includes('pdf')) return 'PDF'
      if (mimeType.includes('word')) return 'Word'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel'
      if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PowerPoint'
      return 'Document'
    case 'image':
      return 'Image'
    case 'video':
      return 'Video'
    case 'audio':
      return 'Audio'
    case 'text':
      return 'Text'
    default:
      return 'File'
  }
}

export const getTrendColor = (value: number): string => {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-slate-500'
}

export const getTrendIcon = (value: number): string => {
  if (value > 0) return '↗️'
  if (value < 0) return '↘️'
  return '➡️'
}

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

export const getActivityLevel = (count: number): { label: string; color: string } => {
  if (count >= 10) return { label: 'Very High', color: 'text-red-600 bg-red-50' }
  if (count >= 5) return { label: 'High', color: 'text-orange-600 bg-orange-50' }
  if (count >= 2) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' }
  if (count >= 1) return { label: 'Low', color: 'text-blue-600 bg-blue-50' }
  return { label: 'None', color: 'text-slate-500 bg-slate-50' }
} 