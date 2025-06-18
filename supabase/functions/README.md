# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Briefing AI application.

## Functions

### get-taskings

Fetches taskings for the authenticated user with optional filtering and pagination.

**URL**: `/functions/v1/get-taskings`  
**Method**: GET  
**Auth**: Required (Bearer token)

**Query Parameters**:
- `limit` (optional): Number of taskings to return (default: 50)
- `offset` (optional): Number of taskings to skip (default: 0)
- `category` (optional): Filter by category ('personal' or 'shared')
- `search` (optional): Search term for name or description

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "category": "personal|shared",
      "user_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "files": [...],
      "briefings": [...],
      "file_count": "number",
      "briefing_count": "number",
      "last_activity": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "has_more": "boolean"
  }
}
```

## Setup

### Prerequisites

1. Supabase CLI installed
2. Docker running (for local development)
3. Supabase project configured

### Local Development

1. Start Supabase locally:
   ```bash
   supabase start
   ```

2. The edge functions will be available at: `http://localhost:54321/functions/v1/`

### Deployment

1. Login to Supabase:
   ```bash
   supabase login
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Deploy all functions:
   ```bash
   supabase functions deploy
   ```

4. Or deploy specific function:
   ```bash
   supabase functions deploy get-taskings
   ```

## Testing

### Test locally with curl:

```bash
# Get all taskings
curl -X GET 'http://localhost:54321/functions/v1/get-taskings' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# Get taskings with filters
curl -X GET 'http://localhost:54321/functions/v1/get-taskings?limit=10&category=personal&search=test' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### Test production:

```bash
# Replace YOUR_PROJECT_URL with your actual Supabase project URL
curl -X GET 'https://YOUR_PROJECT_URL.supabase.co/functions/v1/get-taskings' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Environment Variables

The edge functions use the following environment variables (automatically provided by Supabase):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your project's anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your project's service role key

## Security

- All functions require authentication
- Users can only access their own data (enforced by RLS policies)
- Input validation and sanitization implemented
- Error handling with appropriate HTTP status codes

## CORS

CORS is configured to allow requests from your frontend application. Update the `corsHeaders` in `_shared/cors.ts` if needed.

## Logging

Edge functions include comprehensive logging for debugging:
- Request details
- Database queries
- Error information
- Performance metrics

Check the Supabase dashboard under "Edge Functions" > "Logs" for function execution logs. 