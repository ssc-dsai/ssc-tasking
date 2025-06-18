import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import { BriefingsList } from '../components/briefings/BriefingsList';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Menu, X, Plus, FolderOpen, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { mockTaskings, mockBriefings, Tasking } from '@/data/mockData';

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskingModalOpen, setIsTaskingModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleTaskingSelect = (taskingId: string) => {
    navigate(`/taskings/${taskingId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleNewTasking = () => {
    setIsTaskingModalOpen(true);
  };

  const handleTaskingCreated = (tasking: Omit<Tasking, 'id' | 'createdAt' | 'category'>) => {
    console.log('New tasking created:', tasking);
    setIsTaskingModalOpen(false);
    // TODO: Add tasking to state/database
  };

  // Analytics calculations
  const totalTaskings = mockTaskings.length;
  const completedTaskings = mockBriefings.length;
  const inProgressTaskings = totalTaskings - completedTaskings;

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Taskings</CardTitle>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{totalTaskings}</div>
                  <p className="text-xs text-slate-500">Active workstreams</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{completedTaskings}</div>
                  <p className="text-xs text-slate-500">Briefings generated</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">{inProgressTaskings}</div>
                  <p className="text-xs text-slate-500">Ready for analysis</p>
                </CardContent>
              </Card>
            </div>

            {/* Briefings List */}
            <BriefingsList 
              briefings={mockBriefings} 
              onBriefingClick={(briefing) => {
                const tasking = mockTaskings.find(t => t.name === briefing.taskingName);
                if (tasking) {
                  navigate(`/taskings/${tasking.id}`);
                }
              }}
            />
          </div>
        </div>
      </main>

      {/* Tasking Creation Modal */}
      <ProjectCreationModal
        isOpen={isTaskingModalOpen}
        onClose={() => setIsTaskingModalOpen(false)}
        onProjectCreated={handleTaskingCreated}
      />
    </div>
  );
};

export default Dashboard;
