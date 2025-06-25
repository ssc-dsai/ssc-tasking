export interface Tasking {
  id: string;
  name: string;
  description: string;
  category: 'personal' | 'shared';
  fileCount: number;
  briefingCount?: number;
  chatCount?: number;
  userCount?: number;
  status: string;
  createdAt: string;
  lastUpdated: string;
  users: Array<{
    id: string;
    full_name: string;
    email: string;
  }>;
  ownerProfile?: {
    id: string;
    full_name: string;
    email: string;
  };
} 