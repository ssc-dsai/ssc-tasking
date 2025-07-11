import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { CompactBriefingChat } from './CompactBriefingChat';
import { BriefingDisplay } from '../briefings/BriefingDisplay';
import { BriefingModal } from '../briefings/BriefingModal';
import { Folder, Upload, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskingUsers } from './TaskingUsers';

interface Project {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface ProjectViewProps {
  project: Project;
}

// Mock files data with different sets for different projects
const getFilesForProject = (projectId: string): ProjectFile[] => {
  if (projectId === '1') {
    // Q4 Financial Performance Review - Full details
    return [
      {
        id: '1',
        name: 'Q4_Financial_Report.pdf',
        type: 'application/pdf',
        size: 2048000,
        uploadedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Budget_Analysis_Q4.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000,
        uploadedAt: '2024-01-14'
      },
      {
        id: '3',
        name: 'Executive_Summary_Q4.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 512000,
        uploadedAt: '2024-01-13'
      },
      {
        id: '4',
        name: 'Cash_Flow_Analysis.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 756000,
        uploadedAt: '2024-01-12'
      },
      {
        id: '5',
        name: 'Cost_Optimization_Report.pdf',
        type: 'application/pdf',
        size: 1200000,
        uploadedAt: '2024-01-11'
      },
      {
        id: '6',
        name: 'Revenue_Performance_Q4.csv',
        type: 'text/csv',
        size: 245000,
        uploadedAt: '2024-01-10'
      },
      {
        id: '7',
        name: 'Board_Meeting_Notes.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 890000,
        uploadedAt: '2024-01-09'
      },
      {
        id: '8',
        name: 'Variance_Analysis_Report.pdf',
        type: 'application/pdf',
        size: 1500000,
        uploadedAt: '2024-01-08'
      }
    ];
  } else if (projectId === '2') {
    // Global Product Launch Strategy - Files but no briefings
    return [
      {
        id: '9',
        name: 'Market_Research_Report.pdf',
        type: 'application/pdf',
        size: 3200000,
        uploadedAt: '2024-01-10'
      },
      {
        id: '10',
        name: 'Competitive_Analysis.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1800000,
        uploadedAt: '2024-01-09'
      },
      {
        id: '11',
        name: 'Customer_Segmentation_Data.csv',
        type: 'text/csv',
        size: 650000,
        uploadedAt: '2024-01-08'
      },
      {
        id: '12',
        name: 'Pricing_Strategy_Models.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1100000,
        uploadedAt: '2024-01-07'
      },
      {
        id: '13',
        name: 'Go_To_Market_Plan.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 950000,
        uploadedAt: '2024-01-06'
      },
      {
        id: '14',
        name: 'Product_Roadmap.pdf',
        type: 'application/pdf',
        size: 2100000,
        uploadedAt: '2024-01-05'
      }
    ];
  } else {
    // Random files for other projects
    return [
      {
        id: `${projectId}-1`,
        name: 'Project_Overview.pdf',
        type: 'application/pdf',
        size: 1024000,
        uploadedAt: '2024-01-01'
      },
      {
        id: `${projectId}-2`,
        name: 'Analysis_Report.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 512000,
        uploadedAt: '2023-12-30'
      }
    ];
  }
};



export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const [files, setFiles] = useState<ProjectFile[]>(getFilesForProject(project.id));
  const [generatedBriefing, setGeneratedBriefing] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles: ProjectFile[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString().split('T')[0]
    }));
    setFiles([...files, ...newFiles]);
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(files.filter(file => file.id !== fileId));
  };

  const handleGenerateBriefing = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    // TODO: Replace with actual briefing generation
    setGeneratedBriefing(null);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto h-full">
      {/* Project Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Folder className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 gap-6 h-[calc(100vh-220px)]">
        {/* Generated Briefing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full w-full overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Generated Briefing</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBriefingModalOpen(true)}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span>Full View</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {generatedBriefing ? (
              <BriefingDisplay briefing={generatedBriefing} compact={true} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-center">
                <div>
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No briefing generated yet</h3>
                  <p className="text-gray-600">Upload files and use the assistant below to generate your first briefing.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Files */}
        <div className="row-span-1 col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Upload className="w-3 h-3 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
            <div className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {files.length} files
            </div>
          </div>
          <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-y-auto">
            <FileUpload onFileUpload={handleFileUpload} />
            <div className="flex-1 overflow-y-auto">
              <FilesList files={files} onFileRemove={handleFileRemove} />
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="row-span-1 col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-hidden">
          <CompactBriefingChat
            onGenerate={handleGenerateBriefing}
            isGenerating={isGenerating}
            hasFiles={files.length > 0}
            onOpenModal={() => {/* TODO: Open full chat modal */}}
          />
        </div>

        {/* Tasking Users */}
        <div className="row-span-1 col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-hidden">
          {/* Replace 'project.id' with the correct taskingId if needed */}
          <TaskingUsers taskingId={project.id} />
        </div>
      </div>

      {/* Briefing Modal */}
      <BriefingModal
        isOpen={isBriefingModalOpen}
        onClose={() => setIsBriefingModalOpen(false)}
        briefing={generatedBriefing}
      />
    </div>
  );
};
