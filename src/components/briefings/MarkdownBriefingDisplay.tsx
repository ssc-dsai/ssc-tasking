import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, CheckCircle, AlertTriangle, ArrowRight, FileText } from 'lucide-react';

interface MarkdownBriefingDisplayProps {
  briefing: {
    title: string;
    content: string;
    createdAt?: string;
  };
  hideTitle?: boolean;
  markdownView?: boolean;
}

export const MarkdownBriefingDisplay: React.FC<MarkdownBriefingDisplayProps> = ({ 
  briefing, 
  hideTitle = false,
  markdownView = false 
}) => {
  // Parse markdown content into structured sections
  const parseContentIntoSections = (content: string) => {
    const sections: Array<{title: string, content: string, type: string}> = [];
    
    // Split content by headers
    const parts = content.split(/^##?\s+(.+)$/gm);
    
    // First part is usually intro/summary before first header - skip if it's just the title
    if (parts[0] && parts[0].trim() && !parts[0].trim().toLowerCase().includes('lets create summary')) {
      sections.push({
        title: 'Executive Summary',
        content: parts[0].trim(),
        type: 'summary'
      });
    }
    
    // Process header-content pairs
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        const title = parts[i].trim();
        const content = parts[i + 1].trim();
        
        // Determine section type based on title
        let type = 'default';
        if (title.toLowerCase().includes('summary')) type = 'summary';
        else if (title.toLowerCase().includes('finding') || title.toLowerCase().includes('insight') || title.toLowerCase().includes('key')) type = 'insights';
        else if (title.toLowerCase().includes('risk') || title.toLowerCase().includes('challenge')) type = 'risks';
        else if (title.toLowerCase().includes('recommendation') || title.toLowerCase().includes('action')) type = 'recommendations';
        else if (title.toLowerCase().includes('next') || title.toLowerCase().includes('step')) type = 'nextsteps';
        
        sections.push({ title, content, type });
      }
    }
    
    return sections;
  };

  // Enterprise markdown parser with tight, professional spacing
  const parseMarkdown = (content: string) => {
    const cleaned = content.trim().replace(/\n\s*\n\s*\n+/g, '\n\n').replace(/^\s+/gm, '');
    
    return cleaned
      // Bold and italic
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-700">$1</em>')
      
      // Lists - tight spacing like enterprise apps
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 mb-1.5"><span class="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span><span class="text-gray-700 text-sm leading-5">$1</span></div>')
      
      // Numbered lists
      .replace(/^(\d+)\. (.+)$/gm, '<div class="flex items-start gap-2 mb-1.5"><span class="text-gray-500 text-sm font-medium min-w-[1rem]">$1.</span><span class="text-gray-700 text-sm leading-5">$2</span></div>')
      
      // Paragraphs - tight spacing
      .replace(/^(?!<div)(.*?)$/gm, '<p class="text-gray-700 text-sm leading-5 mb-2">$1</p>')
      
      // Clean up
      .replace(/<p[^>]*>\s*<\/p>/g, '')
      .replace(/\n+/g, ' ');
  };

  const sections = parseContentIntoSections(briefing.content);

  // Helper function to get section styling - standard colors
  const getSectionStyling = (type: string) => {
    switch (type) {
      case 'summary':
        return {
          borderColor: 'border-l-blue-500',
          iconColor: 'text-blue-600',
          icon: TrendingUp,
          dotColor: 'bg-blue-500'
        };
      case 'insights':
        return {
          borderColor: 'border-l-green-500',
          iconColor: 'text-green-600',
          icon: CheckCircle,
          dotColor: 'bg-green-500'
        };
      case 'risks':
        return {
          borderColor: 'border-l-red-500',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          dotColor: 'bg-red-500'
        };
      case 'recommendations':
        return {
          borderColor: 'border-l-purple-500',
          iconColor: 'text-purple-600',
          icon: CheckCircle,
          dotColor: 'bg-purple-500'
        };
      case 'nextsteps':
        return {
          borderColor: 'border-l-indigo-500',
          iconColor: 'text-indigo-600',
          icon: ArrowRight,
          dotColor: 'bg-indigo-500'
        };
      default:
        return {
          borderColor: 'border-l-gray-500',
          iconColor: 'text-gray-600',
          icon: FileText,
          dotColor: 'bg-gray-500'
        };
    }
  };

  // Markdown view - tight enterprise styling
  if (markdownView) {
    let cleanContent = briefing.content
      .replace(/^LEts crdeate summary\s*\n?/gm, '')
      .replace(/^6\/19\/2025,\s*12:00:00\s*AM\s*\n?/gm, '')
      .replace(/^\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}:\d{2}\s*(AM|PM)\s*\n?/gm, '');

    const formattedContent = cleanContent
      // Main title - enterprise size and weight
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">$1</h1>')
      // Section headers - clear hierarchy with minimal spacing
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold text-gray-900 mt-4 mb-2">$1</h2>')
      // Sub-headers
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-medium text-gray-800 mt-3 mb-1.5">$1</h3>')
      // Convert markdown formatting
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="text-gray-700">$1</em>')
      // Lists - tight like enterprise apps
      .replace(/^- (.+)$/gm, '<div class="flex items-start gap-2 mb-1.5"><span class="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span><span class="text-gray-700 text-sm leading-5">$1</span></div>')
      // Paragraphs - minimal spacing
      .replace(/\n\n+/g, '</p><p class="mb-2 text-gray-700 text-sm leading-5">')
      .replace(/\n/g, ' ');

    return (
      <div className="max-w-none">
        <div 
          className="text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: formattedContent
          }}
        />
      </div>
    );
  }

  // Card view - tight enterprise sections
  return (
    <div className="space-y-4">
      {/* Small date at top */}
      {briefing.createdAt && (
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{new Date(briefing.createdAt).toLocaleString()}</span>
          </div>
        </div>
      )}

      {sections.map((section, index) => {
        const formattedContent = parseMarkdown(section.content);

        return (
          <div key={index} className="mb-4">
            {/* Section Header - clear hierarchy */}
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {section.title}
            </h3>
            
            {/* Section Content - tight spacing */}
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ 
                __html: formattedContent
              }} 
            />
          </div>
        );
      })}
    </div>
  );
}; 