import { getUserVolunteerDeliveries } from '@/app/volunteer/actions'
import VolunteerList from '@/components/volunteer/VolunteerList'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MyVolunteersPage() {
    const supabase = await createClient()

    // Check Feature Flag
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_volunteer_delivery')
        .maybeSingle()

    if (feature && feature.value === false) {
        redirect('/')
    }

    const { success, data } = await getUserVolunteerDeliveries()

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">طلباتي للتطوع</h1>
                    <p className="text-muted-foreground mt-1">تتبع حالة عروض التوصيل الخاصة بك.</p>
                </div>
                <Button asChild>
                    <Link href="/volunteer/create">
                        <Plus className="ml-2 h-4 w-4" />
                        طلب جديد
                    </Link>
                </Button>
            </div>

            <VolunteerList data={data || []} />
        </div>
    )
}
