import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Activity } from 'lucide-react';

interface ActivityData {
  date: string;
  taskings: number;
  files: number;
  briefings: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium text-slate-900 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
            Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-slate-500 text-sm">
            <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No activity data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.taskings + d.files + d.briefings));
  const chartHeight = 120;
  const chartWidth = 280;
  const barWidth = chartWidth / data.length - 4;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium text-slate-900 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
          Activity Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end justify-center space-x-1 h-32">
            {data.map((day, index) => {
              const totalActivity = day.taskings + day.files + day.briefings;
              const height = maxValue > 0 ? (totalActivity / maxValue) * chartHeight : 0;
              
              return (
                <div key={day.date} className="flex flex-col items-center">
                  <div 
                    className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm min-h-[2px] transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                    style={{ 
                      height: `${height}px`,
                      width: `${barWidth}px`
                    }}
                    title={`${formatDate(day.date)}: ${totalActivity} activities`}
                  />
                  <span className="text-xs text-slate-500 mt-2 transform rotate-0">
                    {formatDate(day.date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
              <span className="text-slate-600">Taskings</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
              <span className="text-slate-600">Files</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
              <span className="text-slate-600">Briefings</span>
            </div>
          </div>

          {/* Summary */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Total this week</span>
              <span className="font-medium text-slate-900">
                {data.reduce((sum, day) => sum + day.taskings + day.files + day.briefings, 0)} activities
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 