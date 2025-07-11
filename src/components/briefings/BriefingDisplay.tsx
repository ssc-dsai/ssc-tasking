import React from 'react';
import { FileText, Calendar, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  compact?: boolean;
  markdownView?: boolean;
  hideTitle?: boolean;
}

export const BriefingDisplay: React.FC<BriefingDisplayProps> = ({ 
  briefing, 
  compact = false, 
  markdownView = false,
  hideTitle = false 
}) => {
  const sectionClass = compact ? "space-y-3" : "space-y-4";
  const titleClass = compact ? "text-base" : "text-lg";
  const contentClass = compact ? "text-sm" : "text-base";

  if (markdownView) {
    return (
      <div className="space-y-6 font-mono text-sm">
        {!hideTitle && (
          <div className="border-b border-gray-200 dark:border-slate-600 pb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{briefing.title}</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">Generated: {briefing.createdAt}</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Executive Summary</h2>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{briefing.summary}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Key Insights</h2>
          <ul className="space-y-1">
            {briefing.keyPoints.map((point, index) => (
              <li key={index} className="text-gray-700 dark:text-slate-300">• {point}</li>
            ))}
          </ul>
        </div>

        {!compact && (
          <>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Key Risks</h2>
              <ul className="space-y-1">
                {briefing.risks.map((risk, index) => (
                  <li key={index} className="text-gray-700 dark:text-slate-300">• {risk}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recommendations</h2>
              <ul className="space-y-1">
                {briefing.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-700 dark:text-slate-300">• {rec}</li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Next Steps</h2>
              <ul className="space-y-1">
                {briefing.nextSteps.map((step, index) => (
                  <li key={index} className="text-gray-700 dark:text-slate-300">• {step}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      {/* Header - only show if not hidden */}
      {!hideTitle && (
        <div className="border-b border-gray-200 dark:border-slate-600 pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`font-bold text-gray-900 dark:text-white ${titleClass}`}>{briefing.title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 mt-1">
                <Calendar className="w-4 h-4" />
                <span>{briefing.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <Card className="border-l-4 border-l-blue-500 dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center space-x-2 ${titleClass}`}>
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="dark:text-white">Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-gray-700 dark:text-slate-300 leading-relaxed ${contentClass}`}>{briefing.summary}</p>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card className="border-l-4 border-l-green-500 dark:bg-slate-800 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center space-x-2 ${titleClass}`}>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="dark:text-white">Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {briefing.keyPoints.map((point, index) => (
              <li key={index} className={`flex items-start space-x-2 ${contentClass}`}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700 dark:text-slate-300">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {!compact && (
        <>
          {/* Risks */}
          <Card className="border-l-4 border-l-amber-500 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="dark:text-white">Key Risks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-slate-300">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-l-4 border-l-purple-500 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="dark:text-white">Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-l-4 border-l-indigo-500 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ArrowRight className="w-5 h-5 text-indigo-600" />
                <span className="dark:text-white">Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-slate-300">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
