import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BriefingDisplay } from './BriefingDisplay';
import { MarkdownBriefingDisplay } from './MarkdownBriefingDisplay';
import { X, Download } from 'lucide-react';
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
  if (!briefing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        {/* Fixed Header - enterprise style */}
        <DialogHeader className="px-8 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {briefing.title}
              </DialogTitle>
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
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
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                className="flex items-center space-x-2 text-xs ml-4"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        
        {/* Scrollable Content - enterprise spacing */}
        <div className="px-8 py-6 overflow-y-auto max-h-[calc(95vh-80px)] bg-white">
          {briefing.content ? (
            <MarkdownBriefingDisplay 
              briefing={{
                title: briefing.title,
                content: briefing.content,
                createdAt: briefing.createdAt
              }}
              hideTitle={true}
            />
          ) : (
            <BriefingDisplay briefing={briefing} hideTitle={true} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
