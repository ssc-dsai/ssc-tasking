import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/project/FileUpload';
import { FilesList } from '../components/project/FilesList';
import { CompactBriefingChat } from '../components/project/CompactBriefingChat';
import { BriefingDisplay } from '../components/briefings/BriefingDisplay';
import { BriefingModal } from '../components/briefings/BriefingModal';
import { Folder, Upload, FileText, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tasking {
  id: string;
  name: string;
  description: string;
  fileCount: number;
  createdAt: string;
}

interface TaskingFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

// Mock files data with different sets for different projects
const getFilesForTasking = (taskingId: string): TaskingFile[] => {
  if (taskingId === '1') {
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
  } else if (taskingId === '2') {
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
    // Random files for other taskings
    return [
      {
        id: `${taskingId}-1`,
        name: 'Tasking_Overview.pdf',
        type: 'application/pdf',
        size: 1024000,
        uploadedAt: '2024-01-01'
      },
      {
        id: `${taskingId}-2`,
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

const TaskingView: React.FC = () => {
  const { taskingId } = useParams();
  const navigate = useNavigate();
  
  // Mock tasking data
  const mockTasking: Tasking = {
    id: taskingId || '1',
    name: 'Q4 Financial Review',
    description: 'Quarterly financial analysis and performance review',
    fileCount: 8,
    createdAt: '2024-01-15'
  };

  const [files, setFiles] = useState<TaskingFile[]>(getFilesForTasking(taskingId || '1'));

  const [generatedBriefing, setGeneratedBriefing] = useState(taskingId === '1' ? {
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
  } : null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    taskingId === '1' ? [
      {
        id: '1',
        type: 'user',
        content: 'Analyze the financial performance and provide key insights for executive decision-making',
        timestamp: '2024-01-15 14:30'
      },
      {
        id: '2',
        type: 'ai',
        content: 'I\'ve analyzed your Q4 financial documents and generated a comprehensive executive summary focusing on performance metrics, risks, and strategic recommendations.',
        timestamp: '2024-01-15 14:32'
      }
    ] : []
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);

  const handleFileUpload = (uploadedFiles: File[]) => {
    const newFiles: TaskingFile[] = uploadedFiles.map((file, index) => ({
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
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Add AI response
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: 'I\'ve analyzed your documents and generated a comprehensive briefing note with key insights, risks, and recommendations.',
      timestamp: new Date().toLocaleString()
    };
    setChatMessages(prev => [...prev, aiMessage]);
    
    setGeneratedBriefing({
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
      createdAt: new Date().toISOString().split('T')[0],
      projectId: taskingId || '1'
    });
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{mockTasking.name}</h1>
              <p className="text-gray-600">{mockTasking.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
          {/* Left Column - Briefing Area */}
          <div className="space-y-4 flex flex-col">
            {/* Generated Briefing Display */}
            {generatedBriefing ? (
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
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
                <BriefingDisplay briefing={generatedBriefing} />
              </div>
            ) : (
              <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No briefing generated yet</h3>
                  <p className="text-gray-600">Upload files and use the assistant below to generate your first briefing.</p>
                </div>
              </div>
            )}

            {/* Chat Messages and Compact Briefing Chat */}
            <div className="space-y-4">
              {/* Chat History */}
              {chatMessages.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 max-h-48 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Chat History</h3>
                  <div className="space-y-3">
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p>{message.content}</p>
                          <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact Briefing Chat */}
              <CompactBriefingChat
                onGenerate={handleGenerateBriefing}
                isGenerating={isGenerating}
                hasFiles={files.length > 0}
              />
            </div>
          </div>

          {/* Right Column - Tasking Files */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Upload className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Tasking Files</h2>
              <div className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                {files.length} files
              </div>
            </div>
            
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              <FileUpload onFileUpload={handleFileUpload} />
              <div className="flex-1 overflow-y-auto">
                <FilesList files={files} onFileRemove={handleFileRemove} />
              </div>
            </div>
          </div>
        </div>

        {/* Briefing Modal */}
        <BriefingModal
          isOpen={isBriefingModalOpen}
          onClose={() => setIsBriefingModalOpen(false)}
          briefing={generatedBriefing}
        />
      </div>
    </div>
  );
};

export default TaskingView;
