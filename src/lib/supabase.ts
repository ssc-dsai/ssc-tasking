import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Helper function to handle auth state changes
export const getSession = () => supabase.auth.getSession()
export const getUser = () => supabase.auth.getUser()

// Storage helpers
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string; upsert?: boolean }
) => {
  return supabase.storage.from(bucket).upload(path, file, options)
}

export const deleteFile = async (bucket: string, paths: string[]) => {
  return supabase.storage.from(bucket).remove(paths)
}

export const getPublicUrl = (bucket: string, path: string) => {
  return supabase.storage.from(bucket).getPublicUrl(path)
}

// Types for our database tables
export type Tasking = {
  id: string;
  name: string;
  description: string | null;
  category: 'personal' | 'shared';
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type FileRecord = {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  tasking_id: string;
  uploaded_by: string;
  created_at: string;
};

// Note: Tasking creation now uses edge function (create-tasking)
// See useCreateTasking hook for the new implementation

// Helper function to upload a file to a tasking
export async function uploadFileToTasking(taskingId: string, file: globalThis.File) {
  // Use cached session (no network round-trip)
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('User not authenticated');

  // First upload to storage
  const filePath = `${taskingId}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Then create file record in database
  const { data, error } = await supabase
    .from('files')
    .insert({
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      tasking_id: taskingId,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
} 