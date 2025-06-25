import React from 'react'
import UserProfile from './UserProfile'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/ThemeContext'

interface TopHeaderProps {
  title?: string
  actions?: React.ReactNode
}

const TopHeader: React.FC<TopHeaderProps> = ({ 
  title = "SSC Tasking",
  actions
}) => {
  const { theme, setTheme, actualTheme } = useTheme()

  const getThemeIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />
    }
    return actualTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }



  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Theme Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={() => setTheme('system')}
              className={`cursor-pointer ${theme === 'system' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme('light')}
              className={`cursor-pointer ${theme === 'light' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme('dark')}
              className={`cursor-pointer ${theme === 'dark' ? 'bg-slate-100 dark:bg-slate-700' : ''}`}
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action buttons */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
        
        {/* User Profile */}
        <UserProfile />
      </div>
    </header>
  )
}

export default TopHeader 