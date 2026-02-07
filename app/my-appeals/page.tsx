import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { AppealsFeed } from "@/components/appeals/AppealsFeed"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HandHelping } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function MyAppealsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch User's Appeals
    const { data: appeals } = await supabase
        .from('appeals')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const visibleAppeals = (appeals || []).filter(a => a.status !== 'deleted')

    return (
        <div className="container mx-auto py-10 px-4 md:px-0" dir="rtl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">نداءاتي</h1>
                    <p className="text-slate-500 mt-2">
                        إدارة ومتابعة طلبات المساعدة التي قمت بتقديمها.
                    </p>
                </div>
                <Button asChild className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
                    <Link href="/appeals/create">
                        <HandHelping className="ml-2 h-4 w-4" />
                        تقديم طلب جديد
                    </Link>
                </Button>
            </div>

            <AppealsFeed initialAppeals={visibleAppeals} viewMode="user" />
        </div>
    )
}
