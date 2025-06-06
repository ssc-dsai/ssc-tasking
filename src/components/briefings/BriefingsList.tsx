
import React from 'react';
import { FileText, Calendar, Folder } from 'lucide-react';

interface Briefing {
  id: string;
  title: string;
  projectName: string;
  createdAt: string;
  summary: string;
}

interface BriefingsListProps {
  briefings: Briefing[];
}

export const BriefingsList: React.FC<BriefingsListProps> = ({ briefings }) => {
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
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {briefing.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Folder className="w-4 h-4" />
                  <span className="truncate">{briefing.projectName}</span>
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
              <span className="text-primary font-medium">View →</span>
            </div>
          </div>
        ))}
      </div>

      {briefings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No briefings yet</h3>
          <p className="text-gray-600">
            Create a project and upload files to generate your first AI-powered briefing note.
          </p>
        </div>
      )}
    </div>
  );
};
