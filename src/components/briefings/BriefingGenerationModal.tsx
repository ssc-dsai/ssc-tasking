import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Sparkles, X } from 'lucide-react';
import { useVectorSearch } from '@/hooks/useVectorSearch';
import { useSaveBriefing } from '@/hooks/useSaveBriefing';
import { getChatCompletionWithContext, getChatCompletion } from '@/lib/openai';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();

  const samplePrompts = [
    t('briefing.sampleExecutiveSummary'),
    t('briefing.sampleGovernanceRisk'),
    t('briefing.sampleStrategicPerformance'),
    t('briefing.sampleLeadershipBriefing'),
    t('briefing.sampleExecutiveDashboard')
  ];

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
        const briefingPrompt = `You must respond with ONLY clean markdown content. Do not include any conversational text, explanations, or introductions. Start directly with the markdown content.

Generate a comprehensive briefing document in markdown format with the following structure:

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

IMPORTANT: Return ONLY the markdown content starting with the # header. Do not include any conversational text like "Sure thing!" or "Here's a briefing..." - just return the pure markdown document.`;

        briefingContent = await getChatCompletionWithContext(
          [{ role: 'user', content: briefingPrompt }],
          searchResult.results
        );
      } else {
        console.log('⚠️ [Briefing Generation] No relevant content found');
        briefingContent = await getChatCompletion([
          { 
            role: 'system', 
            content: 'You must respond with ONLY clean markdown content. No conversational text or explanations. Start directly with a markdown briefing document. The user has uploaded files but no relevant content was found for their request - create a brief markdown document explaining this limitation.' 
          },
          { role: 'user', content: `Generate a briefing titled "${title}" with the following requirements: ${prompt}. Return ONLY markdown starting with # ${title}` }
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <DialogHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('tasking.generateBriefing')}
              </DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2">
            Create a comprehensive briefing document from your uploaded files using AI assistance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="briefing-title" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t('briefing.briefingTitle')}
            </Label>
            <Input
              id="briefing-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('briefing.briefingTitleExample')}
              className="w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              disabled={isGenerating}
            />
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="briefing-prompt" className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t('briefing.briefingRequirements')}
            </Label>
            <Textarea
              id="briefing-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('briefing.briefingRequirementsPlaceholder')}
              className="min-h-[120px] resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
              disabled={isGenerating}
            />
          </div>

          {/* Sample Prompts */}
          {prompt.length === 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {t('briefing.sampleBriefingTypes')}
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {samplePrompts.map((sample, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSamplePromptClick(sample)}
                    className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors"
                    disabled={isGenerating}
                  >
                    <div className="flex items-start space-x-2">
                      <FileText className="w-4 h-4 text-gray-400 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-slate-300">"{sample}"</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-slate-400">
              {saveError && <span className="text-red-600 dark:text-red-400">Save error: {saveError}</span>}
              {!saveError && !hasFiles && "Upload files before generating a briefing"}
              {!saveError && hasFiles && !title.trim() && t('briefing.briefingTitlePlaceholder')}
              {!saveError && hasFiles && title.trim() && !prompt.trim() && "Describe your briefing requirements"}
              {!saveError && hasFiles && title.trim() && prompt.trim() && "Ready to generate briefing"}
            </div>
            <div className="text-gray-400 dark:text-slate-500">
              {t('common.poweredByAI')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-600">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
              className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!hasFiles || !title.trim() || !prompt.trim() || isGenerating || isSearching || isSaving}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isGenerating || isSearching || isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSearching ? t('common.loading') : isSaving ? t('common.save') : t('briefing.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('briefing.generateBriefing')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 