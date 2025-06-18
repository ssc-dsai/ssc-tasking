import React from 'react'
import UserProfile from './UserProfile'

interface TopHeaderProps {
  title?: string
}

const TopHeader: React.FC<TopHeaderProps> = ({ 
  title = "SSC Tasking"
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 ml-4">
          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  )
}

export default TopHeader 