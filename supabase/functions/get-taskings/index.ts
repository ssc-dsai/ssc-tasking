import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from Get Taskings Function!")

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse query parameters
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const category = url.searchParams.get('category') // 'personal' or 'shared'
    const search = url.searchParams.get('search')

    console.log(`Fetching taskings for user ${user.id}, limit: ${limit}, offset: ${offset}`)

    // Build query to get both owned and shared taskings
    // We'll use a custom SQL query to UNION owned and shared taskings
    let sqlQuery = `
      WITH combined_taskings AS (
        -- Owned taskings
        SELECT 
          t.*,
          'owner' as access_type
        FROM taskings t 
        WHERE t.user_id = $1
        
        UNION ALL
        
        -- Shared taskings
        SELECT 
          t.*,
          'shared' as access_type
        FROM taskings t 
        JOIN shared_taskings st ON t.id = st.tasking_id 
        WHERE st.user_id = $1
      )
      SELECT 
        ct.*,
        COALESCE(file_counts.file_count, 0) as file_count,
        COALESCE(briefing_counts.briefing_count, 0) as briefing_count,
        COALESCE(chat_counts.chat_count, 0) as chat_count,
        COALESCE(user_counts.user_count, 1) as user_count,
        COALESCE(ct.updated_at, ct.created_at) as last_activity
      FROM combined_taskings ct
      LEFT JOIN (
        SELECT tasking_id, COUNT(*) as file_count 
        FROM files 
        GROUP BY tasking_id
      ) file_counts ON ct.id = file_counts.tasking_id
      LEFT JOIN (
        SELECT tasking_id, COUNT(*) as briefing_count 
        FROM briefings 
        GROUP BY tasking_id
      ) briefing_counts ON ct.id = briefing_counts.tasking_id
      LEFT JOIN (
        SELECT tasking_id, COUNT(*) as chat_count 
        FROM chat_messages 
        GROUP BY tasking_id
      ) chat_counts ON ct.id = chat_counts.tasking_id
      LEFT JOIN (
        SELECT tasking_id, COUNT(*) + 1 as user_count 
        FROM shared_taskings 
        GROUP BY tasking_id
      ) user_counts ON ct.id = user_counts.tasking_id
    `

    // Add search filter if provided
    if (search) {
      sqlQuery += ` WHERE (ct.name ILIKE $3 OR ct.description ILIKE $3)`
    }

    // Add category filter if provided
    if (category) {
      const whereClause = search ? ' AND ' : ' WHERE '
      if (category === 'personal') {
        sqlQuery += `${whereClause} ct.access_type = 'owner'`
      } else if (category === 'shared') {
        sqlQuery += `${whereClause} ct.access_type = 'shared'`
      }
    }

    // Add ordering and pagination
    sqlQuery += ` ORDER BY ct.updated_at DESC LIMIT $2 OFFSET ${offset}`

    // Prepare parameters
    const params = [user.id, limit]
    if (search) {
      params.push(`%${search}%`)
    }

    console.log('Executing SQL query:', sqlQuery)
    console.log('With parameters:', params)

    // Disable custom SQL for now and use fallback approach
    const error = true
    const taskings = null

    // If custom SQL doesn't work, fall back to separate queries
    if (error || !taskings) {
      console.log('Custom SQL failed, using fallback approach:', error)
      
      // Get owned taskings
      let ownedQuery = supabaseClient
      .from('taskings')
      .select(`
        *,
        files (
          id,
          name,
          file_size,
          mime_type,
          created_at
        ),
        briefings (
          id,
          title,
          created_at
        ),
        chat_messages (
          id,
          created_at
        )
      `)
      .eq('user_id', user.id)

      // Get shared taskings - first get the shared tasking IDs, then fetch the taskings
      const { data: sharedTaskingIds, error: sharedIdsError } = await supabaseClient
        .from('shared_taskings')
        .select('tasking_id')
        .eq('user_id', user.id)

      if (sharedIdsError) {
        console.error('Error fetching shared tasking IDs:', sharedIdsError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch shared taskings', details: sharedIdsError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const sharedTaskingIdsList = (sharedTaskingIds || []).map(st => st.tasking_id)
      console.log('Found shared tasking IDs:', sharedTaskingIdsList)

      // Build shared query
      let sharedQuery = null
      if (sharedTaskingIdsList.length > 0) {
        sharedQuery = supabaseClient
          .from('taskings')
          .select(`
            *,
            files (
              id,
              name,
              file_size,
              mime_type,
              created_at
            ),
            briefings (
              id,
              title,
              created_at
            ),
            chat_messages (
              id,
              created_at
            )
          `)
          .in('id', sharedTaskingIdsList)

        // Apply search filter to shared query if needed
        if (search) {
          const searchFilter = `name.ilike.%${search}%,description.ilike.%${search}%`
          sharedQuery = sharedQuery.or(searchFilter)
        }
      }

      // Apply search filter to owned query if needed
    if (search) {
        const searchFilter = `name.ilike.%${search}%,description.ilike.%${search}%`
        ownedQuery = ownedQuery.or(searchFilter)
    }

            // Execute queries based on category filter
      let ownedTaskings = []
      let sharedTaskings = []

      // Execute owned taskings query
      if (!category || category === 'personal') {
        const { data: owned, error: ownedError } = await ownedQuery
        if (ownedError) {
          console.error('Error fetching owned taskings:', ownedError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch owned taskings', details: ownedError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        ownedTaskings = owned || []
        console.log(`Found ${ownedTaskings.length} owned taskings`)
      }

      // Execute shared taskings query
      if (!category || category === 'shared') {
        if (sharedTaskingIdsList.length > 0 && sharedQuery) {
          const { data: shared, error: sharedError } = await sharedQuery
          if (sharedError) {
            console.error('Error fetching shared taskings:', sharedError)
            return new Response(
              JSON.stringify({ error: 'Failed to fetch shared taskings', details: sharedError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          sharedTaskings = shared || []
          console.log(`Found ${sharedTaskings.length} shared taskings`)
        } else {
          console.log('No shared taskings to fetch (no IDs or no query)')
        }
      }

      // Get user details for shared taskings
      const taskingIds = [...ownedTaskings, ...sharedTaskings].map(t => t.id)
      console.log('Fetching shared users for tasking IDs:', taskingIds)
      
      // Debug: Check what's in shared_taskings table first
      const { data: rawSharedTaskings } = await supabaseClient
        .from('shared_taskings')
        .select('*')
        .in('tasking_id', taskingIds)
      console.log('Raw shared_taskings data:', rawSharedTaskings)
      
      // Get shared taskings entries
      const { data: sharedTaskingsEntries, error: sharedTaskingsError } = await supabaseClient
        .from('shared_taskings')
        .select('tasking_id, user_id')
        .in('tasking_id', taskingIds)
      
      if (sharedTaskingsError) {
        console.error('Error fetching shared_taskings:', sharedTaskingsError)
      }
      console.log('Shared taskings entries:', sharedTaskingsEntries)
      
      // Get profiles for the shared users
      const sharedUserIds = (sharedTaskingsEntries || []).map(st => st.user_id)
      console.log('Shared user IDs:', sharedUserIds)
      
      // Also get owner user IDs
      const ownerUserIds = [...ownedTaskings, ...sharedTaskings].map(t => t.user_id)
      console.log('Owner user IDs:', ownerUserIds)
      
      // Combine all user IDs we need profiles for
      const allUserIds = [...new Set([...sharedUserIds, ...ownerUserIds])]
      console.log('All user IDs to fetch profiles for:', allUserIds)
      
      let profilesData = []
      if (allUserIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabaseClient
          .from('profiles')
          .select('id, full_name, email')
          .in('id', allUserIds)
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        }
        profilesData = profiles || []
      }
      console.log('Profiles data:', profilesData)
      
      // Manually join the data
      const sharedUsers = (sharedTaskingsEntries || []).map(st => ({
        tasking_id: st.tasking_id,
        profiles: profilesData.find(p => p.id === st.user_id)
      })).filter(su => su.profiles) // Only include entries where we found the profile

      // Group users by tasking ID
      const usersByTasking = (sharedUsers || []).reduce((acc, su) => {
        if (!acc[su.tasking_id]) {
          acc[su.tasking_id] = []
        }
        acc[su.tasking_id].push(su.profiles)
        return acc
      }, {})
      
      console.log('Users grouped by tasking:', usersByTasking)

      // Combine and transform results
      const allTaskings = [
        ...ownedTaskings.map(t => {
          const ownerProfile = profilesData.find(p => p.id === t.user_id)
          const transformed = {
            ...t,
            access_type: 'owner',
            file_count: t.files?.length || 0,
            briefing_count: t.briefings?.length || 0,
            chat_count: t.chat_messages?.length || 0,
            user_count: (usersByTasking[t.id]?.length || 0) + 1, // +1 for owner
            users: usersByTasking[t.id] || [],
            owner_profile: ownerProfile,
            last_activity: t.updated_at || t.created_at,
          };
          console.log(`Transforming owned tasking ${t.name}:`, {
            owner_profile: ownerProfile,
            chat_messages_length: t.chat_messages?.length,
            users_for_tasking: usersByTasking[t.id],
            final_chat_count: transformed.chat_count,
            final_user_count: transformed.user_count,
            final_users: transformed.users
          });
          return transformed;
        }),
        ...sharedTaskings.map(t => {
          const ownerProfile = profilesData.find(p => p.id === t.user_id)
          const transformed = {
            ...t,
            access_type: 'shared',
            file_count: t.files?.length || 0,
            briefing_count: t.briefings?.length || 0,
            chat_count: t.chat_messages?.length || 0,
            user_count: (usersByTasking[t.id]?.length || 0) + 1, // +1 for owner
            users: usersByTasking[t.id] || [],
            owner_profile: ownerProfile,
            last_activity: t.updated_at || t.created_at,
          };
          console.log(`Transforming shared tasking ${t.name}:`, {
            owner_profile: ownerProfile,
            chat_messages_length: t.chat_messages?.length,
            users_for_tasking: usersByTasking[t.id],
            final_chat_count: transformed.chat_count,
            final_user_count: transformed.user_count,
            final_users: transformed.users
          });
          return transformed;
        })
      ]

      // Sort by updated_at and apply pagination
      const sortedTaskings = allTaskings
        .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())
        .slice(offset, offset + limit)

      // Get total count for pagination
      const totalOwned = !category || category === 'personal' ? ownedTaskings.length : 0
      const totalShared = !category || category === 'shared' ? sharedTaskings.length : 0
      const totalCount = totalOwned + totalShared

      console.log(`Found ${sortedTaskings.length} taskings (${totalOwned} owned, ${totalShared} shared)`)

      return new Response(
        JSON.stringify({
          data: sortedTaskings,
          pagination: {
            total: totalCount,
            limit,
            offset,
            has_more: (offset + limit) < totalCount
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // If custom SQL worked, use those results
    console.log(`Found ${taskings.length} taskings via custom SQL`)

    return new Response(
      JSON.stringify({
        data: taskings,
        pagination: {
          total: taskings.length, // We'd need a separate count query for exact total
          limit,
          offset,
          has_more: taskings.length === limit
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 