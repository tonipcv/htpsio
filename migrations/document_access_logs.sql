-- SQL Migration for Document Access Logs
-- Creates a new table to track document access with detailed analytics

-- Check if the table already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_access_logs') THEN
        -- Create the document_access_logs table
        CREATE TABLE public.document_access_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            document_id TEXT NOT NULL,
            user_id TEXT,
            visitor_token TEXT,
            access_start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            access_end_time TIMESTAMP WITH TIME ZONE,
            duration INTEGER,
            user_agent TEXT NOT NULL,
            ip_address TEXT NOT NULL,
            city TEXT,
            country TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Add indexes for better query performance
        CREATE INDEX idx_document_access_logs_document_id ON public.document_access_logs(document_id);
        CREATE INDEX idx_document_access_logs_user_id ON public.document_access_logs(user_id);
        CREATE INDEX idx_document_access_logs_visitor_token ON public.document_access_logs(visitor_token);
        CREATE INDEX idx_document_access_logs_access_start_time ON public.document_access_logs(access_start_time);

        -- Add foreign key constraints
        ALTER TABLE public.document_access_logs
        ADD CONSTRAINT fk_document_access_logs_document
        FOREIGN KEY (document_id) 
        REFERENCES "Document"(id) 
        ON DELETE CASCADE;

        ALTER TABLE public.document_access_logs
        ADD CONSTRAINT fk_document_access_logs_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL;

        RAISE NOTICE 'Created document_access_logs table and related constraints';
    ELSE
        RAISE NOTICE 'document_access_logs table already exists, skipping creation';
    END IF;
END
$$;
