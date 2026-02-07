import { createClient } from '@/lib/supabase-server'
import { CategoryList } from './category-list'
import { Category, SubCategory } from '@/types'

// Dynamic is required for admin data, but we use revalidate = 0 for standard Next.js dynamic behavior
export const revalidate = 0

// Proper type definition for the join
interface CategoryWithSubs extends Category {
    sub_categories: SubCategory[]
}

export default async function CategoriesPage() {
    const supabase = await createClient()

    // Optimization: Select STRICTLY what we need. 
    // Avoid `select(*)` which is a security risk and performance cost.
    const { data } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            slug, 
            icon, 
            sub_categories (
                id, 
                name
            )
        `)
        .order('name')

    // Data Transformation: Ensure generic supabase response matches our strict type
    // and explicitly sort sub_categories for consistent UI (Supabase basic join doesn't always guarantee nested order)
    const categories = (data || []).map((cat: any) => ({
        ...cat,
        sub_categories: (cat.sub_categories || []).sort((a: any, b: any) => a.name.localeCompare(b.name))
    })) as CategoryWithSubs[]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
            </div>

            <CategoryList categories={categories} />
        </div>
    )
}
