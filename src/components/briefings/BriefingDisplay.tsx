
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
}

export const BriefingDisplay: React.FC<BriefingDisplayProps> = ({ briefing, compact = false }) => {
  const sectionClass = compact ? "space-y-3" : "space-y-4";
  const titleClass = compact ? "text-base" : "text-lg";
  const contentClass = compact ? "text-sm" : "text-base";

  return (
    <div className={sectionClass}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`font-bold text-gray-900 ${titleClass}`}>{briefing.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4" />
              <span>{briefing.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center space-x-2 ${titleClass}`}>
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Executive Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-gray-700 leading-relaxed ${contentClass}`}>{briefing.summary}</p>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center space-x-2 ${titleClass}`}>
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {briefing.keyPoints.map((point, index) => (
              <li key={index} className={`flex items-start space-x-2 ${contentClass}`}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {!compact && (
        <>
          {/* Risks */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span>Key Risks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <ArrowRight className="w-5 h-5 text-indigo-600" />
                <span>Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {briefing.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{step}</span>
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
