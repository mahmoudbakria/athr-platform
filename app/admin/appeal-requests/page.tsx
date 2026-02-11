import { createClient } from '@/lib/supabase-server'
import { AppealsTable } from './appeals-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminAppealsPage() {
    const supabase = await createClient()

    let combinedAppeals = []
    let error = null

    try {
        const { data: appeals, error: supabaseError } = await supabase
            .from('appeals')
            .select(`
                *,
                profiles (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        combinedAppeals = appeals || []
    } catch (e) {
        console.error("Error fetching appeals:", e)
        error = "Failed to load appeals. Please try again later."
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 font-bold mb-2">Error Loading Appeals</div>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Appeals Requests</h1>
                        <p className="text-muted-foreground">Manage and moderate community help requests.</p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/admin/appeal-requests/categories">Manage Categories</Link>
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                    {combinedAppeals.filter((a: any) => a.status === 'pending').length} pending | {combinedAppeals.filter((a: any) => a.status === 'deleted').length} deleted
                </span>
            </div>

            <AppealsTable appeals={combinedAppeals} />
            {/* <pre className="bg-slate-100 p-4 rounded overflow-auto h-96">
                {JSON.stringify(combinedAppeals, null, 2)}
            </pre> */}
        </div>
    )
}
