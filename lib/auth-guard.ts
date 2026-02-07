import { createClient } from './supabase-server'

/**
 * Server-side guard to ensure the requesting user is an Admin or Moderator.
 * Throws "Unauthorized" if not logged in.
 * Throws "Forbidden" if logged in but lacking role.
 * 
 * @returns The Supabase client and user object for further use.
 */
export async function requireAdminOrMod() {
    const supabase = await createClient()

    // 1. Get the current User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // 2. Fetch the User's Profile/Role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // 3. Check Role membership
    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        throw new Error("Forbidden")
    }

    return { supabase, user, profile }
}
