

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Item, Category } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { Button } from '@/components/ui/button';

interface CategoryWithItems extends Category {
    items: Item[];
}

interface CategoryFeedsProps {
    feeds: CategoryWithItems[];
    showRepairBadge?: boolean;
}

export function CategoryFeeds({ feeds, showRepairBadge = false }: CategoryFeedsProps) {
    if (!feeds || feeds.length === 0) return null;

    return (
        <div className="space-y-12 pb-16">
            {feeds.map((feed) => (
                <section key={feed.id} className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {feed.icon && (
                                <span className="text-2xl">{feed.icon}</span>
                            )}
                            <h2 className="text-2xl font-bold tracking-tight">{feed.name}</h2>
                        </div>
                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
                            <Link href={`/?category=${feed.slug}#marketplace`} className="flex items-center gap-2 text-sm font-medium">
                                View all
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {feed.items.map((item) => (
                            <div key={item.id} className="h-full">
                                <ItemCard item={item} showRepairBadge={showRepairBadge} />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
