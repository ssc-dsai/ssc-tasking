-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload files to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view files in their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete files in their own folder" ON storage.objects;

-- Create new storage policies for tasking-based folder structure
CREATE POLICY "Users can upload files to their tasking folders" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view files in their tasking folders" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files in their tasking folders" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
            AND taskings.user_id = auth.uid()
        )
    );
