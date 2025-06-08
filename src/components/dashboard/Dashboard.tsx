
import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { ProjectView } from '../project/ProjectView';
import { BriefingsList } from '../briefings/BriefingsList';
import { ProjectCreationModal } from '../project/ProjectCreationModal';
import { Menu, X, Plus, FolderOpen, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  taskingName: string; // Updated to match the expected interface
  createdAt: string;
  summary: string;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Q4 Financial Review',
    description: 'Comprehensive quarterly financial analysis including revenue performance, cost optimization, cash flow evaluation, and strategic financial planning for executive decision-making and stakeholder reporting.',
    fileCount: 8,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Product Launch Strategy',
    description: 'End-to-end global product launch planning encompassing market research, competitive analysis, go-to-market strategy, pricing models, distribution channels, and marketing campaign development.',
    fileCount: 6,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Digital Transformation',
    description: 'Enterprise-wide digital transformation initiative covering technology modernization, process automation, cloud migration, data analytics implementation, and organizational change management.',
    fileCount: 15,
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'Customer Experience',
    description: 'Customer journey optimization project focused on touchpoint analysis, satisfaction metrics, service quality improvement, loyalty program development, and omnichannel experience enhancement.',
    fileCount: 9,
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    name: 'Supply Chain Assessment',
    description: 'Global supply chain risk evaluation and optimization including vendor assessment, logistics efficiency, inventory management, sustainability practices, and resilience planning.',
    fileCount: 11,
    createdAt: '2024-01-03'
  },
  {
    id: '6',
    name: 'Talent Strategy',
    description: 'Comprehensive workforce planning initiative covering recruitment optimization, skill development programs, retention strategies, diversity and inclusion, and leadership development.',
    fileCount: 7,
    createdAt: '2024-01-01'
  },
  {
    id: '7',
    name: 'Market Expansion',
    description: 'Strategic market entry analysis for Asian markets including feasibility studies, regulatory compliance, partnership opportunities, localization requirements, and investment planning.',
    fileCount: 13,
    createdAt: '2023-12-28'
  },
  {
    id: '8',
    name: 'Sustainability Initiative',
    description: 'Environmental impact assessment and ESG compliance program covering carbon footprint reduction, sustainable operations, regulatory adherence, and stakeholder engagement strategies.',
    fileCount: 6,
    createdAt: '2023-12-25'
  },
  {
    id: '9',
    name: 'Security Audit',
    description: 'Comprehensive cybersecurity infrastructure assessment including threat analysis, vulnerability testing, compliance evaluation, incident response planning, and security awareness training.',
    fileCount: 10,
    createdAt: '2023-12-22'
  },
  {
    id: '10',
    name: 'Innovation Portfolio',
    description: 'Research and development investment review covering technology roadmaps, innovation pipeline assessment, intellectual property strategy, and emerging technology evaluation.',
    fileCount: 14,
    createdAt: '2023-12-20'
  }
];

const mockBriefings: Briefing[] = [
  {
    id: '1',
    title: 'Q4 Financial Performance Executive Summary',
    taskingName: 'Q4 Financial Review', // Updated to taskingName
    createdAt: '2024-01-15',
    summary: 'Q4 revenue exceeded targets by 12% with strong performance across all business units. Operating margins improved by 3.2% through successful cost optimization initiatives.'
  },
  {
    id: '2',
    title: 'Digital Transformation Strategic Roadmap',
    taskingName: 'Digital Transformation', // Updated to taskingName
    createdAt: '2024-01-12',
    summary: 'Comprehensive 18-month digital transformation plan with phased implementation approach, focusing on cloud migration, process automation, and data analytics capabilities.'
  },
  {
    id: '3',
    title: 'Market Expansion Risk Assessment',
    taskingName: 'Market Expansion', // Updated to taskingName
    createdAt: '2024-01-09',
    summary: 'Asian market expansion shows strong potential with estimated ROI of 25% over 3 years. Key risks identified include regulatory compliance and local partnership requirements.'
  }
];

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

  const handleProjectCreated = (project: Omit<Project, 'id' | 'createdAt'>) => {
    console.log('New project created:', project);
    setIsProjectModalOpen(false);
    // TODO: Add project to state/database
  };

  const selectedProject = mockProjects.find(p => p.id === activeProject);

  // Analytics calculations
  const totalProjects = mockProjects.length;
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
              {/* Header with date and New button */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Shared Tasking</h1>
                  <p className="text-gray-600">Generate AI-powered briefing notes from your project files</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-3">{currentDate}</p>
                  <Button onClick={handleNewProject} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </Button>
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
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
                  const project = mockProjects.find(p => p.name === briefing.taskingName);
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
