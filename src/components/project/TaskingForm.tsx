
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Loader2 } from 'lucide-react';

interface TaskingFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasFiles: boolean;
}

export const TaskingForm: React.FC<TaskingFormProps> = ({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  hasFiles
}) => {
  const examplePrompts = [
    "Analyze the financial performance and provide key insights for executive decision-making",
    "Summarize market research findings and identify strategic opportunities",
    "Review team performance data and recommend improvement actions",
    "Evaluate project risks and create mitigation strategies"
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Briefing Requirements
        </label>
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what you need in your briefing note. Be specific about the analysis, insights, or recommendations you're looking for..."
          className="min-h-[120px] resize-none"
        />
      </div>

      {prompt.length === 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium">Example prompts:</p>
          <div className="space-y-1">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => onPromptChange(example)}
                className="block text-xs text-primary hover:text-primary/80 text-left"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={onGenerate}
        disabled={!hasFiles || !prompt.trim() || isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Briefing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Generate Briefing Note
          </>
        )}
      </Button>

      {!hasFiles && (
        <p className="text-xs text-amber-600 text-center">
          Please upload files before generating a briefing
        </p>
      )}
    </div>
  );
};
