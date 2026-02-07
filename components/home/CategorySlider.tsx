'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category } from '@/types';

export function CategorySlider({ categories }: { categories: Category[] }) {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300;
            const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="pt-16 pb-0 container mx-auto px-4 relative group">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">تصفح التصنيفات</h2>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('right')}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('left')}
                            className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                    <Link href="/categories" className="text-primary hover:underline text-sm font-medium">
                        عرض الكل
                    </Link>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex gap-3 md:gap-6 overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
                dir="rtl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/listings?category=${category.slug}`}
                        className="group flex-shrink-0 w-24 md:w-32 snap-start scroll-ml-4"
                    >
                        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-slate-100 dark:bg-slate-800 border-2 border-transparent group-hover:border-primary/10">
                            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                                <Image
                                    src={category.icon}
                                    alt={category.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-3xl group-hover:scale-110 transition-transform duration-300">
                                    {category.icon || <Package />}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 text-center">
                            <h3 className="text-gray-900 dark:text-gray-100 font-bold text-sm group-hover:text-primary transition-colors truncate px-1">
                                {category.name}
                            </h3>
                            <span className="text-[10px] md:text-xs text-slate-500 block mt-0.5">
                                {category.item_count || 0} غرض
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section >
    );
}
