import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { BriefingDisplay } from './BriefingDisplay';
import { MarkdownBriefingDisplay } from './MarkdownBriefingDisplay';
import { X, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BriefingNote {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  risks: string[];
  recommendations: string[];
  nextSteps: string[];
  createdAt: string;
  projectId: string;
  content?: string; // Optional markdown content for saved briefings
}

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: BriefingNote | null;
  onDownload?: () => void;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  onClose,
  briefing,
  onDownload
}) => {
  const [isMarkdownView, setIsMarkdownView] = useState(false);

  if (!briefing) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col gap-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" aria-describedby="briefing-description">
          {/* Fixed Header - matching TaskingView style */}
          <DialogHeader className="px-4 py-3 border-b border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 flex-shrink-0">
          <DialogDescription className="sr-only">
            View and interact with the generated briefing document
          </DialogDescription>
          <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                {briefing.content ? (() => {
                  const { header } = extractFirstHeader(briefing.content);
                  return header ? (
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {header}
                    </DialogTitle>
                  ) : (
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
                      {briefing.title}
                    </DialogTitle>
                  );
                })() : (
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white truncate">
              {briefing.title}
            </DialogTitle>
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-slate-400 mt-1">
                  <span>Created {new Date(briefing.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}</span>
                </div>
              </div>
              <DialogDescription className="sr-only">
                View and interact with the generated briefing document
              </DialogDescription>
              <div className="flex items-center space-x-2 mr-10">
                {/* Markdown View Toggle - only show for content briefings */}
                {briefing.content && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMarkdownView(!isMarkdownView)}
                    title={isMarkdownView ? 'Switch to Card View' : 'Switch to Markdown View'}
                    className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                
                {/* Download Button */}
              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownload}
                    title="Download Briefing"
                    className="h-8 w-8 p-0 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
          {/* Content Area with no extra spacing */}
          <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800">
            <div className="h-full overflow-y-auto px-4 py-4">
          {briefing.content ? (
            <MarkdownBriefingDisplay 
              briefing={{
                title: briefing.title,
                    content: extractFirstHeader(briefing.content).remainingContent,
                createdAt: briefing.createdAt
              }}
                  markdownView={isMarkdownView}
              hideTitle={true}
            />
          ) : (
            <BriefingDisplay briefing={briefing} hideTitle={true} />
          )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
