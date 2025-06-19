import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import { FileUpload } from '../components/project/FileUpload';
import { FilesList } from '../components/project/FilesList';
import { TaskingUsers } from '../components/project/TaskingUsers';
import { CompactBriefingChat } from '../components/project/CompactBriefingChat';
import { BriefingDisplay } from '../components/briefings/BriefingDisplay';
import { BriefingModal } from '../components/briefings/BriefingModal';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Folder, Upload, FileText, Eye, Menu, X, Plus, Download, FileDown, Users, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { mockTaskings, Tasking } from '@/data/mockData';
import { useTaskingDetails } from '@/hooks/useTaskingDetails';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';
import { getChatCompletion, getChatCompletionWithContext } from '../lib/openai';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useVectorSearch } from '@/hooks/useVectorSearch';
import { useQueryClient } from '@tanstack/react-query';
import { DEV } from '@/lib/log';

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

// Mock files data with different sets for different taskings
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
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskingModalOpen, setIsTaskingModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  
  // Chat assistant UI state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Any taskingId other than '1' (our demo) will be treated as real
  const isRealTasking = taskingId !== '1';
  // Fetch real tasking details only when real
  const { data: realTaskingData, isLoading: isLoadingReal, error: realError } = useTaskingDetails(taskingId || '', { enabled: isRealTasking });
  
  // Find the current tasking (prefer real data over mock)
  const currentTasking = isRealTasking ? realTaskingData && realTaskingData.data ? {
    id: realTaskingData.data.id,
    name: realTaskingData.data.name,
    description: realTaskingData.data.description || 'Tasking details from database',
    fileCount: realTaskingData.summary.file_count,
    createdAt: new Date(realTaskingData.data.created_at).toISOString().split('T')[0],
    category: 'personal' as const
  } : null : (mockTaskings.find(t => t.id === taskingId) || {
    id: taskingId || '1',
    name: 'Q4 Financial Review',
    description: 'Comprehensive quarterly financial analysis including revenue performance, cost optimization, cash flow evaluation, and strategic financial planning for executive decision-making and stakeholder reporting.',
    fileCount: 8,
    createdAt: '2024-01-15',
    category: 'personal' as const
  });

  // Derive files: real from API, otherwise mock (demo id '1')
  const files: TaskingFile[] = React.useMemo(() => {
    if (isRealTasking && realTaskingData && realTaskingData.data) {
      return realTaskingData.data.files.map(file => ({
        id: file.id,
        name: file.name,
        type: file.mime_type || 'application/octet-stream',
        size: file.file_size,
        uploadedAt: new Date(file.created_at).toISOString().split('T')[0]
      }));
    }
    return getFilesForTasking(taskingId || '1');
  }, [isRealTasking, realTaskingData, taskingId]);

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

  const { toast } = useToast();
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const { searchDocuments, isSearching } = useVectorSearch();

  // Fetch existing chat history
  const { data: history = [], isLoading: loadingHistory } = useChatMessages(taskingId || '');

  // helper to persist message
  const persistChat = async (sender: 'user' | 'assistant' | 'system', content: string) => {
    if (!isRealTasking) return;

    try {
      DEV && console.log('[chat] save');
      const accessToken = session?.access_token;

      DEV && console.log('[chat] token acquired?', !!accessToken);
       
      if (!accessToken) throw new Error('No access token from session');

      DEV && console.log('[chat] calling save-chat-message edge function');

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-chat-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tasking_id: taskingId, sender, content }),
      });

      DEV && console.log('[chat] resp', resp.status);
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('[chat] edge function error:', errText);
        toast({ title: 'Chat save failed', description: errText, variant: 'destructive' });
        throw new Error(errText);
      }

      DEV && console.log('[chat] body ok');
      // Note: we already invalidated query below

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['chat-messages', taskingId, user?.id] });
    } catch (err: any) {
      console.error('[chat] unexpected error:', err);
      throw err;
    }
  };

  // Real file upload functionality for real taskings
  const { uploadFile, isUploading, uploadProgress, error: uploadError } = useFileUpload(taskingId || '', {
    onSuccess: (file) => {
      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to the tasking.`,
      });
      
      // After successful upload, react-query invalidation will refresh file list automatically
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (processedFiles: { file: File; extractedText?: string }[]) => {
    if (isRealTasking && processedFiles.length > 0) {
      // Real upload for real taskings
      const processedFile = processedFiles[0];
      console.log('🔄 [TaskingView] Starting real upload for:', processedFile.file.name);
      console.log('🔄 [TaskingView] Has extracted text:', !!processedFile.extractedText);
      uploadFile(processedFile); // Upload first processed file
    } else {
      // Demo mode: simply log, no mock state mutation
      console.log('🔄 [TaskingView] Mock upload for:', processedFiles.map(pf => pf.file.name));
    }
  };

  const handleFileRemove = (fileId: string) => {
    console.log('Remove requested for file', fileId, '— implement as needed');
  };

  const handleGenerateBriefing = async (prompt: string) => {
    DEV && console.log('[assist] generate with vector search');
    setIsGenerating(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: prompt,
      timestamp: new Date().toLocaleString()
    };
    setChatMessages(prev => [...prev, userMessage]);
    try {
      await persistChat('user', prompt);
      DEV && console.log('[assist] user saved');
    } catch (e) {
      console.error('[assist] failed to save user message:', e);
    }

    try {
      let aiContent: string;

      // Use vector search if we have files and are in a real tasking
      if (isRealTasking && files.length > 0) {
        DEV && console.log('[assist] performing vector search');
        
        const searchResult = await searchDocuments(prompt, taskingId || '');
        
        if (searchResult && searchResult.results.length > 0) {
          DEV && console.log('[assist] found', searchResult.results.length, 'relevant chunks');
          
          // Use context-aware completion
          aiContent = await getChatCompletionWithContext(
            [{ role: 'user', content: prompt }],
            searchResult.results
          );
        } else {
          DEV && console.log('[assist] no relevant chunks found, using basic completion');
          aiContent = await getChatCompletion([
            { 
              role: 'system', 
              content: 'You are an AI assistant for document analysis. The user has uploaded files but no relevant content was found for their query. Let them know and ask for clarification.' 
            },
            { role: 'user', content: prompt }
          ]);
        }
      } else {
        // Fallback to basic completion for mock data or no files
        const systemPrompt = isRealTasking 
          ? 'You are an AI assistant that reviews uploaded documents. The user has not uploaded any files yet. Please let them know they need to upload PDF or TXT files before you can analyze them.'
          : 'You are an AI assistant that reviews the uploaded documents for this tasking and produces concise executive briefings.';

        DEV && console.log('[assist] using basic completion');
        aiContent = await getChatCompletion([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]);
      }

      DEV && console.log('[assist] ai response length:', aiContent.length);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        timestamp: new Date().toLocaleString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
      try {
        await persistChat('assistant', aiContent);
        DEV && console.log('[assist] ai saved');
      } catch (e) {
        console.error('[assist] failed to save AI response:', e);
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast({ title: 'AI Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadBriefing = () => {
    if (!generatedBriefing) return;
    
    const briefingText = `
${generatedBriefing.title}
Generated: ${generatedBriefing.createdAt}

EXECUTIVE SUMMARY
${generatedBriefing.summary}

KEY INSIGHTS
${generatedBriefing.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

KEY RISKS
${generatedBriefing.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}

RECOMMENDATIONS
${generatedBriefing.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

NEXT STEPS
${generatedBriefing.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
    `;
    
    const blob = new Blob([briefingText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedBriefing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadMarkdown = () => {
    if (!generatedBriefing) return;
    
    const markdownText = `# ${generatedBriefing.title}

*Generated: ${generatedBriefing.createdAt}*

## Executive Summary

${generatedBriefing.summary}

## Key Insights

${generatedBriefing.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('\n')}

## Key Risks

${generatedBriefing.risks.map((risk, i) => `${i + 1}. ${risk}`).join('\n')}

## Recommendations

${generatedBriefing.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## Next Steps

${generatedBriefing.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
    `;
    
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedBriefing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTaskingSelect = (taskingId: string) => {
    navigate(`/taskings/${taskingId}`);
    setIsMobileSidebarOpen(false);
  };

  const handleNewTasking = () => {
    setIsTaskingModalOpen(true);
  };

  const handleTaskingCreated = (tasking: Omit<Tasking, 'id' | 'createdAt' | 'category'>) => {
    console.log('New tasking created:', tasking);
    setIsTaskingModalOpen(false);
  };

  // Sync server history into local state once loaded
  useEffect(() => {
    if (!isRealTasking || loadingHistory) return;

    const transformed: ChatMessage[] = history.map(r => ({
      id: r.id,
      type: r.sender === 'user' ? 'user' : 'ai',
      content: r.content,
      timestamp: new Date(r.created_at).toLocaleString(),
    }));

    console.log('[ChatSync] Server returned', transformed.length, 'messages');

    setChatMessages(transformed);
  }, [loadingHistory, history, isRealTasking]);

  // Prefill chat with messages returned by get-tasking-details
  useEffect(() => {
    if (
      isRealTasking &&
      (realTaskingData?.data as any)?.chat_messages &&
      (realTaskingData.data as any).chat_messages.length
    ) {
      const initial: ChatMessage[] = (realTaskingData.data as any).chat_messages.map((m: any) => ({
        id: m.id,
        type: m.sender === 'user' ? 'user' : 'ai',
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleString(),
      }));
      
      // Only set if we don't already have messages to avoid duplicates
      setChatMessages(prev => prev.length === 0 ? initial : prev);
      DEV && console.log('[chat] prefilled', initial.length);
    }
  }, [isRealTasking, realTaskingData]);

  // Loading / error handling for real taskings
  if (isRealTasking) {
    if (isLoadingReal || !realTaskingData) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
          <span className="text-sm text-slate-600">Loading tasking...</span>
        </div>
      );
    }
    if (realError) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-50">
          <span className="text-sm text-red-600">Failed to load tasking: {String(realError)}</span>
        </div>
      );
    }
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
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
          activeTasking={taskingId || null}
          onTaskingSelect={handleTaskingSelect}
          onNewTasking={handleNewTasking}
          isCollapsed={isSidebarCollapsed && !isMobileSidebarOpen}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader 
          title={currentTasking.name}
        />
        
        <div className="flex-1 p-6 lg:p-8 overflow-hidden">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    href="/dashboard"
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-slate-600">
                    {currentTasking.name}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)] overflow-hidden">
            {/* Generated Briefing Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden flex flex-col">
              {/* Header always visible */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Generated Briefing</h2>
                </div>

                {generatedBriefing && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={isMarkdownView ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsMarkdownView(!isMarkdownView)}
                      className="flex items-center space-x-1"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Markdown</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadBriefing}
                      className="flex items-center space-x-1"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </Button>
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
                )}
              </div>

              {/* Content */}
              {generatedBriefing ? (
                <div className="flex-1 overflow-y-auto">
                  <BriefingDisplay briefing={generatedBriefing} markdownView={isMarkdownView} />
                </div>
              ) : (
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600">No briefing generated yet</p>
                    <p className="text-gray-600">Upload files and use the assistant below to generate your first briefing.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat History and Assistant */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
              <CompactBriefingChat
                onGenerate={handleGenerateBriefing}
                isGenerating={isGenerating || isSearching}
                hasFiles={files.length > 0}
                chatMessages={chatMessages}
              />
            </div>

            {/* Tasking Files */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
              <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Upload className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Tasking Files</h2>
                <div className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {files.length} files
                </div>
              </div>
              
              <div className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
                <div className="flex-shrink-0">
                  <FileUpload 
                    onFileUpload={handleFileUpload}
                    isUploading={isRealTasking && isUploading}
                    uploadProgress={isRealTasking ? uploadProgress : null}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <FilesList files={files} onFileRemove={handleFileRemove} />
                </div>
              </div>
            </div>

            {/* Tasking Users */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">
              <div className="flex items-center space-x-3 mb-4 flex-shrink-0">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Tasking Users {isRealTasking && <span className="text-sm font-normal text-gray-500">(Real Data)</span>}
                  {!isRealTasking && <span className="text-sm font-normal text-gray-500">(Mock Data)</span>}
                </h2>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TaskingUsers taskingId={taskingId || '1'} isRealTasking={isRealTasking} />
              </div>
            </div>
          </div>

          {/* Briefing Modal */}
          <BriefingModal
            isOpen={isBriefingModalOpen}
            onClose={() => setIsBriefingModalOpen(false)}
            briefing={generatedBriefing}
            onDownload={handleDownloadBriefing}
          />

          {/* Tasking Creation Modal */}
          <ProjectCreationModal
            isOpen={isTaskingModalOpen}
            onClose={() => setIsTaskingModalOpen(false)}
            onProjectCreated={handleTaskingCreated}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskingView;
