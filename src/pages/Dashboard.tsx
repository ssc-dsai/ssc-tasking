import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Menu, X, Plus, FolderOpen, FileCheck, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { mockTaskings } from '@/data/mockData';
import { Tasking } from '@/types/tasking';
import { useAuth } from '../contexts/AuthContext';

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
  const [taskings, setTaskings] = useState<Tasking[]>(mockTaskings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, session } = useAuth();

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
          category: tasking.category,
          fileCount: tasking.file_count || 0,
          status: 'In Progress',
          createdAt: tasking.created_at,
          lastUpdated: tasking.last_activity || tasking.updated_at,
          users: []
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

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="bg-white shadow-sm border-slate-200"
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
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader 
          title="Welcome to SSC Tasking"
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Action Button */}
            <div className="flex justify-end mb-6">
              <Button 
                onClick={handleNewTasking} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Tasking
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Analytics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Total Taskings</CardTitle>
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">{taskings.length}</div>
                    <p className="text-xs text-slate-500">Active workstreams</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Files Uploaded</CardTitle>
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                      <FileCheck className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {taskings.reduce((acc, tasking) => acc + (tasking.fileCount || 0), 0)}
                    </div>
                    <p className="text-xs text-slate-500">Total files</p>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Recent Activity</CardTitle>
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      {taskings.filter(t => new Date(t.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
                    </div>
                    <p className="text-xs text-slate-500">Last 7 days</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Taskings List */}
            <div className="space-y-6 mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Taskings</h2>
                <span className="text-sm text-slate-500">{taskings.length} taskings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {taskings.map((tasking) => (
                  <div
                    key={tasking.id}
                    className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/taskings/${tasking.id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {tasking.name}
                        </h3>
                        <div className="flex items-center justify-between mt-0.5 w-full">
                          <span className="text-xs font-medium rounded-full px-2 py-0.5 bg-slate-100 text-slate-600">
                            {tasking.fileCount || 0} files
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2 whitespace-nowrap">
                            {new Date(tasking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {tasking.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-500">
                        <FolderOpen className="w-3 h-3" />
                        <span>{tasking.fileCount || 0} files</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 font-medium">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {taskings.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FolderOpen className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mb-2">No taskings yet</h3>
                  <p className="text-slate-600 text-sm max-w-sm mx-auto">
                    Create a tasking and upload files to get started.
                  </p>
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
