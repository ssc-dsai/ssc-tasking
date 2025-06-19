import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SaveBriefingRequest {
  tasking_id: string;
  title: string;
  content: string;
}

interface SaveBriefingResponse {
  success: boolean;
  briefing: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
  };
}

export const useSaveBriefing = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const saveBriefing = async (briefingData: SaveBriefingRequest): Promise<SaveBriefingResponse | null> => {
    if (!session?.access_token) {
      setError('No authentication token available');
      return null;
    }

    setIsSaving(true);
    setError(null);

    try {
      console.log('💾 [useSaveBriefing] Saving briefing to database:', briefingData.title);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-briefing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(briefingData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ [useSaveBriefing] Server error:', errorData);
        throw new Error(`Failed to save briefing: ${errorData}`);
      }

      const result: SaveBriefingResponse = await response.json();
      console.log('✅ [useSaveBriefing] Briefing saved successfully:', result.briefing.id);
      
      return result;

    } catch (err: any) {
      console.error('❌ [useSaveBriefing] Error saving briefing:', err);
      setError(err.message || 'Failed to save briefing');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveBriefing,
    isSaving,
    error,
  };
}; 