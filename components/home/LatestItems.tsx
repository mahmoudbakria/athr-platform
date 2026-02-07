import { Item } from "@/types"
import { ItemCard } from "@/components/items/ItemCard"

interface LatestItemsProps {
    items: Item[]
    showRepairBadge: boolean
}

export function LatestItems({ items, showRepairBadge }: LatestItemsProps) {
    if (!items || items.length === 0) return null

    return (
        <section className="pb-16 pt-8 md:pt-12 container px-4 mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">وصل حديثاً</h2>
                    <p className="text-muted-foreground mt-2">اكتشف أحدث الأغراض التي تمت إضافتها من قبل مجتمعنا.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                {items.map((item) => (
                    <div key={item.id} className="h-full">
                        <ItemCard item={item} showRepairBadge={showRepairBadge} />
                    </div>
                ))}
            </div>
        </section>
    )
}
