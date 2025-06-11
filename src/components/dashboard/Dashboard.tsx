
import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { ProjectView } from '../project/ProjectView';
import { BriefingsList } from '../briefings/BriefingsList';
import { ProjectCreationModal } from '../project/ProjectCreationModal';
import { Menu, X, Plus, FolderOpen, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockTaskings, Tasking } from '../../data/mockTaskings';
import { mockBriefings } from '../../data/mockBriefings';

export const Dashboard: React.FC = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    setIsMobileSidebarOpen(false);
  };

  const handleNewProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleProjectCreated = (project: Omit<Tasking, 'id' | 'createdAt'>) => {
    console.log('New project created:', project);
    setIsProjectModalOpen(false);
    // TODO: Add project to state/database
  };

  const selectedProject = mockTaskings.find(p => p.id === activeProject);

  // Analytics calculations
  const totalProjects = mockTaskings.length;
  const completedProjects = mockBriefings.length;
  const inProgressProjects = totalProjects - completedProjects;

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 transition-transform duration-300`}>
        <Sidebar
          projects={mockTaskings}
          activeProject={activeProject}
          onProjectSelect={handleProjectSelect}
          onNewProject={handleNewProject}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-8">
          {selectedProject ? (
            <ProjectView project={selectedProject} />
          ) : (
            <div>
              {/* Header with date and New button */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SSC Tasking</h1>
                  <p className="text-gray-600">Generate AI-powered briefing notes from your tasking files</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-3">{currentDate}</p>
                  <Button onClick={handleNewProject} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-4 h-4" />
                    <span>New Tasking</span>
                  </Button>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Taskings</CardTitle>
                    <FolderOpen className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalProjects}</div>
                    <p className="text-xs text-blue-100">Active workstreams</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <FileCheck className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedProjects}</div>
                    <p className="text-xs text-green-100">Briefings generated</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <Clock className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inProgressProjects}</div>
                    <p className="text-xs text-amber-100">Ready for analysis</p>
                  </CardContent>
                </Card>
              </div>

              <BriefingsList 
                briefings={mockBriefings} 
                onBriefingClick={(briefing) => {
                  const project = mockTaskings.find(p => p.name === briefing.taskingName);
                  if (project) {
                    setActiveProject(project.id);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};
