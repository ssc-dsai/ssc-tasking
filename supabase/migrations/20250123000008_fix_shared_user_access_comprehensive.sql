-- Comprehensive fix for shared user access to files, embeddings, chat, and vector search

-- 1. Update files policies to allow shared users
DROP POLICY IF EXISTS "Users can view files in their taskings" ON public.files;
CREATE POLICY "Users can view files in their taskings" ON public.files
    FOR SELECT USING (
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

DROP POLICY IF EXISTS "Users can delete files from their taskings" ON public.files;
CREATE POLICY "Users can delete files from their taskings" ON public.files
    FOR DELETE USING (
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

-- 2. Update briefings policies to allow shared users
DROP POLICY IF EXISTS "Users can view briefings in their taskings" ON public.briefings;
CREATE POLICY "Users can view briefings in their taskings" ON public.briefings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
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

DROP POLICY IF EXISTS "Users can insert briefings to their taskings" ON public.briefings;
CREATE POLICY "Users can insert briefings to their taskings" ON public.briefings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
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

DROP POLICY IF EXISTS "Users can update briefings in their taskings" ON public.briefings;
CREATE POLICY "Users can update briefings in their taskings" ON public.briefings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
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

-- 3. Update document embeddings policies to allow shared users
DROP POLICY IF EXISTS "Users can view embeddings for their files" ON public.document_embeddings;
CREATE POLICY "Users can view embeddings for their files" ON public.document_embeddings
    FOR SELECT USING (
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

-- 4. Update chat messages policies to allow shared users
DROP POLICY IF EXISTS "Users can view own chat" ON public.chat_messages;
CREATE POLICY "Users can view own chat" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = chat_messages.tasking_id
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

DROP POLICY IF EXISTS "Users can insert own chat" ON public.chat_messages;
CREATE POLICY "Users can insert own chat" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = chat_messages.tasking_id
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

-- 5. Update match_documents function to allow shared users
DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid);
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.3,
    match_count int DEFAULT 10,
    filter_tasking_id uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    file_id uuid,
    content text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        document_embeddings.id,
        document_embeddings.file_id,
        document_embeddings.content,
        1 - (document_embeddings.embedding <=> query_embedding) as similarity,
        document_embeddings.metadata
    FROM document_embeddings
    JOIN files ON files.id = document_embeddings.file_id
    JOIN taskings ON taskings.id = files.tasking_id
    WHERE 
        -- Allow both owners and shared users
        (
            taskings.user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM public.shared_taskings
                WHERE shared_taskings.tasking_id = taskings.id
                AND shared_taskings.user_id = auth.uid()
            )
        )
        AND (filter_tasking_id IS NULL OR files.tasking_id = filter_tasking_id)
        AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY document_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 6. Update storage policies to allow shared users (for file access)
DROP POLICY IF EXISTS "Users can view files in their tasking folders" ON storage.objects;
CREATE POLICY "Users can view files in their tasking folders" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
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

DROP POLICY IF EXISTS "Users can upload files to their tasking folders" ON storage.objects;
CREATE POLICY "Users can upload files to their tasking folders" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
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

DROP POLICY IF EXISTS "Users can delete files in their tasking folders" ON storage.objects;
CREATE POLICY "Users can delete files in their tasking folders" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND EXISTS (
            SELECT 1 FROM public.taskings 
            WHERE taskings.id::text = (storage.foldername(name))[1]
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