import React from 'react';
import { FileText, Calendar, Folder, ArrowRight } from 'lucide-react';

interface Briefing {
  id: string;
  title: string;
  taskingName: string;
  createdAt: string;
  summary: string;
}

interface BriefingsListProps {
  briefings: Briefing[];
  onBriefingClick?: (briefing: Briefing) => void;
}

export const BriefingsList: React.FC<BriefingsListProps> = ({ briefings, onBriefingClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent Briefings</h2>
        <span className="text-sm text-slate-500">{briefings.length} briefings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {briefings.map((briefing) => (
          <div
            key={briefing.id}
            className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
            onClick={() => onBriefingClick?.(briefing)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {briefing.title}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Folder className="w-3 h-3" />
                  <span className="truncate">{briefing.taskingName}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {briefing.summary}
            </p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3 h-3" />
                <span>{briefing.createdAt}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-600 group-hover:text-blue-700 font-medium">
                <span>Open</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {briefings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-medium text-slate-900 mb-2">No briefings yet</h3>
          <p className="text-slate-600 text-sm max-w-sm mx-auto">
            Create a tasking and upload files to generate your first AI-powered briefing note.
          </p>
        </div>
      )}
    </div>
  );
};
