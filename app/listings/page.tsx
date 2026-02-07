import { createClient } from '@/lib/supabase-server';
import { MarketplaceClient } from '@/components/listings/MarketplaceClient';
import { Item, Category, SubCategory } from '@/types';
import type { Metadata } from 'next';
import { getPaginatedItems } from '@/lib/fetchers';

export const revalidate = 60;

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    props: Props,
): Promise<Metadata> {
    const searchParams = await props.searchParams
    const category = searchParams.category
    const city = searchParams.city

    let title = 'تصفح الأغراض | خير'
    let description = 'ابحث عن الأغراض و فرص التطوع في مجتمعك.'

    if (typeof category === 'string') {
        const cleanCat = category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        title = `${cleanCat} | خير`
        description = `تصفح الأغراض المتاحة في تصنيف ${cleanCat}.`
    }

    if (typeof city === 'string') {
        title = `${title} في ${city}`
        description = `${description} تقع في ${city}.`
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
        }
    }
}

export default async function ListingsPage(props: Props) {
    const supabase = await createClient();
    const searchParams = await props.searchParams;

    const page = Number(searchParams.page) || 1;
    const limit = 20;

    // Parallelize Fetching: Categories, SubCategories, Items (Paginated)
    const [
        { data: categories },
        { data: subCategories },
        items
    ] = await Promise.all([
        supabase.from('categories').select('id, name, slug, icon').order('name'),
        supabase.from('sub_categories').select('id, name, category_id').order('name'),
        getPaginatedItems(page, limit)
    ]);

    // Optimization: Derive distinct Cities & Conditions from the already fetched items
    // This saves a dedicated DB call compared to the previous version.
    const safeItems: Item[] = items || [];

    const distinctConditions = Array.from(new Set(safeItems.map((i: Item) => i.condition).filter(Boolean))) as string[];
    const distinctCities = Array.from(new Set(safeItems.map((i: Item) => i.city).filter(Boolean))) as string[];

    return (
        <div className="container mx-auto px-4 py-8">
            <MarketplaceClient
                categories={(categories || []) as Category[]}
                subCategories={(subCategories || []) as SubCategory[]}
                initialItems={safeItems}
                conditions={distinctConditions}
                cities={distinctCities}
            />
        </div>
    );
}
