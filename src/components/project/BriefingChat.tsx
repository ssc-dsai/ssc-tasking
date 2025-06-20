
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Loader2, Send, MessageSquare } from 'lucide-react';

interface BriefingChatProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  hasFiles: boolean;
}

export const BriefingChat: React.FC<BriefingChatProps> = ({
  onGenerate,
  isGenerating,
  hasFiles
}) => {
  const [prompt, setPrompt] = useState('');

  const examplePrompts = [
    "Analyze the financial performance and provide key insights for executive decision-making",
    "Summarize market research findings and identify strategic opportunities",
    "Review team performance data and recommend improvement actions",
    "Evaluate project risks and create mitigation strategies"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !hasFiles || isGenerating) return;
    onGenerate(prompt);
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Briefing Assistant</h2>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Chat Messages Area */}
        <div className="flex-1 mb-4 space-y-4 min-h-[200px]">
          {/* Welcome Message */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  Welcome! I'm ready to help you generate a comprehensive briefing note from your project files.
                </p>
                <div className="text-xs text-gray-500">
                  Status: {hasFiles ? `${hasFiles ? 'Files ready' : 'No files'} • Ready to generate` : 'Upload files to begin'}
                </div>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          {prompt.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Try these example prompts:</p>
              <div className="space-y-2">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">"{example}"</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t pt-4">
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need in your briefing note. Be specific about the analysis, insights, or recommendations you're looking for..."
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {!hasFiles && "Please upload files before generating a briefing"}
                {hasFiles && !prompt.trim() && "Enter your briefing requirements above"}
                {hasFiles && prompt.trim() && "Ready to generate your briefing note"}
              </div>
              
              <Button
                type="submit"
                disabled={!hasFiles || !prompt.trim() || isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Briefing</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
