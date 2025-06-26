import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, ChevronDown, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

const UserProfile: React.FC = () => {
  const { user, signOut, forceSignOut } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    if (isSigningOut) return // Prevent double-clicking
    
    setIsSigningOut(true)
    
    try {
      console.log('Attempting to sign out...');
      
      // Clear all cached queries first
      queryClient.clear()
      
      const { error } = await signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: t('error.generic'),
          description: error.message || t('error.generic'),
          variant: "destructive",
        });
        return;
      }
      
      console.log('Sign out successful, navigating to login...');
      
      // Show success message
      toast({
        title: t('common.success'),
        description: t('nav.signOut'),
      });
      
      // Navigate to login
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Fallback: force local logout if something goes wrong
      console.log('Forcing local logout...');
      
      forceSignOut();
      localStorage.clear();
      sessionStorage.clear();
      
      toast({
        title: t('common.success'),
        description: t('nav.signOut'),
      });
      
      navigate('/login', { replace: true });
      
    } finally {
      setIsSigningOut(false)
    }
  }

  if (!user) {
    return null
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initials = getInitials(displayName)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
          disabled={isSigningOut}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-slate-900 dark:text-white leading-none">
              {displayName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
              {user.email}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500 hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none dark:text-white">{displayName}</p>
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>{t('common.loading')}</span>
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('nav.signOut')}</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserProfile 