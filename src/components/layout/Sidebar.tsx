import React from 'react';
import { Plus, Folder, ChevronLeft, ChevronRight, User, Users, Settings, LogOut, ChevronDown } from 'lucide-react';
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
function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min${Math.floor(diff / 60) === 1 ? '' : 's'} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
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
  const { user, signOut } = useAuth();
  
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
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
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
          <div className="text-slate-400">{icon}</div>
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        </div>
      )}
      <div className="space-y-1">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="px-3 py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-200 rounded animate-pulse flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-slate-200 rounded animate-pulse mb-1" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : taskings.length === 0 ? (
          // Empty state
          !isCollapsed && (
            <div className="px-3 py-4 text-center">
              <p className="text-xs text-slate-400">No {title.toLowerCase()} taskings</p>
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
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className={`w-4 h-4 flex-shrink-0 ${
                  activeTasking === tasking.id ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'
                }`} />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tasking.name}</p>
                    <div className="flex items-center justify-between mt-0.5 w-full">
                      <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        tasking.status === 'Complete'
                          ? 'bg-slate-100 text-green-600'
                          : 'bg-slate-100 text-yellow-600'
                      }`}>
                        {tasking.status}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-2 whitespace-nowrap">{timeAgo(tasking.lastUpdated)}</span>
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
    <nav className={`bg-white border-r border-slate-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full fixed lg:relative z-40 lg:z-auto shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
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
            <span className="text-lg font-semibold text-slate-900">SSC Tasking</span>
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
          className="hidden lg:flex h-8 w-8 text-slate-400 hover:text-slate-600"
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
          {!isCollapsed && <span className="ml-2">New Tasking</span>}
        </Button>
      </div>

      {/* Taskings Section */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {renderTaskingSection(personalTaskings, "Personal", <User className="w-4 h-4" />)}
        {renderTaskingSection(sharedTaskings, "Shared", <Users className="w-4 h-4" />)}
      </div>

      {/* User Profile Section */}
      {user && (
        <div className="border-t border-slate-100 p-4">
          {!isCollapsed ? (
            /* Expanded User Section with Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-2 h-auto hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleProfileClick}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleSettingsClick}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Collapsed User Avatar */
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-slate-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={handleProfileClick}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
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
