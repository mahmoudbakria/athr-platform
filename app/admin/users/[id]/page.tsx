import { createClient } from '@/lib/supabase-server'
import { UserActivityTabs } from './user-activity-tabs'
import { UserProfileHeader } from '@/components/admin/users/UserProfileHeader'
import { UserStats } from '@/components/admin/users/UserStats'

export const dynamic = 'force-dynamic'

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id: userId } = await params

    // Fetch Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (profileError || !profile) {
        return <div className="p-8">User not found</div>
    }

    // Fetch Items
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // Fetch categories for filtering (needed by ItemRegistry)
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    // Attach profile to items (for consistency with ItemRegistry expectation)
    const itemsWithProfile = items?.map(item => ({
        ...item,
        profiles: profile
    }))

    // Fetch point values for breakdown calculation
    const { data: pointValues } = await supabase
        .from('point_values')
        .select('*')
        .in('key', ['upload_item', 'donate_item'])

    // Fetch Volunteer Deliveries (Full Data for Tabs)
    const { data: volunteerDeliveries } = await supabase
        .from('volunteer_deliveries')
        .select(`
            *,
            profiles (
                full_name,
                phone,
                email,
                avatar_url
            )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    // Fetch Appeals (Full Data for Tabs)
    const { data: appeals, count: appealsCount } = await supabase
        .from('appeals')
        .select(`
            *,
            profiles (
                full_name,
                email,
                role
            )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-8">
            <UserProfileHeader profile={profile} />

            <UserStats
                profile={profile}
                items={items || []}
                volunteerDeliveries={volunteerDeliveries || []}
                appealsCount={appealsCount || 0}
                pointValues={pointValues || []}
            />

            <UserActivityTabs
                items={itemsWithProfile || []}
                categories={categories || []}
                appeals={appeals || []}
                volunteerDeliveries={volunteerDeliveries || []}
            />
        </div>
    )
}
