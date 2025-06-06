
import React from 'react';
import { FileText, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface FilesListProps {
  files: ProjectFile[];
  onFileRemove: (fileId: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (type: string) => {
  return <FileText className="w-5 h-5 text-gray-400" />;
};

export const FilesList: React.FC<FilesListProps> = ({ files, onFileRemove }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Uploaded Files ({files.length})
      </h3>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {getFileIcon(file.type)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)} • {file.uploadedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileRemove(file.id)}
              className="text-gray-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
