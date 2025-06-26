import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, MessageSquare, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !hasFiles || isGenerating) return;
    onGenerate(prompt);
    setPrompt("");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm rounded-xl flex flex-col h-full max-h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tasking.chat')}</h2>
        </div>
        {onOpenModal && (
          <Button variant="ghost" size="sm" onClick={onOpenModal}>
            <Maximize2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0">
          {chatMessages.length > 0 ? (
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-slate-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400 text-sm">
              {t('common.loading')}
            </div>
          )}
        </div>

        {/* Form floated to bottom */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('tasking.chatPlaceholderDefault')}
            className="min-h-[80px] resize-none text-sm border border-gray-300 dark:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
            disabled={isGenerating}
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-slate-400">
              {!hasFiles && t('tasking.noFiles')}
              {hasFiles && !prompt.trim() && t('tasking.typeYourMessage')}
              {hasFiles && prompt.trim() && t('common.loading')}
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
                  <span className="text-xs">{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 mr-1" />
                  <span className="text-xs">{t('tasking.send')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
