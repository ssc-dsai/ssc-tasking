import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Zap, Clock, Target } from 'lucide-react';
import { formatFileSize } from '../../lib/dashboardUtils';

interface QuickStatsProps {
  totalFileSize: number;
  avgFilesPerTasking: number;
  avgBriefingsPerTasking: number;
  recentActivity: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalFileSize,
  avgFilesPerTasking,
  avgBriefingsPerTasking,
  recentActivity
}) => {
  // Mock storage limit for demonstration (100MB)
  const storageLimit = 100 * 1024 * 1024; // 100MB in bytes
  const storageUsagePercent = Math.min((totalFileSize / storageLimit) * 100, 100);
  
  const productivityScore = Math.min(
    Math.round((avgFilesPerTasking * 10 + avgBriefingsPerTasking * 20 + recentActivity * 2) / 3), 
    100
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Storage Usage */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
            <HardDrive className="w-4 h-4 mr-2 text-slate-600" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Used</span>
            <span className="font-medium text-slate-900">{formatFileSize(totalFileSize)}</span>
          </div>
          <Progress value={storageUsagePercent} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">of {formatFileSize(storageLimit)} limit</span>
            <Badge variant="outline" className="text-xs">
              {storageUsagePercent.toFixed(1)}% used
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Productivity Score */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-700 flex items-center">
            <Target className="w-4 h-4 mr-2 text-slate-600" />
            Productivity Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-slate-900">{productivityScore}</div>
            <Badge className={`text-xs ${getScoreColor(productivityScore)}`}>
              {productivityScore >= 80 ? 'Excellent' : 
               productivityScore >= 60 ? 'Good' : 
               productivityScore >= 40 ? 'Average' : 'Getting Started'}
            </Badge>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span>Files per tasking</span>
              <span className="font-medium">{avgFilesPerTasking.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Briefings per tasking</span>
              <span className="font-medium">{avgBriefingsPerTasking.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Recent activity</span>
              <span className="font-medium">{recentActivity} actions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 