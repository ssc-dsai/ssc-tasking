import React, { useState } from 'react';
import { Plus, Folder, ChevronLeft, ChevronRight, User, Users, LogOut, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';

interface Tasking {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'shared';
  fileCount: number;
  status: string;
  createdAt: string;
  lastUpdated: string;
  users: any[];
}

interface SidebarProps {
  activeTasking: string | null;
  onTaskingSelect: (taskingId: string) => void;
  onNewTasking: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  taskings: Tasking[];
  isLoading?: boolean;
}

// Utility to format time ago
function timeAgo(dateString: string, t: (key: string, variables?: Record<string, any>) => string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diff < 60) return t('time.justNow');
  
  const minutes = Math.floor(diff / 60);
  if (diff < 3600) {
    return minutes === 1 ? t('time.minuteAgo') : t('time.minutesAgo', { count: minutes });
  }
  
  const hours = Math.floor(diff / 3600);
  if (diff < 86400) {
    return hours === 1 ? t('time.hourAgo') : t('time.hoursAgo', { count: hours });
  }
  
  const days = Math.floor(diff / 86400);
  if (diff < 7 * 86400) {
    return days === 1 ? t('time.dayAgo') : t('time.daysAgo', { count: days });
  }
  
  // If more than 7 days ago, show as 'Month Day'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTasking,
  onTaskingSelect,
  onNewTasking,
  isCollapsed,
  onToggle,
  taskings,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { user, signOut, forceSignOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { t } = useLanguage();
  
  const personalTaskings = taskings
    .filter(t => t.category === 'personal')
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  const sharedTaskings = taskings
    .filter(t => t.category === 'shared')
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent double-clicking
    
    setIsSigningOut(true);
    
    try {
      console.log('Attempting to sign out...');
      
      // Clear all cached queries first
      queryClient.clear();
      
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
      setIsSigningOut(false);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = getInitials(displayName);

  const renderTaskingSection = (taskings: Tasking[], title: string, icon: React.ReactNode) => (
    <div className="mb-6">
      {!isCollapsed && (
        <div className="flex items-center gap-2 px-3 mb-2">
          <div className="text-slate-400 dark:text-slate-500">{icon}</div>
          <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="space-y-1">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : taskings.length === 0 ? (
          // Empty state
          !isCollapsed && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">No {title.toLowerCase()} taskings</p>
            </div>
          )
        ) : (
          // Actual taskings
          taskings.map((tasking) => (
          <button
            key={tasking.id}
            onClick={() => onTaskingSelect(tasking.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              activeTasking === tasking.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className={`w-4 h-4 flex-shrink-0 ${
                activeTasking === tasking.id ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400'
              }`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{tasking.name}</p>
                  <div className="flex items-center justify-between mt-0.5 w-full">
                    <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      tasking.status === 'Complete'
                        ? 'bg-slate-100 dark:bg-slate-700 text-green-600 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {tasking.status === 'Complete' ? t('common.complete') : t('common.inProgress')}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2 whitespace-nowrap">{timeAgo(tasking.lastUpdated, t)}</span>
                  </div>
                </div>
              )}
            </div>
          </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <nav className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full fixed lg:relative z-40 lg:z-auto shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        {!isCollapsed && (
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/5abdbc0c-d333-4138-b3bc-e3f5c888dc65.png" 
              alt="SSC Tasking" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">SSC Tasking</span>
          </button>
        )}
        {isCollapsed && (
          <button 
            onClick={handleLogoClick}
            className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto hover:opacity-80 transition-opacity"
          >
            <img 
              src="/lovable-uploads/5abdbc0c-d333-4138-b3bc-e3f5c888dc65.png" 
              alt="SSC Tasking" 
              className="w-8 h-8 rounded-lg"
            />
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex h-8 w-8 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* New Tasking Button */}
      <div className="p-4">
        <Button
          onClick={onNewTasking}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm ${
            isCollapsed ? 'px-0' : 'px-4'
          }`}
          size={isCollapsed ? 'icon' : 'default'}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">{t('nav.newTasking')}</span>}
        </Button>
      </div>

      {/* Taskings Section */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {renderTaskingSection(personalTaskings, t('common.personal'), <User className="w-4 h-4" />)}
        {renderTaskingSection(sharedTaskings, t('common.shared'), <Users className="w-4 h-4" />)}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-slate-100 dark:border-slate-800 p-4">
          {!isCollapsed ? (
            /* Expanded User Section with Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-2 h-auto hover:bg-slate-50 dark:hover:bg-slate-800"
                  disabled={isSigningOut}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
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
          ) : (
            /* Collapsed User Avatar */
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800"
                    disabled={isSigningOut}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
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
            </div>
          )}
        </div>
      )}

    </nav>
  );
};
