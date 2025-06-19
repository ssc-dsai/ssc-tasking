import { useState } from 'react';
import { DocumentChunk } from '@/lib/openai';
import { useAuth } from '@/contexts/AuthContext';
import { DEV } from '@/lib/log';

interface VectorSearchOptions {
  maxResults?: number;
  threshold?: number;
}

interface VectorSearchResult {
  results: DocumentChunk[];
  query: string;
  resultCount: number;
}

export const useVectorSearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const searchDocuments = async (
    query: string,
    taskingId: string,
    options: VectorSearchOptions = {}
  ): Promise<VectorSearchResult | null> => {
    if (!session?.access_token) {
      setError('No authentication token available');
      return null;
    }

    if (!query.trim()) {
      setError('Query cannot be empty');
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      DEV && console.log('[VectorSearch] Searching for:', query);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vector-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            query,
            taskingId,
            maxResults: options.maxResults || 5,
            threshold: options.threshold || 0.3,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed with status ${response.status}`);
      }

      const data = await response.json();
      DEV && console.log('[VectorSearch] Found', data.resultCount, 'results');

      // Transform the results to match DocumentChunk interface
      const transformedResults: DocumentChunk[] = data.results.map((result: any) => ({
        id: result.id,
        content: result.content,
        similarity: result.similarity,
        metadata: {
          fileName: result.metadata.fileName,
          chunkIndex: result.metadata.chunkIndex,
          totalChunks: result.metadata.totalChunks,
        },
      }));

      return {
        results: transformedResults,
        query: data.query,
        resultCount: data.resultCount,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Vector search failed';
      console.error('[VectorSearch] Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchDocuments,
    isSearching,
    error,
  };
}; 