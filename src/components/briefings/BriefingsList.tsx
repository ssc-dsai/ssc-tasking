
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
        <h2 className="text-xl font-semibold text-gray-900">Recent Briefings</h2>
        <p className="text-sm text-gray-500">{briefings.length} briefings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {briefings.map((briefing) => (
          <div
            key={briefing.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
            onClick={() => onBriefingClick?.(briefing)}
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {briefing.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{briefing.taskingName}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {briefing.summary}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{briefing.createdAt}</span>
              </div>
              <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 font-medium">
                <span>Open Tasking</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {briefings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No briefings yet</h3>
          <p className="text-gray-600">
            Create a tasking and upload files to generate your first AI-powered briefing note.
          </p>
        </div>
      )}
    </div>
  );
};
