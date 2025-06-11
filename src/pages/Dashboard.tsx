
import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BriefingsList } from '../components/briefings/BriefingsList';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Menu, X, Plus, FolderOpen, FileCheck, Clock, Calendar, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { mockTaskings, Tasking } from '../data/mockTaskings';
import { mockBriefings } from '../data/mockBriefings';

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleTaskingSelect = (taskingId: string) => {
    navigate(`/taskings/${taskingId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleNewTasking = () => {
    setIsProjectModalOpen(true);
  };

  const handleTaskingCreated = (tasking: Omit<Tasking, 'id' | 'createdAt'>) => {
    console.log('New tasking created:', tasking);
    setIsProjectModalOpen(false);
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
          projects={mockTaskings}
          activeProject={null}
          onProjectSelect={handleTaskingSelect}
          onNewProject={handleNewTasking}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">👋 Hi Jenny, Let's Get Started!</h1>
              <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Help
              </Button>
              <Button variant="outline" size="sm">
                Video Help
              </Button>
              <Button onClick={handleNewTasking} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Tasking
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Work on My Book</h3>
                    <p className="text-sm text-gray-500">0 Portraits • 0 PhotoShot</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Work on My Photos</h3>
                    <p className="text-sm text-gray-500">12 Candles • 0 Clip Art</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Manage</h3>
                    <p className="text-sm text-gray-500">Advanced Configure • User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Calendar */}
            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Calendar</CardTitle>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">TODAY:</p>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3 h-3 mr-2" />
                        3:00 Leader Review
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3 h-3 mr-2" />
                        6:00 Football Game!
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">THIS WEEK:</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3 h-3 mr-2" />
                      Leader Review Friday
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">75%</div>
                    <div className="text-xs text-gray-500">PAGES</div>
                    <div className="text-xs text-gray-500">- In progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">55%</div>
                    <div className="text-xs text-gray-500">-</div>
                    <div className="text-xs text-gray-500">✓ Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">70%</div>
                    <div className="text-xs text-gray-500">-</div>
                    <div className="text-xs text-gray-500">✓ Approved</div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">COVER</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">80%</div>
                      <div className="text-xs text-gray-500">- In progress</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">65%</div>
                      <div className="text-xs text-gray-500">✓ Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">75%</div>
                      <div className="text-xs text-gray-500">✓ Approved</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Taskings</CardTitle>
                <FolderOpen className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTaskings}</div>
                <p className="text-xs text-blue-100">Active workstreams</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <FileCheck className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTaskings}</div>
                <p className="text-xs text-green-100">Briefings generated</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressTaskings}</div>
                <p className="text-xs text-amber-100">Ready for analysis</p>
              </CardContent>
            </Card>
          </div>

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

      {/* Tasking Creation Modal */}
      <ProjectCreationModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={handleTaskingCreated}
      />
    </div>
  );
};

export default Dashboard;
