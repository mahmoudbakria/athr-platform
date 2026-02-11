import { createClient } from '@/lib/supabase-server'
import { ItemRegistry } from './item-list'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
    const supabase = await createClient()

    // 1. Fetch items with profiles using relation
    const { data: items } = await supabase
        .from('items')
        .select(`
            *,
            item_number,
            profiles:user_id (
                id,
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })

    // 2. Fetch categories for filtering
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Item Registry</h1>
                <span className="text-sm text-muted-foreground">
                    {items?.length || 0} total items
                </span>
            </div>

            <ItemRegistry items={items || []} categories={categories || []} />
        </div>
    )
}
