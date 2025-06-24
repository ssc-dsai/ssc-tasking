-- Fix files INSERT policy to allow shared users to upload files
DROP POLICY IF EXISTS "Users can insert files to their taskings" ON public.files;
CREATE POLICY "Users can insert files to their taskings" ON public.files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = files.tasking_id
            AND (
                taskings.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );

-- Also fix document embeddings INSERT policy for consistency
DROP POLICY IF EXISTS "Users can insert embeddings for their files" ON public.document_embeddings;
CREATE POLICY "Users can insert embeddings for their files" ON public.document_embeddings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.files
            JOIN public.taskings ON taskings.id = files.tasking_id
            WHERE files.id = document_embeddings.file_id
            AND (
                taskings.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );
