
import React, { useState } from 'react';
import { Sidebar } from '../layout/Sidebar';
import { ProjectView } from '../project/ProjectView';
import { BriefingsList } from '../briefings/BriefingsList';
import { ProjectCreationModal } from '../project/ProjectCreationModal';
import { Menu, X, Plus } from 'lucide-react';
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
    name: 'Q4 Financial Performance Review',
    description: 'Comprehensive quarterly financial analysis including revenue performance, cost optimization opportunities, budget variance analysis, cash flow projections, and strategic recommendations for executive leadership team decision-making.',
    fileCount: 8,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Global Product Launch Strategy Initiative',
    description: 'Market research analysis, competitive positioning study, customer segmentation data, pricing strategy models, and go-to-market execution plans for the upcoming product portfolio launch across North American and European markets.',
    fileCount: 12,
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Digital Transformation Roadmap',
    description: 'Technology infrastructure assessment, digital capabilities gap analysis, implementation timeline, resource requirements, and change management strategy for enterprise-wide digital transformation initiative.',
    fileCount: 15,
    createdAt: '2024-01-08'
  },
  {
    id: '4',
    name: 'Customer Experience Optimization',
    description: 'Customer journey mapping, satisfaction survey results, touchpoint analysis, service quality metrics, and improvement recommendations to enhance overall customer experience and retention rates.',
    fileCount: 9,
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    name: 'Supply Chain Risk Assessment',
    description: 'Vendor evaluation reports, logistics performance analysis, inventory optimization studies, risk mitigation strategies, and contingency planning for global supply chain operations.',
    fileCount: 11,
    createdAt: '2024-01-03'
  },
  {
    id: '6',
    name: 'Talent Acquisition & Retention',
    description: 'Recruitment pipeline analysis, employee satisfaction surveys, compensation benchmarking, skills gap assessment, and strategic workforce planning for organizational growth.',
    fileCount: 7,
    createdAt: '2024-01-01'
  },
  {
    id: '7',
    name: 'Market Expansion Feasibility',
    description: 'Geographic market analysis, regulatory compliance requirements, competitive landscape evaluation, and financial projections for potential expansion into Asian markets.',
    fileCount: 13,
    createdAt: '2023-12-28'
  },
  {
    id: '8',
    name: 'Sustainability Initiative Planning',
    description: 'Environmental impact assessment, carbon footprint analysis, sustainable practices implementation plan, and ESG reporting framework development for corporate responsibility goals.',
    fileCount: 6,
    createdAt: '2023-12-25'
  },
  {
    id: '9',
    name: 'Cybersecurity Infrastructure Audit',
    description: 'Security vulnerability assessment, threat landscape analysis, compliance evaluation, incident response procedures, and recommendations for strengthening cybersecurity posture.',
    fileCount: 10,
    createdAt: '2023-12-22'
  },
  {
    id: '10',
    name: 'Innovation Lab Research Portfolio',
    description: 'R&D project evaluation, technology trend analysis, innovation pipeline assessment, patent portfolio review, and strategic recommendations for future research investments.',
    fileCount: 14,
    createdAt: '2023-12-20'
  }
];

const mockBriefings: Briefing[] = [
  {
    id: '1',
    title: 'Q4 Financial Performance Executive Summary',
    projectName: 'Q4 Financial Performance Review',
    createdAt: '2024-01-15',
    summary: 'Q4 revenue exceeded targets by 12% with strong performance across all business units. Operating margins improved by 3.2% through successful cost optimization initiatives.'
  },
  {
    id: '2',
    title: 'Digital Transformation Strategic Roadmap',
    projectName: 'Digital Transformation Roadmap',
    createdAt: '2024-01-12',
    summary: 'Comprehensive 18-month digital transformation plan with phased implementation approach, focusing on cloud migration, process automation, and data analytics capabilities.'
  },
  {
    id: '3',
    title: 'Market Expansion Risk Assessment',
    projectName: 'Market Expansion Feasibility',
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

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
              {/* Header with date and New button */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Shared Tasking</h1>
                  <p className="text-gray-600">Generate AI-powered briefing notes from your project files</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-3">{currentDate}</p>
                  <Button onClick={handleNewProject} className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </Button>
                </div>
              </div>
              <BriefingsList briefings={mockBriefings} />
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
