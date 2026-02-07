import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { EditItemForm } from './edit-form'

import { getCachedCategories, getCachedSubCategories } from '@/lib/fetchers'

export const dynamic = 'force-dynamic'

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Parallel fetch: Item (fresh) + Categories (cached) + SubCategories (cached)
    const [itemRes, categories, subCategories] = await Promise.all([
        supabase.from('items').select('*').eq('id', id).single(),
        getCachedCategories(),
        getCachedSubCategories()
    ])

    const item = itemRes.data

    if (!item) return notFound()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild size="icon">
                    <Link href="/admin/items"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-2xl font-bold">Edit Item</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <EditItemForm item={item} categories={categories || []} subCategories={subCategories as any || []} />
                </CardContent>
            </Card>
        </div>
    )
}
