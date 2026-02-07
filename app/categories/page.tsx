
import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowLeft } from 'lucide-react';
import { Category } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'جميع التصنيفات | خير',
    description: 'تصفح جميع التصنيفات للعثور على الأغراض التي تحتاجها.',
};

export default async function CategoriesPage() {
    const supabase = await createClient();

    let query = supabase
        .from('categories')
        .select('id, name, slug, icon, items(count)')
        .order('name');

    let { data: categoriesData, error } = await query;

    if (error) {
        console.error("Error fetching categories (with count):", JSON.stringify(error, null, 2));

        // Fallback: Fetch without items(count) if the relation is causing issues
        const fallbackQuery = supabase
            .from('categories')
            .select('id, name, slug, icon')
            .order('name');

        const fallbackResult = await fallbackQuery;

        if (fallbackResult.error) {
            console.error("Error fetching categories (fallback):", JSON.stringify(fallbackResult.error, null, 2));
        } else {
            console.log("Fallback categories fetched:", fallbackResult.data?.length);
            categoriesData = fallbackResult.data as any;
            error = null; // Clear error to allow rendering
        }
    } else {
        console.log("Categories fetched successfully:", categoriesData?.length);
    }

    const categories = (categoriesData || []).map((cat: any) => ({
        ...cat,
        item_count: cat.items?.[0]?.count || 0
    })) as Category[];

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="mb-8 ">
                <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1 rtl:rotate-180 ml-1" />
                    العودة للرئيسية
                </Link>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">جميع التصنيفات</h1>
                <p className="text-muted-foreground mt-2">تصفح الأغراض حسب التصنيف</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/listings?category=${category.slug}`}
                        className="group flex flex-col items-center p-2 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                        <div className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center p-0 mb-3 group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                                <Image
                                    src={category.icon}
                                    alt={category.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-3xl text-primary/70">
                                    {category.icon || <Package className="w-8 h-8" />}
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-sm text-center text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1 w-full px-1">{category.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{category.item_count || 0} أغراض</p>
                    </Link>
                ))}
            </div>
        </div >
    );
}
