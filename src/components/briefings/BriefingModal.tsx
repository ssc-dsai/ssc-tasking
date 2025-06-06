
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BriefingDisplay } from './BriefingDisplay';

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {briefing.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <BriefingDisplay briefing={briefing} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
