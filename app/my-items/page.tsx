import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { MyItemsClient } from "@/components/items/MyItemsClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Category } from "@/types"

export const revalidate = 0

export default async function MyItemsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch Items
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Fetch Categories for filter
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    // Fetch User Points
    const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">أغراضي</h1>
                    <p className="text-muted-foreground mt-2">
                        إدارة تبرعاتك وحالاتها.
                    </p>
                </div>
                <Button asChild className="shrink-0">
                    <Link href="/donate">
                        <Plus className="mr-2 h-4 w-4" />
                        تبرع بغرض جديد
                    </Link>
                </Button>
            </div>

            <MyItemsClient
                initialItems={(items || []).map(item => ({ ...item, created_at: item.created_at, updated_at: item.updated_at })) as any[]}
                categories={(categories || []) as Category[]}
                points={profile?.points || 0}
            />
        </div>
    )
}
