import { createClient } from '@/lib/supabase-server'
import { ModerationList } from './moderation-list'

export const dynamic = 'force-dynamic'

export default async function ModerationPage() {
    const supabase = await createClient()

    // 1. Fetch Items ONLY (No Join available on FK to auth.users from client)
    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (itemsError) {
        console.error('[ModerationPage] Items Fetch Error:', itemsError)
        return <div>Error loading items</div>
    }

    // 2. Extract User IDs
    const userIds = Array.from(new Set(items?.map(i => i.user_id).filter(Boolean)))

    // 3. Fetch Profiles manually
    let profilesMap: Record<string, any> = {}
    if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds)

        if (profiles) {
            profiles.forEach(p => {
                profilesMap[p.id] = p
            })
        }
    }

    // 4. Combine Data
    const combinedItems = items?.map(item => ({
        ...item,
        profiles: profilesMap[item.user_id] || null
    }))


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Moderation Queue</h1>
            <p className="text-muted-foreground">Review incoming item requests.</p>

            <ModerationList items={combinedItems || []} />
        </div>
    )
}
