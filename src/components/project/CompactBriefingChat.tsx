
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MessageSquare, Maximize2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface CompactBriefingChatProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  hasFiles: boolean;
  onOpenModal?: () => void;
  chatMessages?: ChatMessage[];
}

export const CompactBriefingChat: React.FC<CompactBriefingChatProps> = ({
  onGenerate,
  isGenerating,
  hasFiles,
  onOpenModal,
  chatMessages = []
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !hasFiles || isGenerating) return;
    onGenerate(prompt);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Chat History</h3>
        </div>
        {onOpenModal && (
          <Button variant="ghost" size="sm" onClick={onOpenModal}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Chat Messages with min-height to push form down */}
      <div className="flex-1 flex flex-col min-h-[200px]">
        <div className="flex-1 overflow-y-auto mb-4">
          {chatMessages.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No chat history yet
            </div>
          )}
        </div>

        {/* Form floated to bottom */}
        <form onSubmit={handleSubmit} className="space-y-3 mt-auto">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What insights do you need? Describe your briefing requirements..."
            className="min-h-[80px] resize-none text-sm border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
    </div>
  );
};
