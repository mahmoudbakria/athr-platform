'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Item, Category } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';
import { Button } from '@/components/ui/button';

interface CategoryWithItems extends Category {
    items: Item[];
}

interface CategoryGroupedListProps {
    categories: CategoryWithItems[];
    showRepairBadge?: boolean;
}

export function CategoryGroupedList({ categories, showRepairBadge = false }: CategoryGroupedListProps) {
    // Filter out categories with no items
    const activeCategories = categories.filter(cat => cat.items && cat.items.length > 0);

    if (activeCategories.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
                <p>لا توجد أغراض متاحة في الوقت الحالي.</p>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-20">
            {activeCategories.map((category) => (
                <section key={category.id} className="container mx-auto px-4" id={`category-${category.slug}`}>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {category.icon && !category.icon.startsWith('http') && (
                                <span className="text-2xl">{category.icon}</span>
                            )}
                            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                                {category.name.split('http')[0].trim()}
                            </h2>
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                                {category.items.length}
                            </span>
                        </div>

                        <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5 group" asChild>
                            <Link href={`/listings?category=${category.slug}`} className="flex items-center gap-2 text-sm font-medium">
                                عرض الكل
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                        {category.items.slice(0, 5).map((item) => (
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
