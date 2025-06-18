# Supabase Setup Guide

This guide will help you set up Supabase for the SSC Tasking application with Authentication, Database, Storage, and Vector Search capabilities.

## Prerequisites

1. A Supabase account (https://supabase.com)
2. Your Supabase project created
3. Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `ssc-tasking` (or your preferred name)
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key (for admin operations)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, taskings, files, briefings, document_embeddings)
- Row Level Security (RLS) policies
- Database functions for vector search
- Indexes for performance
- Triggers for timestamp management

## Step 5: Enable Vector Extension

The schema includes vector extension setup, but ensure it's enabled:

1. Go to Database > Extensions in your Supabase dashboard
2. Search for "vector" and enable it if not already enabled

## Step 6: Configure Storage

1. Go to Storage in your Supabase dashboard
2. The `documents` bucket should be created automatically by the schema
3. Verify the bucket exists and has the correct policies

## Step 7: Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL:
   - For development: `http://localhost:8080`
   - For production: your actual domain
3. Configure email templates (optional):
   - Go to Authentication > Email Templates
   - Customize signup, password reset emails

## Step 8: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to:
   - Create an account
   - Sign in
   - Create a tasking
   - Upload files
   - Generate briefings

## Optional: Set Up OpenAI Integration

For AI-powered briefing generation:

1. Get an OpenAI API key from https://platform.openai.com
2. Add it to your `.env.local`:
   ```env
   VITE_OPENAI_API_KEY=sk-your-openai-key
   ```

## Database Tables Overview

### `profiles`
- User profile information
- Links to auth.users

### `taskings`
- Main project/tasking entities
- Belongs to a user
- Can be 'personal' or 'shared'

### `files`
- File metadata and storage paths
- Belongs to a tasking
- Links to Supabase Storage

### `briefings`
- AI-generated briefing documents
- Belongs to a tasking
- Contains title, summary, and full content

### `document_embeddings`
- Vector embeddings for semantic search
- Links to files
- Used for AI-powered document search

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Storage Policies**: Users can only access files in their own folders
- **Authentication**: Required for all operations
- **Data Validation**: Database constraints and checks

## Performance Optimizations

- **Indexes**: On frequently queried columns
- **Vector Index**: For fast similarity search
- **Query Optimization**: Efficient joins and filters

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in the root directory
   - Restart your development server
   - Check that variables start with `VITE_`

2. **RLS Policy Errors**
   - Verify user is authenticated
   - Check policy conditions in Supabase dashboard
   - Ensure user has proper permissions

3. **File Upload Issues**
   - Check storage bucket exists
   - Verify storage policies
   - Ensure file size limits are appropriate

4. **Vector Search Not Working**
   - Verify vector extension is enabled
   - Check embedding dimensions (1536 for OpenAI)
   - Ensure vector index is created

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review console errors in browser developer tools
- Check Supabase logs in the dashboard
- Verify API keys and permissions

## Next Steps

Once setup is complete, you can:

1. Customize the UI further
2. Add more AI features
3. Implement real-time collaboration
4. Add more file types support
5. Enhance search capabilities
6. Deploy to production

## Production Deployment

For production:

1. Update environment variables with production values
2. Configure custom domain in Supabase
3. Set up proper email service (not Supabase's development emails)
4. Review and adjust RLS policies if needed
5. Set up monitoring and backups
6. Configure CDN for file storage if needed 