
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { ProjectView } from '../components/project/ProjectView';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockTaskings, Tasking } from '../data/mockTaskings';

const TaskingView: React.FC = () => {
  const { taskingId } = useParams<{ taskingId: string }>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const tasking = mockTaskings.find(t => t.id === taskingId);

  const handleTaskingSelect = (selectedTaskingId: string) => {
    navigate(`/taskings/${selectedTaskingId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleNewTasking = () => {
    setIsProjectModalOpen(true);
  };

  const handleTaskingCreated = (newTasking: Omit<Tasking, 'id' | 'createdAt'>) => {
    console.log('New tasking created:', newTasking);
    setIsProjectModalOpen(false);
    // TODO: Add tasking to state/database
  };

  if (!tasking) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tasking Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
          activeProject={taskingId || null}
          onProjectSelect={handleTaskingSelect}
          onNewProject={handleNewTasking}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 lg:p-8">
          <ProjectView project={tasking} />
        </div>
      </div>

      {/* Tasking Creation Modal */}
      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleTaskingCreated}
      />
    </div>
  );
};

export default TaskingView;
