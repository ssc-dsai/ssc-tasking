# Supabase Edge Functions Setup Guide

This guide will help you set up and deploy Supabase Edge Functions for the Briefing AI application.

## 🚀 What We've Implemented

### New Edge Function: `get-taskings`
- **Purpose**: Fetch taskings with advanced filtering, pagination, and real-time data
- **Authentication**: Required (JWT token)
- **Features**: 
  - Pagination support
  - Category filtering ('personal' or 'shared')
  - Search functionality
  - File and briefing counts
  - Proper error handling and CORS

### New Frontend Components
- **TaskingsList**: Red-themed component using edge function data
- **TaskingAnalytics**: Red-themed analytics using edge function data
- **useTaskingsEdgeFunction**: Custom hook for edge function integration

## 📁 Project Structure

```
briefing-ai-shared/
├── supabase/
│   ├── config.toml                    # Supabase configuration
│   └── functions/
│       ├── deno.json                  # Deno configuration
│       ├── package.json               # Functions package config
│       ├── README.md                  # Functions documentation
│       ├── _shared/
│       │   └── cors.ts                # CORS configuration
│       └── get-taskings/
│           └── index.ts               # Get taskings function
├── scripts/
│   └── deploy-functions.sh            # Deployment script
├── src/
│   ├── components/tasking/
│   │   ├── TaskingsList.tsx           # Red-themed taskings list
│   │   └── TaskingAnalytics.tsx       # Red-themed analytics
│   └── hooks/
│       └── useTaskingsEdgeFunction.ts # Edge function hooks
└── package.json                       # Updated with function scripts
```

## 🛠️ Setup Instructions

### 1. Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase@latest

# Or with homebrew on macOS
brew install supabase/tap/supabase
```

### 2. Initialize Supabase (if not already done)

```bash
# Initialize Supabase in your project
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Set up Local Development

```bash
# Start local Supabase (requires Docker)
npm run supabase:start
# or
supabase start

# Check status
npm run supabase:status
# or
supabase status
```

### 4. Deploy Edge Functions

```bash
# Deploy all functions
npm run functions:deploy

# Or deploy specific function
npm run functions:deploy:get-taskings

# Or use the script directly
./scripts/deploy-functions.sh get-taskings
```

## 🔧 Configuration

### Environment Variables

Make sure your `.env.local` file includes:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Configuration

The `supabase/config.toml` file is already configured with:
- Edge Runtime enabled
- Proper CORS settings
- Local development ports
- Authentication settings

## 🎯 Testing the Implementation

### 1. Test the Dashboard

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Dashboard
3. You should see two sections:
   - **Mock Data Analytics** (blue theme) - existing mock data
   - **API Data Analytics** (red theme) - real data from edge function
   - **Mock Taskings** (white/blue theme) - existing mock taskings
   - **Real Taskings (API Data)** (red theme) - data from edge function

### 2. Test Edge Function Directly

```bash
# Get your JWT token from browser developer tools or Supabase auth
export JWT_TOKEN="your-jwt-token-here"

# Test locally
curl -X GET 'http://localhost:54321/functions/v1/get-taskings' \
  -H "Authorization: Bearer $JWT_TOKEN"

# Test with parameters
curl -X GET 'http://localhost:54321/functions/v1/get-taskings?limit=5&category=personal' \
  -H "Authorization: Bearer $JWT_TOKEN"

# Test production (after deployment)
curl -X GET 'https://your-project-id.supabase.co/functions/v1/get-taskings' \
  -H "Authorization: Bearer $JWT_TOKEN"
```

## 🔍 Monitoring and Debugging

### 1. View Function Logs

- Go to your Supabase dashboard
- Navigate to "Edge Functions"
- Click on "get-taskings"
- View the "Logs" tab for real-time function execution logs

### 2. Local Development Logs

When running locally with `supabase start`, logs will appear in your terminal.

### 3. Common Issues and Solutions

**Issue**: Function not deploying
- Check if you're logged in: `supabase login`
- Verify project link: `supabase projects list`

**Issue**: CORS errors
- Update `supabase/functions/_shared/cors.ts`
- Redeploy the function

**Issue**: Authentication errors
- Verify JWT token is valid
- Check RLS policies in database

**Issue**: Database connection errors
- Verify database schema is applied
- Check user permissions

## 📊 Edge Function Features

### Request/Response Format

**Request**:
```
GET /functions/v1/get-taskings?limit=10&offset=0&category=personal&search=test
Authorization: Bearer <jwt-token>
```

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tasking Name",
      "description": "Description...",
      "category": "personal",
      "user_id": "uuid",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T15:30:00Z",
      "files": [...],
      "briefings": [...],
      "file_count": 5,
      "briefing_count": 2,
      "last_activity": "2024-01-15T15:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

### Performance Optimizations

- **Efficient Queries**: Uses joins and select specific fields
- **Pagination**: Prevents large data transfers
- **Caching**: Frontend caching with React Query
- **Indexing**: Database indexes for fast queries

## 🚢 Deployment Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Project linked to remote Supabase project
- [ ] Database schema applied (`supabase-schema.sql`)
- [ ] Environment variables set
- [ ] Functions deployed successfully
- [ ] Frontend updated to use edge functions
- [ ] Testing completed (local and production)
- [ ] Monitoring set up

## 🔄 Development Workflow

1. **Local Development**:
   ```bash
   supabase start                    # Start local Supabase
   npm run dev                       # Start frontend
   ```

2. **Make Changes**:
   - Edit edge function code
   - Update frontend components
   - Test locally

3. **Deploy**:
   ```bash
   npm run functions:deploy          # Deploy functions
   npm run build                     # Build frontend
   ```

4. **Monitor**:
   - Check function logs
   - Monitor performance
   - Test in production

## 📚 Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🆘 Getting Help

If you encounter issues:

1. Check the function logs in Supabase dashboard
2. Verify your JWT token is valid
3. Test the function directly with curl
4. Review the database RLS policies
5. Check network connectivity and CORS settings

## 🎉 What's Next

With the edge function setup, you can now:

1. **Add More Functions**: Create additional edge functions for other operations
2. **Enhance Filtering**: Add more sophisticated search and filtering
3. **Real-time Updates**: Implement WebSocket connections for live updates
4. **Caching Strategy**: Implement advanced caching for better performance
5. **Analytics**: Add detailed analytics and monitoring 