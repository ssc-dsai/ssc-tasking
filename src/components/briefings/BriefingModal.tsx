
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BriefingDisplay } from './BriefingDisplay';
import { X } from 'lucide-react';
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
}

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: BriefingNote | null;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({
  isOpen,
  onClose,
  briefing
}) => {
  if (!briefing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg z-10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {briefing.title}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <BriefingDisplay briefing={briefing} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
