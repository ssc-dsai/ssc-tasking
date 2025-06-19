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

  // Enhanced markdown parser for HTML rendering
  const parseMarkdown = (content: string) => {
    const cleaned = content.trim().replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return cleaned
      // Headers (H1-H6) with proper markdown styling
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-100 pb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-gray-200 pb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6 border-b-2 border-gray-300 pb-3">$1</h1>')
      
      // Code blocks (triple backticks)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div class="bg-gray-50 border border-gray-200 rounded-md p-4 my-4 font-mono text-sm overflow-x-auto"><code class="text-gray-800">$2</code></div>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Bold and italic with proper markdown styling
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic text-gray-700">$1</em>')
      
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50">$1</blockquote>')
      
      // Unordered lists with proper markdown bullets
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-2 text-gray-700 leading-relaxed list-disc">$1</li>')
      
      // Numbered lists
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-2 text-gray-700 leading-relaxed list-decimal">$1. $2</li>')
      
      // Wrap consecutive list items in ul/ol tags
      .replace(/(<li[^>]*class="[^"]*list-disc[^"]*"[^>]*>.*?<\/li>)(?:\s*<li[^>]*class="[^"]*list-disc[^"]*"[^>]*>.*?<\/li>)*/gs, '<ul class="my-4 space-y-1">$&</ul>')
      .replace(/(<li[^>]*class="[^"]*list-decimal[^"]*"[^>]*>.*?<\/li>)(?:\s*<li[^>]*class="[^"]*list-decimal[^"]*"[^>]*>.*?<\/li>)*/gs, '<ol class="my-4 space-y-1">$&</ol>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-8 border-t-2 border-gray-200">')
      
      // Paragraphs with proper spacing
      .replace(/^(?!<[h|l|b|u|o|c|d])(.*?)$/gm, '<p class="text-gray-700 leading-relaxed mb-4">$1</p>')
      
      // Clean up empty paragraphs and extra whitespace
      .replace(/<p[^>]*>\s*<\/p>/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  };

  // Raw markdown display - show the actual markdown syntax
  const displayRawMarkdown = (content: string) => {
    // Clean up the content but preserve markdown syntax
    return content
      .replace(/^LEts crdeate summary\s*\n?/gm, '')
      .replace(/^6\/19\/2025,\s*12:00:00\s*AM\s*\n?/gm, '')
      .replace(/^\d{1,2}\/\d{1,2}\/\d{4},\s*\d{1,2}:\d{2}:\d{2}\s*(AM|PM)\s*\n?/gm, '')
      .trim();
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

  // Markdown view - show raw markdown syntax
  if (markdownView) {
    const rawContent = displayRawMarkdown(briefing.content);

    return (
      <div className="max-w-none">
        <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
          {rawContent}
        </pre>
      </div>
    );
  }

  // Card view - render HTML from sections
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const formattedContent = parseMarkdown(section.content);

        return (
          <div key={index} className="mb-8">
            {/* Section Header - markdown style */}
            <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4 border-b-2 border-gray-200 pb-2">
              {section.title}
            </h2>
            
            {/* Section Content - rendered HTML */}
            <div 
              className="markdown-content prose prose-gray max-w-full"
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