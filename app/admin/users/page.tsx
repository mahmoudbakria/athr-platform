import { createClient } from '@/lib/supabase-server'
import { UserList } from './user-list'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createClient()

    // We need to fetch profiles, but profiles doesn't contain email by default in public table usually.
    // However, for this task relying on profiles table is safer. 
    // If email is critical, we might need a function or just show what's in profile.
    // 'profiles' table schema: id, role, points, phone, is_transporter.
    // It seems 'full_name' is missing from schema.sql I read earlier!

    // WAIT: I saw 'full_name' used in signup action: `options: { data: { full_name: ... } }`.
    // This goes to `auth.users` metadata.
    // The `profiles` table in schema.sql DID NOT have `full_name`.
    // Let's check schema.sql again quickly or just assume I need to fetch it from metadata?
    // Accessing auth.users metadata from client is hard.
    // Usually we sync full_name to profiles.

    // Let's look at schema.sql again in previous turns.
    // Schema lines 11-19: id, role, points, phone, is_transporter. NO full_name.

    // FIX: I will add full_name to profiles table to make this clean.

    const [
        { data: profiles },
        { data: featureData }
    ] = await Promise.all([
        supabase.from('profiles').select('*').order('role', { ascending: true }),
        supabase.from('system_settings').select('value').eq('key', 'feature_gamification').maybeSingle()
    ])

    const isGamificationEnabled = featureData?.value ?? false

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <span className="text-sm text-muted-foreground">
                    {profiles?.length || 0} users
                </span>
            </div>

            <UserList users={profiles || []} />
        </div>
    )
}
