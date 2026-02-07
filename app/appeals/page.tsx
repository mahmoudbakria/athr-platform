import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { AppealsHero } from '@/components/appeals/AppealsHero'
import { AppealsFeed } from '@/components/appeals/AppealsFeed'

export const dynamic = 'force-dynamic'

export default async function AppealsPage() {
    const supabase = await createClient()

    // 1. Check Feature Flag
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_appeals_enabled')
        .maybeSingle()

    const isEnabled = feature?.value ?? true

    const { data: creationFeature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_appeals_creation_enabled')
        .maybeSingle()

    const isCreationEnabled = creationFeature?.value ?? true

    if (!isEnabled) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="h-10 w-10 text-slate-400" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Feature Disabled</h1>
                <p className="text-slate-600 max-w-md mx-auto">The Community Appeals section is currently unavailable. Please check back later.</p>
                <div className="mt-8">
                    <Button asChild variant="outline" className="rounded-full">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        )
    }

    // 3. Fetch Appeals
    const { data: appeals } = await supabase
        .from('appeals')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans" dir="rtl">
            <AppealsHero isCreationEnabled={isCreationEnabled} />

            <div className="container px-4 md:px-6 pb-20">
                {/* Status Message */}
                {!isCreationEnabled && (
                    <div className="bg-amber-50/90 backdrop-blur border border-amber-200 text-amber-900 px-6 py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 mb-10 mx-auto max-w-2xl">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <span className="font-medium">تم إيقاف استقبال الطلبات الجديدة مؤقتاً. يمكنكم تصفح الطلبات الحالية فقط.</span>
                    </div>
                )}

                <AppealsFeed initialAppeals={appeals || []} />
            </div>
        </div>
    )
}
