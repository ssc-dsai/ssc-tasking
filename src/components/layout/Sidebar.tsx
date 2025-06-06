
import React from 'react';
import { Plus, CheckSquare, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
}

interface SidebarProps {
  projects: Project[];
  activeProject: string | null;
  onProjectSelect: (projectId: string) => void;
  onNewProject: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProject,
  onProjectSelect,
  onNewProject,
  isCollapsed,
  onToggle
}) => {
  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'} flex flex-col h-full`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Shared Tasking</h1>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="flex-1 p-4">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Projects</h2>
          )}
          <Button
            onClick={onNewProject}
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>New</span>}
          </Button>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeProject === project.id
                  ? 'bg-primary/10 border border-primary/20 text-primary'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Folder className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-sm text-gray-500 truncate">{project.fileCount} files</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
