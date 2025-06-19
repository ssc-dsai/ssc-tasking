import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Sparkles, X } from 'lucide-react';
import { useVectorSearch } from '@/hooks/useVectorSearch';
import { useSaveBriefing } from '@/hooks/useSaveBriefing';
import { getChatCompletionWithContext, getChatCompletion } from '@/lib/openai';

interface BriefingGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskingId: string;
  hasFiles: boolean;
  onBriefingGenerated: (briefing: {
    title: string;
    content: string;
  }) => void;
}

const samplePrompts = [
  "Generate an executive summary briefing analyzing project performance, key deliverables, timeline adherence, and resource efficiency from the uploaded project documents",
  "Create a governance and risk assessment briefing identifying compliance gaps, security concerns, and mitigation strategies based on the project documentation",
  "Produce a strategic performance briefing evaluating project ROI, cost-benefit analysis, and operational impact using data from the uploaded files",
  "Generate a leadership briefing on project status, critical issues, resource needs, and strategic recommendations derived from the project materials",
  "Create an executive dashboard briefing summarizing project KPIs, budget status, milestone progress, and actionable insights from the uploaded documentation"
];

export const BriefingGenerationModal: React.FC<BriefingGenerationModalProps> = ({
  isOpen,
  onClose,
  taskingId,
  hasFiles,
  onBriefingGenerated
}) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { searchDocuments, isSearching } = useVectorSearch();
  const { saveBriefing, isSaving, error: saveError } = useSaveBriefing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !prompt.trim() || !hasFiles || isGenerating) return;

    setIsGenerating(true);

    try {
      console.log('🔄 [Briefing Generation] Starting generation...');
      
      let briefingContent: string;

      // Use vector search to find relevant content
      const searchResult = await searchDocuments(prompt, taskingId);
      
      if (searchResult && searchResult.results.length > 0) {
        console.log('✅ [Briefing Generation] Found', searchResult.results.length, 'relevant chunks');
        
        // Enhanced prompt for briefing generation
        const briefingPrompt = `Generate a comprehensive briefing document in markdown format with the following structure:

# ${title}

## Executive Summary
[Provide a concise overview of the key findings and recommendations]

## Key Findings
[List the most important insights from the analysis]

## Detailed Analysis
[Provide in-depth analysis of the content]

## Risks and Challenges
[Identify potential risks and challenges]

## Recommendations
[Provide specific, actionable recommendations]

## Next Steps
[Outline clear next steps and action items]

## Conclusion
[Summarize the key takeaways]

User Request: ${prompt}

Please create a professional, well-structured briefing document based on the uploaded content. Use proper markdown formatting with headers, bullet points, and emphasis where appropriate.`;

        briefingContent = await getChatCompletionWithContext(
          [{ role: 'user', content: briefingPrompt }],
          searchResult.results
        );
      } else {
        console.log('⚠️ [Briefing Generation] No relevant content found');
        briefingContent = await getChatCompletion([
          { 
            role: 'system', 
            content: 'You are an AI assistant for document analysis. The user has uploaded files but no relevant content was found for their briefing request. Let them know and suggest they refine their request or check their uploaded files.' 
          },
          { role: 'user', content: `Generate a briefing titled "${title}" with the following requirements: ${prompt}` }
        ]);
      }

      console.log('✅ [Briefing Generation] Generated briefing, length:', briefingContent.length);

      // Save to database
      console.log('💾 [Briefing Generation] Saving to database...');
      const saveResult = await saveBriefing({
        tasking_id: taskingId,
        title: title.trim(),
        content: briefingContent,
      });

      if (saveResult) {
        console.log('✅ [Briefing Generation] Saved to database with ID:', saveResult.briefing.id);
        
        // Call the callback with the generated briefing (including database ID)
        onBriefingGenerated({
          title: title.trim(),
          content: briefingContent
        });

        // Reset form and close modal
        setTitle('');
        setPrompt('');
        onClose();
      } else {
        console.error('❌ [Briefing Generation] Failed to save to database');
        // Still show the briefing even if save failed
        onBriefingGenerated({
          title: title.trim(),
          content: briefingContent
        });
        
        // Reset form and close modal
        setTitle('');
        setPrompt('');
        onClose();
      }

    } catch (error) {
      console.error('❌ [Briefing Generation] Error:', error);
      // Handle error - you might want to show a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSamplePromptClick = (samplePrompt: string) => {
    setPrompt(samplePrompt);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setTitle('');
      setPrompt('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Generate Briefing
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="briefing-title" className="text-sm font-medium text-gray-700">
              Briefing Title
            </Label>
            <Input
              id="briefing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AI Initiative Performance Summary, Data Platform ROI Analysis, Automation Program Status Update..."
              className="w-full"
              disabled={isGenerating}
            />
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="briefing-prompt" className="text-sm font-medium text-gray-700">
              Briefing Requirements
            </Label>
            <Textarea
              id="briefing-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want in your briefing. Focus on performance metrics, efficiency analysis, governance issues, or strategic recommendations needed for leadership review..."
              className="min-h-[120px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Sample Prompts */}
          {prompt.length === 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Sample Briefing Types
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {samplePrompts.map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSamplePromptClick(sample)}
                    className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border transition-colors"
                    disabled={isGenerating}
                  >
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">"{sample}"</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500">
              {saveError && <span className="text-red-600">Save error: {saveError}</span>}
              {!saveError && !hasFiles && "Upload files before generating a briefing"}
              {!saveError && hasFiles && !title.trim() && "Enter a briefing title"}
              {!saveError && hasFiles && title.trim() && !prompt.trim() && "Describe your briefing requirements"}
              {!saveError && hasFiles && title.trim() && prompt.trim() && "Ready to generate briefing"}
            </div>
            <div className="text-gray-400">
              Powered by AI + Vector Search
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!hasFiles || !title.trim() || !prompt.trim() || isGenerating || isSearching || isSaving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isGenerating || isSearching || isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSearching ? 'Searching...' : isSaving ? 'Saving...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Briefing
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 