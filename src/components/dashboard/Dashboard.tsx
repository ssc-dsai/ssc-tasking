
import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { ProjectView } from '../project/ProjectView';
import { BriefingsList } from '../briefings/BriefingsList';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
}

interface Briefing {
  id: string;
  title: string;
  projectName: string;
  createdAt: string;
  summary: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Q4 Budget Review',
    description: 'Financial analysis and budget planning documents',
    fileCount: 8,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Product Launch Strategy',
    description: 'Market research and launch planning materials',
    fileCount: 12,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Team Performance Analysis',
    description: 'HR metrics and performance review data',
    fileCount: 6,
    createdAt: '2024-01-08'
  }
];

const mockBriefings: Briefing[] = [
  {
    id: '1',
    title: 'Q4 Budget Analysis Executive Summary',
    projectName: 'Q4 Budget Review',
    createdAt: '2024-01-15',
    summary: 'Comprehensive analysis of Q4 financial performance with key recommendations for cost optimization.'
  },
  {
    id: '2',
    title: 'Product Market Readiness Assessment',
    projectName: 'Product Launch Strategy',
    createdAt: '2024-01-12',
    summary: 'Market analysis indicates strong positioning for Q2 launch with identified risk mitigation strategies.'
  }
];

export const Dashboard: React.FC = () => {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    setIsMobileSidebarOpen(false);
  };

  const handleNewProject = () => {
    console.log('Creating new project...');
    // TODO: Implement project creation modal
  };

  const selectedProject = mockProjects.find(p => p.id === activeProject);

  return (
    <div className="h-screen bg-gray-50 flex">
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
          projects={mockProjects}
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
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Shared Tasking</h1>
                <p className="text-gray-600">Generate AI-powered briefing notes from your project files</p>
              </div>
              <BriefingsList briefings={mockBriefings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
