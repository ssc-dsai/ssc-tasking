
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { FilesList } from './FilesList';
import { BriefingChat } from './BriefingChat';
import { BriefingDisplay } from '../briefings/BriefingDisplay';
import { Folder, Upload, FileText } from 'lucide-react';

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

const mockBriefingNote = {
  id: '1',
  title: 'Q4 Financial Performance Executive Summary',
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
  const [files, setFiles] = useState<ProjectFile[]>(getFilesForProject(project.id));
  const [generatedBriefing, setGeneratedBriefing] = useState(project.id === '1' ? mockBriefingNote : null);
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

  const handleGenerateBriefing = async (prompt: string) => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setGeneratedBriefing(mockBriefingNote);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
        {/* Left Column - Briefing Chat */}
        <div className="space-y-6">
          <BriefingChat
            onGenerate={handleGenerateBriefing}
            isGenerating={isGenerating}
            hasFiles={files.length > 0}
          />

          {/* Generated Briefing Display */}
          {generatedBriefing && (
            <BriefingDisplay briefing={generatedBriefing} />
          )}
        </div>

        {/* Right Column - Project Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Project Files</h2>
          </div>
          
          <div className="flex-1 flex flex-col space-y-4">
            <FileUpload onFileUpload={handleFileUpload} />
            <div className="flex-1 overflow-y-auto">
              <FilesList files={files} onFileRemove={handleFileRemove} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
