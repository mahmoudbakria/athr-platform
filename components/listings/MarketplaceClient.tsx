'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { Item, Category, SubCategory } from '@/types';
import { ListingsSidebar } from './ListingsSidebar';
import { ListingsGrid } from './ListingsGrid';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface MarketplaceClientProps {
    categories: Category[];
    subCategories: SubCategory[];
    initialItems?: Item[];
    conditions: string[];
    cities: string[];
}

export function MarketplaceClient({
    categories,
    subCategories,
    initialItems = [],
    conditions,
    cities
}: MarketplaceClientProps) {
    const supabase = createClient();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const initialCategorySlug = searchParams.get('category');
    const initialSearch = searchParams.get('search') || '';
    const initialSubId = searchParams.get('sub');
    const initialUserId = searchParams.get('userId');

    const initialCategoryId = initialCategorySlug
        ? categories.find(c => c.slug === initialCategorySlug)?.id || null
        : null;

    // State
    const [items, setItems] = useState<Item[]>(initialItems);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState({
        category_id: initialCategoryId,
        sub_category_id: initialSubId ? parseInt(initialSubId) : null,
        user_id: initialUserId || null,
        condition: [] as string[],
        city: [] as string[],
        delivery_available: false,
        needs_repair: false,
        search: initialSearch,
        sort: 'newest' as 'newest' | 'oldest'
    });

    // Sync URL params with filters when navigation happens (e.g. from Navbar)
    useEffect(() => {
        const categorySlug = searchParams.get('category');
        const search = searchParams.get('search') || '';
        const subId = searchParams.get('sub');
        const userId = searchParams.get('userId');

        const categoryId = categorySlug
            ? categories.find(c => c.slug === categorySlug)?.id || null
            : null;

        setFilters(prev => ({
            ...prev,
            category_id: categoryId,
            sub_category_id: subId ? parseInt(subId) : null,
            user_id: userId || null,
            search: search
        }));
    }, [searchParams, categories]);

    // Fetch Items
    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('items')
                .select(`
                    *,
                    categories (
                        name,
                        slug
                    ),
                    sub_categories (
                        name
                    ),
                    profiles (
                        full_name
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: filters.sort === 'oldest' });

            if (filters.search) {
                query = query.ilike('title', `%${filters.search}%`);
            }

            if (filters.category_id) {
                query = query.eq('category_id', filters.category_id);
            }

            if (filters.sub_category_id) {
                query = query.eq('sub_category_id', filters.sub_category_id);
            }

            if (filters.user_id) {
                query = query.eq('user_id', filters.user_id);
            }

            if (filters.condition.length > 0) {
                query = query.in('condition', filters.condition);
            }

            if (filters.city.length > 0) {
                query = query.in('city', filters.city);
            }

            if (filters.delivery_available) {
                query = query.eq('delivery_available', true);
            }

            if (filters.needs_repair) {
                query = query.eq('needs_repair', true);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching items:', error);
            } else {
                setItems((data as unknown as Item[]) || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [filters, supabase]);

    // Initial fetch and refetch on filter change
    useEffect(() => {
        // Skip initial fetch if we have initialItems AND no specific user filter that might require refetching
        // But since we modified initial query in server component, initialItems should already be correct for simple cases.
        // However, client side filtering logic is more robust.
        // For now, allow refetch to ensure consistency or just rely on state.
        // Actually, if we have initialItems passed from server, we might want to use them initially to save a request.
        // But if we have a userId filter, the server page might not have filtered by it (server page only fetches all active items).
        // Wait, server page FETCHES ALL ACTIVE items without userId filter.
        // So if userId is present in URL, we MUST re-fetch or filter client side.
        // Since we are implementing 'fetchItems' which queries Supabase, let's just let it run.
        fetchItems();
    }, [filters, fetchItems]);

    // Handlers
    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => {
            // Special handling for category change to reset sub-category
            if (key === 'category_id') {
                return { ...prev, [key]: value, sub_category_id: null };
            }
            return { ...prev, [key]: value };
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
                <ListingsSidebar
                    categories={categories}
                    subCategories={subCategories}
                    conditions={conditions}
                    cities={cities}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
            </aside>

            <main className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">الأغراض المتاحة</h1>
                        <p className="text-muted-foreground">
                            {isLoading ? 'جاري التحميل...' : `${items.length} أغراض تم العثور عليها`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">الترتيب:</span>
                        <Select
                            value={filters.sort}
                            onValueChange={(val) => handleFilterChange('sort', val)}
                            dir="rtl"
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="الترتيب" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">الأحدث أولاً</SelectItem>
                                <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <ListingsGrid items={items} isLoading={isLoading} />
            </main>
        </div>
    );
}
