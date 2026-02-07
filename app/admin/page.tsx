import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Package, Clock, HeartHandshake, ArrowRight, ShieldCheck, Settings, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnalyticsData } from '@/components/admin/analytics-chart'
import { RecentActivityList, ActivityItem } from '@/components/admin/recent-activity-list'
import nextDynamic from 'next/dynamic'

const AnalyticsChart = nextDynamic(() => import('@/components/admin/analytics-chart').then(mod => mod.AnalyticsChart), {
    loading: () => <div className="col-span-4 h-[350px] bg-slate-100 rounded-xl animate-pulse" />
})
import { subDays, format, isSameDay } from 'date-fns'
import { Item, Profile, VolunteerDelivery } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Counts
    const [
        { count: donationsCount },
        { count: pendingCount },
        { count: usersCount },
        { count: activeCount },
        { count: pendingVolunteersCount },
        { data: featureData }
    ] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'donated'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('volunteer_deliveries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('system_settings').select('value').eq('key', 'feature_gamification').maybeSingle()
    ])

    const isGamificationEnabled = featureData?.value ?? false

    // 2. Fetch Recent Activity Data
    const [
        { data: recentItemsData },
        { data: recentAppealsData },
        { data: recentDonationsData },
        { data: recentUsersData },
        { data: recentVolunteersData }
    ] = await Promise.all([
        supabase.from('items').select('*, profiles:user_id(full_name, avatar_url)').order('created_at', { ascending: false }).limit(5),
        supabase.from('appeals').select('*, profiles:user_id(full_name, avatar_url)').order('created_at', { ascending: false }).limit(5),
        supabase.from('items').select('*, profiles:user_id(full_name, avatar_url)').eq('status', 'donated').order('updated_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('volunteer_deliveries').select('*, profiles:user_id(full_name, avatar_url)').order('created_at', { ascending: false }).limit(5)
    ])

    // ... (Analytics fetch remains same for now) ...
    // 3. Fetch Analytics Data (Dates only for aggregation)
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
    const [
        { data: itemsAnalytics },
        { data: appealsAnalytics },
        { data: donationsAnalytics },
        { data: usersAnalytics },
        { data: allPoints }
    ] = await Promise.all([
        supabase.from('items').select('created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('appeals').select('created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('items').select('updated_at').eq('status', 'donated').gte('updated_at', thirtyDaysAgo),
        supabase.from('profiles').select('created_at').gte('created_at', thirtyDaysAgo),
        supabase.from('profiles').select('points')
    ])

    // --- Process Recent Activity ---
    const activities: ActivityItem[] = []

    // ... existing push logic ...
    // ... existing push logic ...
    recentItemsData?.forEach((item) => { // Type inferred or cast if needed, but 'item' from supabase select is usually typed if generated, else we cast
        activities.push({
            id: item.id,
            type: 'item',
            title: 'New Item Listed',
            description: item.title,
            timestamp: item.created_at,
            user: {
                name: (item.profiles as unknown as Profile)?.full_name || 'Unknown User',
                avatar: (item.profiles as unknown as Profile)?.avatar_url || undefined
            }
        })
    })

    recentAppealsData?.forEach((appeal) => {
        activities.push({
            id: appeal.id,
            type: 'appeal',
            title: 'New Appeal',
            description: appeal.title,
            timestamp: appeal.created_at,
            user: {
                name: (appeal.profiles as unknown as Profile)?.full_name || 'Unknown User',
                avatar: (appeal.profiles as unknown as Profile)?.avatar_url || undefined
            }
        })
    })

    recentDonationsData?.forEach((item) => {
        activities.push({
            id: item.id,
            type: 'donation',
            title: 'Item Donated',
            description: item.title,
            timestamp: item.updated_at, // Donations utilize updated_at
            user: {
                name: (item.profiles as unknown as Profile)?.full_name || 'Unknown User',
                avatar: (item.profiles as unknown as Profile)?.avatar_url || undefined
            }
        })
    })

    recentUsersData?.forEach((user) => {
        activities.push({
            id: user.id,
            type: 'user',
            title: 'New User Joined',
            description: user.full_name || user.email || 'No Name',
            timestamp: user.created_at,
            user: {
                name: user.full_name || 'User',
                avatar: user.avatar_url
            }
        })
    })

    recentVolunteersData?.forEach((vol) => {
        activities.push({
            id: vol.id,
            type: 'appeal', // Re-using appeal type or generic for icon
            title: 'Volunteer Request',
            description: `${vol.from_city} -> ${vol.to_city}`,
            timestamp: vol.created_at,
            user: {
                name: (vol.profiles as unknown as Profile)?.full_name || 'Volunteer',
                avatar: (vol.profiles as unknown as Profile)?.avatar_url || undefined
            }
        })
    })

    // Sort combined activities by date desc
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const topActivities = activities.slice(0, 10)

    // ... (Analytics parsing remains same) ...
    const chartData: AnalyticsData[] = []
    for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i)
        // ... (existing logic) ...
        const dateKey = format(date, 'MMM dd')
        // 3. Process Data
        const siteConfig: Record<string, string> = {};
        const siteConfigData: { key: string; value: string }[] | null = featureData as unknown as { key: string; value: string }[] || []; // featureData is from Promise.all index 5 which was actually system_settings in the view... Wait.
        // The previous code had 6 items in Promise.all request but index 6 was system_settings.feature_gamification. 
        // And index 1, 2, 3 were items, items, profiles.
        // Wait, the new code replaced fetching logic.
        // The view showed:
        /*
        24: items (donated)
        25: items (pending)
        26: profiles
        27: items (active)
        28: volunteer_deliveries (pending)
        29: system_settings (feature_gamification)
        */
        // There is No site_config fetch in the first Promise.all block of app/admin/page.tsx.
        // BUT, app/layout.tsx had it.
        // In app/admin/page.tsx, there IS NO sitConfigData usage in the visible block I saw in Step 88?
        // Let me check Step 88 again carefully.
        // Step 88:
        // ...
        // 29: supabase.from('system_settings').select('value').eq('key', 'feature_gamification').maybeSingle()
        // ...
        // 32: const isGamificationEnabled = featureData?.value ?? false
        // 
        // I don't see siteConfigData loop in Step 88's app/admin/page.tsx file content.
        // Ah, I see `itemsAnalytics?.filter` lower down.
        // Wait, the replace_call I am making is for `app/admin/page.tsx`.
        // I do NOT need to fix siteConfig iteration because it's NOT in `app/admin/page.tsx`. It was in `app/layout.tsx` which I already parsed.
        // So this replacement is unnecessary/wrong target. I will skip this specific replacement.
        // Instead I will fix the analytics loop `any` usage.

        // Changing target to fix analytics loops.
        const itemsCount = itemsAnalytics?.filter((x) => isSameDay(new Date(x.created_at), date)).length || 0
        const appealsCount = appealsAnalytics?.filter((x) => isSameDay(new Date(x.created_at), date)).length || 0
        const donationsCount = donationsAnalytics?.filter((x) => isSameDay(new Date(x.updated_at), date)).length || 0
        const usersCount = usersAnalytics?.filter((x) => isSameDay(new Date(x.created_at), date)).length || 0

        chartData.push({
            date: dateKey,
            items: itemsCount,
            appeals: appealsCount,
            donations: donationsCount,
            users: usersCount
        })
    }

    const totalPoints = allPoints?.reduce((sum, profile) => sum + (Number(profile.points) || 0), 0) || 0

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>

            {/* Top Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {/* ... existing cards ... */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                        <HeartHandshake className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{donationsCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Successful donations</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Items awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Volunteers</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingVolunteersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Volunteers awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently available</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{usersCount || 0}</div>
                        <p className="text-xs text-muted-foreground">Registered profiles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Analytics Chart */}
                <AnalyticsChart data={chartData} />

                {/* Recent Activity Feed */}
                <Card className="col-span-4 lg:col-span-3"> {/* Adjusted span */}
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest events including volunteers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[350px] overflow-y-auto pr-2">
                        <RecentActivityList activities={topActivities} />
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Manage your platform efficiently.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-4">
                        <Button asChild className="justify-between" variant="outline">
                            <Link href="/admin/moderation">
                                <span className="flex items-center">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Review Pending Items
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild className="justify-between" variant="outline">
                            <Link href="/admin/volunteers">
                                <span className="flex items-center">
                                    <Truck className="mr-2 h-4 w-4" />
                                    Manage Volunteers
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild className="justify-between" variant="outline">
                            <Link href="/admin/users">
                                <span className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild className="justify-between" variant="outline">
                            <Link href="/admin/settings">
                                <span className="flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
