-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create taskings table
CREATE TABLE IF NOT EXISTS public.taskings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('personal', 'shared')) DEFAULT 'personal',
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    tasking_id UUID REFERENCES public.taskings(id) ON DELETE CASCADE NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create briefings table
CREATE TABLE IF NOT EXISTS public.briefings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    tasking_id UUID REFERENCES public.taskings(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_embeddings table for vector search
CREATE TABLE IF NOT EXISTS public.document_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id UUID REFERENCES public.files(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_taskings_user_id ON public.taskings(user_id);
CREATE INDEX IF NOT EXISTS idx_taskings_created_at ON public.taskings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_tasking_id ON public.files(tasking_id);
CREATE INDEX IF NOT EXISTS idx_briefings_tasking_id ON public.briefings(tasking_id);
CREATE INDEX IF NOT EXISTS idx_briefings_created_by ON public.briefings(created_by);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_file_id ON public.document_embeddings(file_id);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding ON public.document_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taskings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Taskings policies
CREATE POLICY "Users can view own taskings" ON public.taskings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own taskings" ON public.taskings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own taskings" ON public.taskings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own taskings" ON public.taskings
    FOR DELETE USING (auth.uid() = user_id);

-- Files policies
CREATE POLICY "Users can view files in their taskings" ON public.files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = files.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert files to their taskings" ON public.files
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = files.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete files from their taskings" ON public.files
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = files.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

-- Briefings policies
CREATE POLICY "Users can view briefings in their taskings" ON public.briefings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert briefings to their taskings" ON public.briefings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update briefings in their taskings" ON public.briefings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete briefings in their taskings" ON public.briefings
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

-- Document embeddings policies
CREATE POLICY "Users can view embeddings for their files" ON public.document_embeddings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.files
            JOIN public.taskings ON taskings.id = files.tasking_id
            WHERE files.id = document_embeddings.file_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert embeddings for their files" ON public.document_embeddings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.files
            JOIN public.taskings ON taskings.id = files.tasking_id
            WHERE files.id = document_embeddings.file_id
            AND taskings.user_id = auth.uid()
        )
    );

-- Function to search similar documents using vector similarity
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 10,
    tasking_id uuid DEFAULT NULL
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
        AND (tasking_id IS NULL OR files.tasking_id = match_documents.tasking_id)
        AND 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY document_embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_taskings_updated_at
    BEFORE UPDATE ON public.taskings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_briefings_updated_at
    BEFORE UPDATE ON public.briefings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view files in their own folder" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete files in their own folder" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Chat messages table for assistant history
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tasking_id UUID REFERENCES public.taskings(id) ON DELETE CASCADE NOT NULL,
    sender TEXT CHECK (sender IN ('user','assistant','system')) NOT NULL,
    content TEXT NOT NULL,
    tokens INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_tasking_id ON public.chat_messages(tasking_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.chat_messages(created_at DESC);

-- Enable RLS and policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat" ON public.chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = chat_messages.tasking_id
            AND taskings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own chat" ON public.chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = chat_messages.tasking_id
            AND taskings.user_id = auth.uid()
        )
    ); 