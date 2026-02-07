import { Item } from "@/types"
import { ItemCard } from "@/components/items/ItemCard"
import { Button } from "@/components/ui/button"

interface MarketplaceGridProps {
    items: Item[]
    showRepairBadge: boolean
}

export function MarketplaceGrid({ items, showRepairBadge }: MarketplaceGridProps) {
    return (
        <section id="marketplace" className="py-16 container px-4 mx-auto scroll-mt-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
                    <p className="text-muted-foreground mt-2">Browse all available items ready for a new home.</p>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground text-lg">No items found matching the criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="h-full">
                            <ItemCard item={item} showRepairBadge={showRepairBadge} />
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-12 text-center">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                    Load More
                </Button>
            </div>
        </section>
    )
}
