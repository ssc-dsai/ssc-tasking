
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { TaskingForm } from './TaskingForm';
import { BriefingDisplay } from '../briefings/BriefingDisplay';
import { Button } from '@/components/ui/button';
import { Folder, Upload, FileText, Zap } from 'lucide-react';

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

const mockFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'Q4_Financial_Report.pdf',
    type: 'application/pdf',
    size: 2048000,
    uploadedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Budget_Analysis.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024000,
    uploadedAt: '2024-01-14'
  },
  {
    id: '3',
    name: 'Meeting_Notes.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 512000,
    uploadedAt: '2024-01-13'
  }
];

const mockBriefingNote = {
  id: '1',
  title: 'Q4 Budget Analysis Executive Summary',
  summary: 'The Q4 financial analysis reveals strong performance in core business units with revenue exceeding targets by 12%. However, operational costs have increased by 8% compared to Q3, primarily driven by expanded marketing initiatives and technology infrastructure investments.',
  keyPoints: [
    'Revenue growth of 12% above target, driven by strong performance in enterprise sales',
    'Operating expenses increased 8% due to strategic technology investments',
    'Cash flow remains strong with 15% improvement over previous quarter',
    'Customer acquisition costs decreased by 5% while retention improved to 94%'
  ],
  risks: [
    'Market volatility could impact Q1 projections',
    'Increased competition in core market segments',
    'Supply chain disruptions affecting product delivery timelines'
  ],
  recommendations: [
    'Implement cost optimization program targeting non-essential operational expenses',
    'Accelerate digital transformation initiatives to improve operational efficiency',
    'Diversify revenue streams to reduce dependency on enterprise segment',
    'Strengthen supplier relationships to mitigate supply chain risks'
  ],
  nextSteps: [
    'Schedule executive review meeting for budget reallocation decisions',
    'Initiate cost reduction taskforce with department heads',
    'Develop contingency plans for Q1 market scenarios',
    'Update quarterly forecasts based on current trends'
  ],
  createdAt: '2024-01-15',
  projectId: '1'
};

export const ProjectView: React.FC<ProjectViewProps> = ({ project }) => {
  const [files, setFiles] = useState<ProjectFile[]>(mockFiles);
  const [taskingPrompt, setTaskingPrompt] = useState('');
  const [generatedBriefing, setGeneratedBriefing] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateBriefing = async () => {
    if (!taskingPrompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratedBriefing(mockBriefingNote);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Folder className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Project Setup */}
        <div className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
            </div>
            <FileUpload onFileUpload={handleFileUpload} />
            <FilesList files={files} onFileRemove={handleFileRemove} />
          </div>

          {/* Tasking Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Briefing Requirements</h2>
            </div>
            <TaskingForm
              prompt={taskingPrompt}
              onPromptChange={setTaskingPrompt}
              onGenerate={handleGenerateBriefing}
              isGenerating={isGenerating}
              hasFiles={files.length > 0}
            />
          </div>
        </div>

        {/* Right Column - Generated Briefing */}
        <div className="space-y-8">
          {generatedBriefing ? (
            <BriefingDisplay briefing={generatedBriefing} />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Generate</h3>
              <p className="text-gray-600 mb-4">
                Upload your files and enter your briefing requirements to generate an AI-powered summary.
              </p>
              <div className="text-sm text-gray-500">
                Files uploaded: {files.length} • Requirements: {taskingPrompt.length > 0 ? 'Complete' : 'Pending'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
