import { createClient } from '@/lib/supabase-server'
import { ReportsClient } from '@/components/admin/reports/ReportsClient'
import { subDays, format, isSameDay, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface AdminReportsPageProps {
    searchParams: Promise<{ from?: string; to?: string }>
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
    const supabase = await createClient()

    const { from: paramFrom, to: paramTo } = await searchParams

    // Date Range Logic
    const from = paramFrom ? new Date(paramFrom) : subDays(new Date(), 30)
    const to = paramTo ? new Date(paramTo) : new Date()

    const fromISO = startOfDay(from).toISOString()
    const toISO = endOfDay(to).toISOString()

    // Call RPC Function
    const { data: stats, error } = await supabase.rpc('get_admin_stats', {
        start_date: fromISO,
        end_date: toISO
    })

    if (error) {
        console.error('Error fetching admin stats:', error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <h2 className="text-xl font-semibold text-destructive">خطأ في تحميل التقارير</h2>
                <p className="text-muted-foreground">حدث خطأ أثناء جلب البيانات من الخادم. يرجى المحاولة مرة أخرى لاحقاً.</p>
                <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
            </div>
        )
    }

    // Cast the JSON result to our type
    const adminStats = (stats as unknown as import('@/types').AdminStats) || {
        growth: [],
        items_status: [],
        appeals_status: [],
        volunteers_status: [],
        categories: []
    }

    // Prepare data for ReportsClient
    const growthData = adminStats.growth || []
    const categoryData = adminStats.categories || []
    const itemsStatusData = adminStats.items_status || []

    // We need to construct simplified growth arrays for specific tabs if the RPC returns unified growth
    // The RPC returns { date, items, users, appeals, volunteers } per day.

    const appealsData = {
        statusCounts: adminStats.appeals_status || [],
        growth: growthData.map((d: any) => ({ date: d.date, count: d.appeals || 0 }))
    }

    const volunteerData = {
        statusCounts: adminStats.volunteers_status || [],
        growth: growthData.map((d: any) => ({ date: d.date, count: d.volunteers || 0 }))
    }

    return (
        <ReportsClient
            growthData={growthData}
            categoryData={categoryData}
            statusData={itemsStatusData}
            appealsData={appealsData}
            volunteerData={volunteerData}
        />
    )
}
