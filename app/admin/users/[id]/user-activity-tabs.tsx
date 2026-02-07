'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ItemRegistry } from '@/app/admin/items/item-list'
import { AppealsTable } from '@/app/admin/appeal-requests/appeals-table'
import AdminVolunteerTable from '@/components/admin/volunteers/AdminVolunteerTable'
import { Item, Category, VolunteerDelivery } from "@/types"

// We need to define Appeal interface locally or import it if compatible
// The AppealsTable defines it locally, so we might need to match it or export it from there.
// For now, I will use 'any' for appeals to avoid type duplication issues during quick prototyping,
// or better, I will check if I can import it.
// Looking at previous view_file, Appeal is defined in appeals-table.tsx and NOT exported.
// I will define a compatible interface here.

interface Appeal {
    id: string
    title: string
    story: string
    target_amount?: number
    category: string
    city?: string
    admin_note?: string
    contact_info: string
    created_at: string
    status: 'pending' | 'approved' | 'rejected' | 'closed' | 'deleted'
    user_id: string
    profiles?: {
        full_name: string | null
        email?: string | null
    } | null
}

interface UserActivityTabsProps {
    items: Item[]
    categories: Category[]
    appeals: Appeal[]
    volunteerDeliveries: VolunteerDelivery[]
}

export function UserActivityTabs({ items, categories, appeals, volunteerDeliveries }: UserActivityTabsProps) {
    return (
        <Tabs defaultValue="items" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
                <TabsTrigger value="appeals">Appeals ({appeals.length})</TabsTrigger>
                <TabsTrigger value="volunteers">Volunteer ({volunteerDeliveries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Items History</h2>
                </div>
                <ItemRegistry items={items} categories={categories} />
            </TabsContent>

            <TabsContent value="appeals" className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Appeals History</h2>
                </div>
                <AppealsTable appeals={appeals} />
            </TabsContent>

            <TabsContent value="volunteers" className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Volunteer Deliveries</h2>
                </div>
                <AdminVolunteerTable data={volunteerDeliveries} />
            </TabsContent>
        </Tabs>
    )
}
