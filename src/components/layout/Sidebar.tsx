
import React from 'react';
import { Plus, Folder, FileText, ChevronLeft, ChevronRight, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockTaskings, Tasking } from '@/data/mockData';

interface SidebarProps {
  activeTasking: string | null;
  onTaskingSelect: (taskingId: string) => void;
  onNewTasking: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTasking,
  onTaskingSelect,
  onNewTasking,
  isCollapsed,
  onToggle
}) => {
  const personalTaskings = mockTaskings.filter(t => t.category === 'personal');
  const sharedTaskings = mockTaskings.filter(t => t.category === 'shared');

  const renderTaskingSection = (taskings: Tasking[], title: string, icon: React.ReactNode) => (
    <div className="mb-6">
      {!isCollapsed && (
        <div className="flex items-center space-x-2 mb-3 px-2">
          {icon}
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
        </div>
      )}
      <div className="space-y-2">
        {taskings.map((tasking) => (
          <button
            key={tasking.id}
            onClick={() => onTaskingSelect(tasking.id)}
            className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
              activeTasking === tasking.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Folder className={`w-5 h-5 flex-shrink-0 ${
                activeTasking === tasking.id ? 'text-white' : 'text-blue-500'
              }`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tasking.name}</p>
                  <p className={`text-sm truncate ${
                    activeTasking === tasking.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {tasking.fileCount} files
                  </p>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'} flex flex-col h-full shadow-sm`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5abdbc0c-d333-4138-b3bc-e3f5c888dc65.png" 
                  alt="SSC Tasking" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SSC Tasking</h1>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
              <img 
                src="/lovable-uploads/5abdbc0c-d333-4138-b3bc-e3f5c888dc65.png" 
                alt="SSC Tasking" 
                className="w-8 h-8 rounded-lg"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Taskings Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Taskings</h2>
          )}
          <Button
            onClick={onNewTasking}
            size="sm"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>New</span>}
          </Button>
        </div>

        {renderTaskingSection(personalTaskings, "Personal", <User className="w-4 h-4 text-gray-500" />)}
        {renderTaskingSection(sharedTaskings, "Shared", <Users className="w-4 h-4 text-gray-500" />)}
      </div>
    </div>
  );
};
