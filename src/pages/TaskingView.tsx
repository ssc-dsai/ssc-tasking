import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';
import * as pdfjsLib from 'pdfjs-dist';

import { FilesList } from '../components/project/FilesList';
import { TaskingUsers } from '../components/project/TaskingUsers';
import { CompactBriefingChat } from '../components/project/CompactBriefingChat';
import { BriefingDisplay } from '../components/briefings/BriefingDisplay';
import { BriefingModal } from '../components/briefings/BriefingModal';
import { BriefingGenerationModal } from '../components/briefings/BriefingGenerationModal';
import { MarkdownBriefingDisplay } from '../components/briefings/MarkdownBriefingDisplay';
import { ProjectCreationModal } from '../components/project/ProjectCreationModal';
import { Folder, Upload, FileText, Eye, Menu, X, Plus, Download, FileDown, Users, ChevronRight, ChevronDown, Expand } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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





// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const TaskingView: React.FC = () => {
  const { taskingId } = useParams();
  const navigate = useNavigate();
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTaskingModalOpen, setIsTaskingModalOpen] = useState(false);
  const [isBriefingModalOpen, setIsBriefingModalOpen] = useState(false);
  const [isBriefingGenerationModalOpen, setIsBriefingGenerationModalOpen] = useState(false);
  const [isMarkdownView, setIsMarkdownView] = useState(false);
  const [selectedBriefingIndex, setSelectedBriefingIndex] = useState(0);
  
  // Sidebar taskings state
  const [taskings, setTaskings] = useState<Tasking[]>([]);
  const [isLoadingTaskings, setIsLoadingTaskings] = useState(true);
  
  // Chat assistant UI state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated markdown briefing state
  const [markdownBriefing, setMarkdownBriefing] = useState<{
    title: string;
    content: string;
    createdAt: string;
  } | null>(null);

  // File upload ref for header button
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  // Derive files: real from API, otherwise empty
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
    return [];
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
  
  // Helper to check if we have files
  const hasFiles = files.length > 0;

  // Fetch existing chat history
  const { data: history = [], isLoading: loadingHistory } = useChatMessages(taskingId || '');
  
  // Get briefings from existing tasking data (much simpler!)
  const savedBriefings = isRealTasking && realTaskingData?.data?.briefings ? realTaskingData.data.briefings : [];
  
  // Debug logging - only log when values actually change
  useEffect(() => {
    console.log('📄 [TaskingView] Briefings from tasking data:', savedBriefings.length);
    if (savedBriefings.length > 0) {
      console.log('📄 [TaskingView] All briefings:', savedBriefings.map((b, i) => `${i}: ${b.title} (${new Date(b.created_at).toLocaleString()})`));
    }
  }, [savedBriefings.length]);

  useEffect(() => {
    console.log('🔍 [TaskingView] Debug - isRealTasking:', isRealTasking, 'taskingId:', taskingId);
    console.log('🔍 [TaskingView] Debug - user:', user?.id, 'session:', !!session);
  }, [isRealTasking, taskingId, user?.id, !!session]);
  
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

  // PDF text extraction function (copied from FileUpload component)
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('📄 [TaskingView PDF] Starting extraction for:', file.name);
      console.log('📄 [TaskingView PDF] PDF.js version:', pdfjsLib.version || 'unknown');
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('📄 [TaskingView PDF] File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
      
      // Try to load the PDF
      let pdf;
      try {
        console.log('📄 [TaskingView PDF] Attempting to load PDF document...');
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0
        }).promise;
        console.log('📄 [TaskingView PDF] PDF document loaded successfully');
      } catch (workerError) {
        console.warn('⚠️ [TaskingView PDF] Primary load failed:', workerError.message);
        throw new Error(`PDF loading failed: ${workerError.message}`);
      }
      
      console.log(`📄 [TaskingView PDF] Loaded PDF with ${pdf.numPages} pages`);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const textItems: string[] = [];
          
          for (const item of textContent.items) {
            if (item && typeof item === 'object') {
              let text = '';
              
              if ('str' in item && typeof item.str === 'string') {
                text = item.str;
              }
              
              if (text && text.trim().length > 0) {
                const cleanText = text
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
                  .replace(/[^\x20-\x7E\s\u00A0-\uFFFF]/g, '')
                  .trim();
                
                if (cleanText && /[a-zA-Z0-9]/.test(cleanText)) {
                  textItems.push(cleanText);
                }
              }
            }
          }
          
          if (textItems.length > 0) {
            const pageText = textItems.join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (pageText.length > 0) {
              fullText += pageText + '\n\n';
            }
          }
          
          if (pageNum % 10 === 0 || pageNum === maxPages) {
            console.log(`📄 [TaskingView PDF] Processed ${pageNum}/${maxPages} pages`);
          }
        } catch (pageError) {
          console.warn(`⚠️ [TaskingView PDF] Error on page ${pageNum}:`, pageError.message);
        }
      }
      
      const cleanedText = fullText.trim();
      console.log(`📄 [TaskingView PDF] Total extracted: ${cleanedText.length} characters`);
      
      if (cleanedText.length > 0) {
        const readableChars = cleanedText.match(/[a-zA-Z0-9\s]/g);
        const readabilityRatio = readableChars ? readableChars.length / cleanedText.length : 0;
        
        console.log(`📄 [TaskingView PDF] Text analysis: ${readabilityRatio.toFixed(2)} readability ratio`);
        if (cleanedText.length > 50) {
          const firstChars = cleanedText.substring(0, 50);
          console.log(`📄 [TaskingView PDF] First 50 chars:`, firstChars);
        }
        
        if (readabilityRatio < 0.5) {
          console.warn('⚠️ [TaskingView PDF] Low readability ratio - possible encoding issues');
        }
        
        return cleanedText;
      } else {
        throw new Error('No readable text content found in PDF');
      }
    } catch (error) {
      console.error('❌ [TaskingView PDF] Extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    console.log('📄 [TaskingView] File type detection:', fileType, 'fileName:', fileName);
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📄 [TaskingView] Detected PDF, using PDF extraction');
      return await extractTextFromPDF(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      console.log('📄 [TaskingView] Detected TXT, using text extraction');
      return await file.text();
    }
    
    throw new Error(`Unsupported file type: ${fileType}`);
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
              content: 'You are a friendly AI assistant. The user has uploaded files but you couldn\'t find relevant content for their question. Let them know in a casual, helpful way and suggest they try rephrasing their question or ask about something else in their documents.' 
            },
            { role: 'user', content: prompt }
          ]);
        }
      } else {
        // Fallback to basic completion for mock data or no files
        const systemPrompt = isRealTasking 
          ? 'You are an AI assistant helping with workplace tasks. Be friendly and natural, like a colleague explaining something quickly. Use casual yet clear language, and avoid sounding like a formal report.'
          : 'You are a helpful assistant summarizing content like a human teammate would. Keep things easy to follow, friendly, and use everyday language instead of corporate jargon.';


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
    let briefingText = '';
    let filename = '';
    let mimeType = 'text/plain';

    const selectedSavedBriefing = savedBriefings[selectedBriefingIndex];
    
    if (selectedSavedBriefing) {
      // Download saved briefing as markdown
      briefingText = selectedSavedBriefing.content;
      filename = `${selectedSavedBriefing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    } else if (markdownBriefing) {
      // Download markdown briefing as markdown
      briefingText = markdownBriefing.content;
      filename = `${markdownBriefing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    } else if (generatedBriefing) {
      // Download structured briefing as text
      briefingText = `
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
      filename = `${generatedBriefing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    } else {
      return; // No briefing to download
    }
    
    const blob = new Blob([briefingText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
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

  const handleBriefingGenerated = (briefing: {
    title: string;
    content: string;
  }) => {
    console.log('📄 [TaskingView] New briefing generated:', briefing.title);
    setMarkdownBriefing({
      ...briefing,
      createdAt: new Date().toISOString()
    });
    
    // Show success toast
    toast({
      title: "Briefing Generated Successfully",
      description: `"${briefing.title}" has been created and saved to the database.`,
    });
    
    // Refresh tasking data to get updated briefings
    queryClient.invalidateQueries({ queryKey: ['tasking-details', taskingId] });
    
    // Ensure we select the newest briefing (will be index 0 after refresh)
    console.log('📄 [TaskingView] Setting selection to 0 for new briefing');
    setSelectedBriefingIndex(0);
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Extract first header from briefing content
  const extractFirstHeader = (content: string): { header: string; remainingContent: string } => {
    // Look for the first markdown header (# or ##)
    const headerMatch = content.match(/^(#{1,2})\s+(.+)$/m);
    
    if (headerMatch) {
      const fullHeader = headerMatch[0];
      const headerText = headerMatch[2].trim();
      
      // Remove the first header from the content
      const remainingContent = content.replace(fullHeader, '').trim();
      
      return {
        header: headerText,
        remainingContent: remainingContent
      };
    }
    
    return {
      header: '',
      remainingContent: content
    };
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

  // Reset briefing selection if index is out of bounds
  useEffect(() => {
    if (savedBriefings.length > 0 && selectedBriefingIndex >= savedBriefings.length) {
      console.log('📄 [TaskingView] Current selectedBriefingIndex:', selectedBriefingIndex, 'is out of bounds for', savedBriefings.length, 'briefings');
      console.log('📄 [TaskingView] Setting selectedBriefingIndex to 0');
      setSelectedBriefingIndex(0);
    }
  }, [savedBriefings.length]);

  // Log when briefings are loaded for debugging
  useEffect(() => {
    if (isRealTasking && savedBriefings.length > 0) {
      console.log('📄 [TaskingView] Briefings loaded:', savedBriefings.length, 'briefings');
      console.log('📄 [TaskingView] Latest briefing:', savedBriefings[0].title);
    }
  }, [savedBriefings, isRealTasking]);

  // Header upload button handler
  const handleHeaderUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleHeaderFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log('🔄 [TaskingView] Processing', files.length, 'file(s) from header upload');
      
      // Process files with text extraction
      const processedFiles = [];
      
      for (const file of files) {
        console.log('🔄 [TaskingView] Processing file:', file.name, `(${file.type}, ${file.size} bytes)`);
        
        try {
          const extractedText = await extractTextFromFile(file);
          processedFiles.push({
            file,
            extractedText
          });
          console.log('✅ [TaskingView] Successfully extracted text from:', file.name, `(${extractedText.length} chars)`);
        } catch (error) {
          console.error('❌ [TaskingView] Text extraction failed for:', file.name, error instanceof Error ? error.message : 'Unknown error');
          
          // Add file without extracted text (server will handle it)
          processedFiles.push({
            file
          });
          console.log('⚠️ [TaskingView] Added file without text extraction, server will handle');
        }
      }
      
      handleFileUpload(processedFiles);
      e.target.value = ''; // Reset input
    }
  };

  // Fetch taskings for sidebar
  useEffect(() => {
    const fetchTaskings = async () => {
      if (!user || !session) {
        console.log('No user or session available for taskings');
        return;
      }
      
      console.log('📋 [TaskingView] Fetching taskings for sidebar');
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-taskings?limit=50`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('❌ [TaskingView] Edge function error:', result);
          setIsLoadingTaskings(false);
          return;
        }

        console.log('✅ [TaskingView] Taskings fetched:', result.data?.length || 0);

        const formattedTaskings: Tasking[] = (result.data || []).map((tasking: any) => ({
          id: tasking.id,
          name: tasking.name,
          description: tasking.description || '',
          category: tasking.category,
          fileCount: tasking.file_count || 0,
          status: 'In Progress',
          createdAt: tasking.created_at,
          lastUpdated: tasking.last_activity || tasking.updated_at,
          users: []
        }));

        setTaskings(formattedTaskings);
      } catch (err: any) {
        console.error('❌ [TaskingView] Network or parsing error:', err);
      } finally {
        setIsLoadingTaskings(false);
      }
    };

    fetchTaskings();
  }, [user, session]);

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
          taskings={taskings}
          isLoading={isLoadingTaskings}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader 
          title={currentTasking.name}
        />
        
        <div className="flex-1 p-4 overflow-hidden">
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
            {/* Briefings Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 overflow-hidden flex flex-col">
              {/* Header always visible */}
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Briefings</h2>
                  
                  {/* Briefing Selector */}
                  {savedBriefings.length > 1 && (
                    <Select 
                      value={selectedBriefingIndex.toString()} 
                      onValueChange={(value) => setSelectedBriefingIndex(parseInt(value))}
                    >
                      <SelectTrigger className="w-80">
                        <SelectValue placeholder="Select briefing..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedBriefings.map((briefing, index) => (
                          <SelectItem key={briefing.id} value={index.toString()}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-sm">{briefing.title}</span>
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(briefing.created_at)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {/* Generate Briefing Button */}
                  <Button
                    onClick={() => setIsBriefingGenerationModalOpen(true)}
                    disabled={!hasFiles}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 flex items-center space-x-1"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate</span>
                  </Button>


                </div>
              </div>

                            {/* Content */}
              {savedBriefings[selectedBriefingIndex] ? (
                <div className="flex-1 overflow-hidden">
                  {/* Briefing Content Box */}
                  <div className="h-full border border-gray-200 rounded-lg bg-gray-50">
                    {/* Briefing Box Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-lg border-b border-gray-200">
                      <div className="flex-1 min-w-0 mr-4">
                        {(() => {
                          const { header } = extractFirstHeader(savedBriefings[selectedBriefingIndex].content);
                          return header ? (
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {header}
                            </h3>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Markdown View Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMarkdownView(!isMarkdownView)}
                          title={isMarkdownView ? 'Switch to Card View' : 'Switch to Markdown View'}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Download Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadBriefing}
                          title="Download Briefing"
                          className="h-7 w-7 p-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Full View Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsBriefingModalOpen(true)}
                          title="Open Full View"
                          className="h-7 w-7 p-0"
                        >
                          <Expand className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Briefing Content */}
                    <div className="p-4 h-[calc(100%-60px)] overflow-y-auto bg-white rounded-b-lg">
                      <MarkdownBriefingDisplay 
                        briefing={{
                          title: savedBriefings[selectedBriefingIndex].title,
                          content: extractFirstHeader(savedBriefings[selectedBriefingIndex].content).remainingContent,
                          createdAt: savedBriefings[selectedBriefingIndex].created_at
                        }}
                        markdownView={isMarkdownView}
                        hideTitle={true}
                      />
                    </div>
                  </div>
                </div>
              ) : markdownBriefing ? (
                <div className="flex-1 overflow-hidden">
                  {/* Briefing Content Box */}
                  <div className="h-full border border-gray-200 rounded-lg bg-gray-50">
                    {/* Briefing Box Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-lg border-b border-gray-200">
                      <div className="flex-1 min-w-0 mr-4">
                        {(() => {
                          const { header } = extractFirstHeader(markdownBriefing.content);
                          return header ? (
                            <h3 className="text-xl font-bold text-gray-900 truncate">
                              {header}
                            </h3>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Markdown View Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMarkdownView(!isMarkdownView)}
                          title={isMarkdownView ? 'Switch to Card View' : 'Switch to Markdown View'}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Download Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadBriefing}
                          title="Download Briefing"
                          className="h-7 w-7 p-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Full View Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsBriefingModalOpen(true)}
                          title="Open Full View"
                          className="h-7 w-7 p-0"
                        >
                          <Expand className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Briefing Content */}
                    <div className="p-4 h-[calc(100%-60px)] overflow-y-auto bg-white rounded-b-lg">
                      <MarkdownBriefingDisplay 
                        briefing={{
                          ...markdownBriefing,
                          content: extractFirstHeader(markdownBriefing.content).remainingContent
                        }} 
                        hideTitle={true} 
                      />
                    </div>
                  </div>
                </div>
              ) : generatedBriefing ? (
                <div className="flex-1 overflow-hidden">
                  {/* Briefing Content Box */}
                  <div className="h-full border border-gray-200 rounded-lg bg-gray-50">
                    {/* Briefing Box Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-t-lg border-b border-gray-200">
                      <div className="flex-1 min-w-0 mr-4">
                        {/* No header extraction for legacy generatedBriefing */}
                      </div>
                      <div className="flex items-center space-x-1">
                        {/* Markdown View Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMarkdownView(!isMarkdownView)}
                          title={isMarkdownView ? 'Switch to Card View' : 'Switch to Markdown View'}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Download Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadBriefing}
                          title="Download Briefing"
                          className="h-7 w-7 p-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        
                        {/* Full View Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsBriefingModalOpen(true)}
                          title="Open Full View"
                          className="h-7 w-7 p-0"
                        >
                          <Expand className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    {/* Briefing Content */}
                    <div className="p-4 h-[calc(100%-60px)] overflow-y-auto bg-white rounded-b-lg">
                      <BriefingDisplay 
                        briefing={generatedBriefing} 
                        markdownView={isMarkdownView} 
                        hideTitle={true} 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      {isRealTasking ? 'No briefings found for this tasking' : 'No briefing generated yet'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      {hasFiles 
                        ? 'Click "Generate" to create your first briefing' 
                        : 'Upload PDF or TXT files first, then generate a briefing'
                      }
                    </p>
                    <Button
                      onClick={() => setIsBriefingGenerationModalOpen(true)}
                      disabled={!hasFiles}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Briefing
                    </Button>
                  </div>
                </div>
              )}
             </div>

            {/* Chat History and Assistant */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col overflow-hidden">
              <CompactBriefingChat
                onGenerate={handleGenerateBriefing}
                isGenerating={isGenerating || isSearching}
                hasFiles={files.length > 0}
                chatMessages={chatMessages}
              />
            </div>

            {/* Files - Minimum 30% height */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col overflow-hidden min-h-[30vh]">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Upload className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Files</h2>
                  <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {files.length} files
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Upload Button */}
                  <input
                    type="file"
                    multiple
                    onChange={handleHeaderFileInput}
                    className="hidden"
                    accept=".pdf,.txt,.rtf"
                    ref={fileInputRef}
                  />
                  <Button
                    onClick={handleHeaderUploadClick}
                    disabled={isRealTasking && isUploading}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 flex items-center space-x-1"
                    size="sm"
                  >
                    {isRealTasking && isUploading ? (
                      <>
                        <Upload className="w-4 h-4 animate-pulse" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {files.length === 0 ? (
                  <div className="flex-1 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center h-full">
                    <div className="text-center p-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-2">No files uploaded yet</p>
                      <p className="text-gray-500 text-sm">Use the "Upload Files" button in the header to add PDF or TXT files</p>
                    </div>
                  </div>
                ) : (
                  <FilesList files={files} onFileRemove={handleFileRemove} />
                )}
              </div>
            </div>

            {/* Users - Minimum 30% height */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col overflow-hidden min-h-[30vh]">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Add User Button */}
                  <Button
                    disabled={isRealTasking}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center space-x-1"
                    size="sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add User</span>
                  </Button>
                </div>
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
            briefing={savedBriefings[selectedBriefingIndex] ? {
              id: savedBriefings[selectedBriefingIndex].id,
              title: savedBriefings[selectedBriefingIndex].title,
              summary: '', // Saved briefings don't have structured summary
              keyPoints: [],
              risks: [],
              recommendations: [],
              nextSteps: [],
              createdAt: new Date(savedBriefings[selectedBriefingIndex].created_at).toLocaleDateString(),
              projectId: taskingId || '',
              content: savedBriefings[selectedBriefingIndex].content // Pass the markdown content
            } : markdownBriefing ? {
              id: 'markdown',
              title: markdownBriefing.title,
              summary: '',
              keyPoints: [],
              risks: [],
              recommendations: [],
              nextSteps: [],
              createdAt: markdownBriefing.createdAt,
              projectId: taskingId || '',
              content: markdownBriefing.content
            } : generatedBriefing}
            onDownload={handleDownloadBriefing}
          />

          {/* Briefing Generation Modal */}
          <BriefingGenerationModal
            isOpen={isBriefingGenerationModalOpen}
            onClose={() => setIsBriefingGenerationModalOpen(false)}
            taskingId={taskingId || ''}
            hasFiles={hasFiles}
            onBriefingGenerated={handleBriefingGenerated}
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
