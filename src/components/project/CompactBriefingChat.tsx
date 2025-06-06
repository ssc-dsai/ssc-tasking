
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Loader2, Send, MessageSquare, Maximize2 } from 'lucide-react';

interface CompactBriefingChatProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  hasFiles: boolean;
  onOpenModal?: () => void;
}

export const CompactBriefingChat: React.FC<CompactBriefingChatProps> = ({
  onGenerate,
  isGenerating,
  hasFiles,
  onOpenModal
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !hasFiles || isGenerating) return;
    onGenerate(prompt);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Briefing Assistant</h3>
        </div>
        {onOpenModal && (
          <Button variant="ghost" size="sm" onClick={onOpenModal}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What insights do you need? Describe your briefing requirements..."
          className="min-h-[80px] resize-none text-sm"
          disabled={isGenerating}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {!hasFiles && "Upload files to begin"}
            {hasFiles && !prompt.trim() && "Enter requirements above"}
            {hasFiles && prompt.trim() && "Ready to generate"}
          </div>
          
          <Button
            type="submit"
            disabled={!hasFiles || !prompt.trim() || isGenerating}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                <span className="text-xs">Generating...</span>
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                <span className="text-xs">Generate</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
