
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Copy, 
  MessageSquare, 
  ChevronDown, 
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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

interface BriefingDisplayProps {
  briefing: BriefingNote;
}

export const BriefingDisplay: React.FC<BriefingDisplayProps> = ({ briefing }) => {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    keyPoints: true,
    risks: true,
    recommendations: true,
    nextSteps: true
  });
  const [chatMode, setChatMode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCopy = () => {
    const content = `# ${briefing.title}

## Executive Summary
${briefing.summary}

## Key Insights
${briefing.keyPoints.map(point => `• ${point}`).join('\n')}

## Risks & Concerns
${briefing.risks.map(risk => `• ${risk}`).join('\n')}

## Recommendations
${briefing.recommendations.map(rec => `• ${rec}`).join('\n')}

## Next Steps
${briefing.nextSteps.map(step => `• ${step}`).join('\n')}

Generated on ${briefing.createdAt}`;
    
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{briefing.title}</h2>
              <p className="text-sm text-gray-500">Generated on {briefing.createdAt}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button 
            variant={chatMode ? "default" : "outline"} 
            size="sm"
            onClick={() => setChatMode(!chatMode)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Revise
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Executive Summary */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('summary')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
            </div>
            {expandedSections.summary ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          {expandedSections.summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{briefing.summary}</p>
            </div>
          )}
        </div>

        {/* Key Points */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('keyPoints')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
            </div>
            {expandedSections.keyPoints ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          {expandedSections.keyPoints && (
            <div className="space-y-2">
              {briefing.keyPoints.map((point, index) => (
                <div key={index} className="flex items-start space-x-3 bg-green-50 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{point}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risks */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('risks')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Risks & Concerns</h3>
            </div>
            {expandedSections.risks ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          {expandedSections.risks && (
            <div className="space-y-2">
              {briefing.risks.map((risk, index) => (
                <div key={index} className="flex items-start space-x-3 bg-amber-50 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{risk}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('recommendations')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
            </div>
            {expandedSections.recommendations ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          {expandedSections.recommendations && (
            <div className="space-y-2">
              {briefing.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('nextSteps')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
            </div>
            {expandedSections.nextSteps ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronRight className="w-5 h-5 text-gray-400" />
            }
          </button>
          {expandedSections.nextSteps && (
            <div className="space-y-2">
              {briefing.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 bg-purple-50 rounded-lg p-3">
                  <ArrowRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-sm">{step}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Revision Interface */}
      {chatMode && (
        <div className="border-t border-gray-100 p-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Revise this briefing</h4>
            <div className="flex space-x-3">
              <Textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask for changes like 'expand on budget risks' or 'add more detail about customer metrics'..."
                className="flex-1"
              />
              <Button disabled={!chatMessage.trim()}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
