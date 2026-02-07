
import { createClient } from '@/lib/supabase-server'
import { VolunteerCard } from '@/components/volunteer/VolunteerCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, AlertCircle } from 'lucide-react'

import { VolunteerFilters } from './filters'

export const revalidate = 0 // Dynamic data due to search params

type Params = Promise<{ [key: string]: string | string[] | undefined }>

export default async function VolunteerListingPage(props: { searchParams: Params }) {
    const searchParams = await props.searchParams
    const city = typeof searchParams.city === 'string' ? searchParams.city : undefined
    const date = typeof searchParams.date === 'string' ? searchParams.date : undefined

    const supabase = await createClient()

    // Check Feature Flag
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_volunteer_delivery')
        .maybeSingle()

    const isEnabled = feature?.value ?? true

    if (!isEnabled) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-slate-400" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">الميزة غير مفعلة</h1>
                <p className="text-slate-600 max-w-md mx-auto">قسم توصيل المتطوعين غير متاح حالياً. يرجى المحاولة لاحقاً.</p>
                <div className="mt-8">
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/">العودة للرئيسية</Link>
                    </Button>
                </div>
            </div>
        )
    }

    let query = supabase
        .from('volunteer_deliveries')
        .select(`
            *,
            profiles:user_id (
                full_name,
                avatar_url,
                phone
            )
        `)
        .eq('status', 'approved')

    if (city) {
        query = query.or(`from_city.ilike."%${city}%",to_city.ilike."%${city}%"`)
    }

    if (date) {
        query = query.eq('delivery_date', date)
    }

    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest'
    const isAscending = sort === 'oldest'

    const { data: volunteers } = await query.order('created_at', { ascending: isAscending })

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-right">توصيلات المتطوعين</h1>
                    <p className="text-slate-500 mt-2 max-w-2xl text-right">
                        تواصل مع متطوعي المجتمع الذين يمكنهم المساعدة في توصيل تبرعاتك.
                    </p>
                </div>
                <Button size="lg" className="shrink-0 gap-2" asChild>
                    <Link href="/volunteer/create">
                        <Plus className="h-5 w-5" />
                        انضم كمتطوع
                    </Link>
                </Button>
            </div>

            <VolunteerFilters />

            {volunteers && volunteers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {volunteers.map((volunteer) => (
                        <VolunteerCard key={volunteer.id} volunteer={volunteer} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-4xl">
                            🚚
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">لا يوجد متطوعين نشطين</h3>
                        <p className="text-slate-500">
                            حالياً، لا توجد عروض توصيل من متطوعين. كن أول من يساعد!
                        </p>
                        <Button variant="outline" className="mt-4" asChild>
                            <Link href="/volunteer/create">
                                تطوع الآن
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
