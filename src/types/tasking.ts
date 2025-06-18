export interface Tasking {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'shared';
  fileCount: number;
  status: string;
  createdAt: string;
  lastUpdated: string;
  users: any[]; // We can type this more specifically when we add user support
} 