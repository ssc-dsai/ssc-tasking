-- Drop and recreate match_documents function to fix parameter name conflict
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
        taskings.user_id = auth.uid()
        AND (filter_tasking_id IS NULL OR files.tasking_id = filter_tasking_id)
        AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY document_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$; 