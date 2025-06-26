import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { 
  Menu, 
  X, 
  Plus, 
  FolderOpen, 
  FileCheck, 
  Clock, 
  ArrowRight, 
  MessageSquare,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatTimeAgo } from '../lib/dashboardUtils';

import { Tasking } from '@/types/tasking';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Define the type for taskings from Supabase
interface SupabaseTasking {
  id: string;
  name: string;
  description: string | null;
  category: 'personal' | 'shared';
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskingModalOpen, setIsTaskingModalOpen] = useState(false);
  const [taskings, setTaskings] = useState<Tasking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { t } = useLanguage();

  // Simple GET call to fetch taskings
  useEffect(() => {
    const fetchTaskings = async () => {
      if (!user || !session) {
        console.log('No user or session available');
        return;
      }
      
      console.log('Calling edge function get-taskings for user:', user.id);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-taskings?limit=50`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Edge function error:', result);
          setError(result.error || 'Failed to fetch taskings');
          setIsLoading(false);
          return;
        }

        console.log('Edge function taskings result:', result);

        const formattedTaskings: Tasking[] = (result.data || []).map((tasking: any) => ({
          id: tasking.id,
          name: tasking.name,
          description: tasking.description || '',
          category: tasking.access_type === 'owner' ? 'personal' : 'shared',
          fileCount: tasking.file_count || 0,
          briefingCount: tasking.briefing_count || 0,
          chatCount: tasking.chat_count || 0,
          userCount: tasking.user_count || 1,
          status: 'In Progress',
          createdAt: tasking.created_at,
          lastUpdated: tasking.last_activity || tasking.updated_at,
          users: tasking.users || [],
          ownerProfile: tasking.owner_profile
        }));

        setTaskings(formattedTaskings);
        setError(null);
      } catch (err: any) {
        console.error('Network or parsing error:', err);
        setError(err.message || 'Unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskings();
  }, [user, session]);

  const handleTaskingSelect = (taskingId: string) => {
    navigate(`/taskings/${taskingId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleNewTasking = () => {
    setIsTaskingModalOpen(true);
  };

  const handleTaskingCreated = (tasking: { name: string; description: string; fileCount: number }) => {
    console.log('New tasking created:', tasking);
    setIsTaskingModalOpen(false);
  };

  // Simple calculations from existing data
  const totalFiles = taskings.reduce((acc, tasking) => acc + (tasking.fileCount || 0), 0);
  const totalBriefings = taskings.reduce((acc, tasking) => acc + (tasking.briefingCount || 0), 0);
  const recentTaskings = taskings.filter(t => 
    new Date(t.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-white dark:bg-slate-800 shadow-sm border-slate-200 dark:border-slate-700"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          activeTasking={null}
          onTaskingSelect={handleTaskingSelect}
          onNewTasking={handleNewTasking}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          taskings={taskings}
          isLoading={isLoading}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader 
          title={t('dashboard.welcomeTitle')}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[80%] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {/* Simple Beautiful Analytics */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('dashboard.overview')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('dashboard.totalTaskings')}</CardTitle>
                    <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">{taskings.length}</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{t('dashboard.activeWorkstreams')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">{t('dashboard.totalFiles')}</CardTitle>
                    <div className="w-8 h-8 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
                      <FileCheck className="h-4 w-4 text-green-700 dark:text-green-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">{totalFiles}</div>
                    <p className="text-xs text-green-600 dark:text-green-400">{t('dashboard.documentsUploaded')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">{t('dashboard.recentActivity')}</CardTitle>
                    <div className="w-8 h-8 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-700 dark:text-purple-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">{recentTaskings}</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">{t('dashboard.newThisWeek')}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('dashboard.totalBriefings')}</CardTitle>
                    <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">{totalBriefings}</div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{t('dashboard.generated')}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Button - Moved below Overview */}
            <div className="flex justify-end mb-3">
              <Button 
                onClick={handleNewTasking} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.newTasking')}
              </Button>
            </div>

            {/* Enhanced Taskings List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('dashboard.yourTaskings')}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{taskings.length} {t('nav.taskings').toLowerCase()}</span>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                          <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded mb-2" />
                      <div className="h-4 bg-slate-100 dark:bg-slate-600 rounded mb-4 w-4/5" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-slate-100 dark:bg-slate-600 rounded w-16" />
                        <div className="h-6 bg-slate-100 dark:bg-slate-600 rounded w-16" />
                        <div className="h-6 bg-slate-100 dark:bg-slate-600 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mb-2">Error loading taskings</h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto mb-4">
                    {error}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
                            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {taskings.map((tasking) => (
                  <div
                    key={tasking.id}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => navigate(`/taskings/${tasking.id}`)}
                  >
                    {/* Gradient accent */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Header with icon and title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tasking.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={tasking.category === 'personal' ? 'default' : 'secondary'} className="text-xs">
                            {tasking.category === 'personal' ? t('common.personal') : t('common.shared')}
                          </Badge>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {t('briefing.generatedOn').replace('on', '')} {formatTimeAgo(tasking.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2 leading-relaxed">
                      {tasking.description || 'No description provided'}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                        <FileCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{tasking.fileCount || 0}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {(tasking.fileCount || 0) === 1 ? t('files.fileLabel') : t('files.filesLabel')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                        <FileText className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{tasking.briefingCount || 0}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {(tasking.briefingCount || 0) === 1 ? t('briefing.briefingLabel') : t('briefing.briefingsLabel')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 dark:bg-slate-700 rounded text-xs">
                        <MessageSquare className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">{tasking.chatCount || 0}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {(tasking.chatCount || 0) === 1 ? t('chat.chatLabel') : t('chat.chatsLabel')}
                        </span>
                      </div>
                    </div>

                    {/* Footer with user avatars */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <div className="flex -space-x-1">
                          {/* Owner avatar */}
                          <Avatar className="w-6 h-6 border-2 border-white dark:border-slate-800">
                            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                              {tasking.ownerProfile?.full_name 
                                ? tasking.ownerProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                                : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {/* Shared users avatars */}
                          {tasking.users && tasking.users.slice(0, 2).map((user: any, index: number) => (
                            <Avatar key={index} className="w-6 h-6 border-2 border-white dark:border-slate-800">
                              <AvatarFallback className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium">
                                {user.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {/* Overflow indicator */}
                          {(tasking.userCount || 1) > (tasking.users?.length || 0) + 1 && (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">+{(tasking.userCount || 1) - (tasking.users?.length || 0) - 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {t('time.updated').replace('{time}', formatTimeAgo(tasking.lastUpdated))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {!isLoading && !error && taskings.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No taskings yet</h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto mb-6">
                    Create your first tasking to start organizing and analyzing your documents with AI.
                  </p>
                  <Button onClick={handleNewTasking} className="bg-blue-600 hover:bg-blue-700">
                    <Zap className="w-4 h-4 mr-2" />
                    Create Your First Tasking
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isTaskingModalOpen}
        onClose={() => setIsTaskingModalOpen(false)}
        onProjectCreated={handleTaskingCreated}
      />
    </div>
  );
};

export default Dashboard;

