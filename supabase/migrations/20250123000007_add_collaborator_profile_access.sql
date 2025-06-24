-- Add RLS policy to allow users to view profiles of tasking collaborators
-- This allows:
-- 1. Shared users to see the owner's profile
-- 2. Owners to see shared users' profiles
-- 3. Shared users to see each other's profiles (if multiple users share the same tasking)

CREATE POLICY "Users can view profiles of tasking collaborators" ON public.profiles
    FOR SELECT USING (
        -- Users can always see their own profile (existing policy covers this)
        auth.uid() = id
        OR
        -- Users can see profiles of people they share taskings with
        EXISTS (
            SELECT 1
            FROM public.shared_taskings st1
            JOIN public.shared_taskings st2 ON st1.tasking_id = st2.tasking_id
            WHERE st1.user_id = auth.uid() 
            AND st2.user_id = profiles.id
        )
        OR
        -- Users can see profiles of owners of taskings they have access to
        EXISTS (
            SELECT 1
            FROM public.shared_taskings st
            JOIN public.taskings t ON st.tasking_id = t.id
            WHERE st.user_id = auth.uid() 
            AND t.user_id = profiles.id
        )
        OR
        -- Owners can see profiles of users they've shared their taskings with
        EXISTS (
            SELECT 1
            FROM public.shared_taskings st
            JOIN public.taskings t ON st.tasking_id = t.id
            WHERE t.user_id = auth.uid() 
            AND st.user_id = profiles.id
        )
    ); 