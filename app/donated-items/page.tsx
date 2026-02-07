import { createClient } from "@/lib/supabase-server"
import { DonatedItemsClient } from "@/components/donated-items/DonatedItemsClient"
import { Category, Item } from "@/types"

export const metadata = {
    title: 'Donated Items Gallery | Bridge of Good',
    description: 'Browse all items that have been generously donated by our community.',
}

export default async function DonatedItemsPage() {
    const supabase = await createClient()

    // Fetch items with status = 'donated'
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('status', 'donated')
        .order('created_at', { ascending: false })

    // Fetch Categories for filter
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto py-12 px-4 md:px-6">
                <DonatedItemsClient
                    initialItems={(items || []).map(item => ({ ...item, created_at: item.created_at, updated_at: item.updated_at })) as any[]}
                    categories={(categories || []) as Category[]}
                />
            </div>
        </div>
    )
}
