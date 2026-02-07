import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { Item, Category, VolunteerDelivery } from '@/types'

// Use a simple client for public data to avoid cookie dependencies in cache
const getPublicSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define raw return type from Supabase for categories to avoid 'any'
interface RawCategory {
    id: string
    name: string
    slug: string
    icon: string | null
    sub_categories: { id: number; name: string }[]
    items: { count: number }[]
}

export const getCachedCategories = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()
        const { data } = await supabase
            .from('categories')
            .select(`
                id, name, slug, icon,
                sub_categories(id, name),
                items(count)
            `)
            .order('name')

        // Cast to unknown first if explicit Supabase types aren't available, then to our expected shape
        const rawData = (data || []) as unknown as RawCategory[]

        return rawData.map((cat) => ({
            ...cat,
            // Map the aggregate count array to a single number
            item_count: cat.items?.[0]?.count || 0
        })) as Category[]
    },
    ['categories-full-list'],
    { revalidate: 60, tags: ['categories'] } // 1 minute cache
)

export const getCachedSubCategories = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()
        const { data } = await supabase
            .from('sub_categories')
            .select('id, name, category_id')
            .order('name')
        return data || []
    },
    ['sub-categories-list'],
    { revalidate: 3600, tags: ['categories'] }
)

export const getCachedSiteConfig = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()
        const { data } = await supabase.from('site_config').select('key, value')

        return (data || []).reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value
            return acc
        }, {})
    },
    ['site-config-map'],
    { revalidate: 3600, tags: ['config'] }
)

export const getCachedSystemSettings = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()
        const { data } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['feature_gamification', 'feature_volunteer_delivery', 'enable_volunteer_points', 'feature_maintenance', 'feature_item_related_volunteers'])

        return data || []
    },
    ['system-settings-subset'],
    { revalidate: 3600, tags: ['settings'] }
)

export const getCachedLatestItems = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()
        const { data } = await supabase
            .from('items')
            .select(`
                id, title, city, created_at, images, description, latitude, longitude, user_id, status, condition,
                categories!inner(name, slug),
                sub_categories(name),
                profiles(id, full_name, avatar_url)
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5)

        return (data || []) as unknown as Item[]
    },
    ['latest-items-home'],
    { revalidate: 60, tags: ['items'] } // 1 minute cache
)

export const getCachedStats = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()

        // Parallel count queries
        const [donated, available, newCond, usedCond] = await Promise.all([
            supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'donated'),
            supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('items').select('*', { count: 'exact', head: true }).eq('condition', 'new'),
            supabase.from('items').select('*', { count: 'exact', head: true }).in('condition', ['used', 'like_new'])
        ])

        return {
            totalDonated: donated.count || 0,
            availableItems: available.count || 0,
            newCondition: newCond.count || 0,
            usedCondition: usedCond.count || 0
        }
    },
    ['impact-stats'],
    { revalidate: 300, tags: ['stats', 'items'] } // 5 minutes cache
)

export const getCachedCategoriesWithItems = unstable_cache(
    async () => {
        const supabase = getPublicSupabase()

        // 1. Get Categories
        const { data: categories } = await supabase
            .from('categories')
            .select('id, name, slug, icon, sub_categories(id, name)')
            .order('name')

        if (!categories || categories.length === 0) return []

        // 2. Get all Item IDs for these categories
        const categoryIds = categories.map(c => c.id)

        // 3. Fetch all active items for these categories in ONE query
        const { data: allItems } = await supabase
            .from('items')
            .select(`
                id, title, category_id, city, created_at, images, description, latitude, longitude, user_id, status, condition,
                categories!inner(name, slug),
                sub_categories(name),
                profiles(id, full_name, avatar_url)
            `)
            .eq('status', 'active')
            .in('category_id', categoryIds)
            .order('created_at', { ascending: false })
            .limit(200) // Safety limit

        // 4. Group items by category_id in memory
        const itemsByCategoryId = (allItems || []).reduce((acc: Record<string, Item[]>, item: any) => {
            const catId = item.category_id
            if (catId) {
                if (!acc[catId]) acc[catId] = []
                acc[catId].push(item as Item)
            }
            return acc
        }, {})

        // 5. Map items back to categories and limit to 4 per category
        const categoriesWithItems = categories.map((cat) => {
            const items = itemsByCategoryId[cat.id] || []
            return {
                ...cat,
                items: items.slice(0, 4) // Limit to top 4 latest
            }
        })

        // Filter out categories with no items
        return categoriesWithItems.filter(c => c.items.length > 0)
    },
    ['categories-with-items-list'],
    { revalidate: 60, tags: ['items', 'categories'] }
)

export const getCachedItemById = unstable_cache(
    async (id: string) => {
        const supabase = getPublicSupabase()
        const { data, error } = await supabase
            .from('items')
            .select(`
                id, title, description, images, created_at, city,
                latitude, longitude, user_id, status, condition,
                delivery_available, needs_repair, contact_phone, tags,
                categories(name, slug),
                sub_categories(name)
            `)
            .eq('id', id)
            .single()

        if (error || !data) return null
        return data as unknown as (Item & {
            categories: { name: string, slug: string } | null,
            sub_categories: { name: string } | null
        })
    },
    ['item-details'],
    { revalidate: 60, tags: ['items'] }
)

export const getCachedRelatedVolunteers = unstable_cache(
    async (city: string) => {
        const supabase = getPublicSupabase()
        const { data } = await supabase
            .from('volunteer_deliveries')
            .select(`
                id, from_city, to_city, status, created_at, user_id,
                delivery_date, delivery_time, car_type, max_weight_kg, notes, contact_phone,
                profiles:user_id (
                    full_name,
                    avatar_url,
                    phone
                )
            `)
            .eq('status', 'approved')
            .gte('delivery_date', new Date().toISOString().split('T')[0])
            .or(`from_city.ilike."%${city}%",to_city.ilike."%${city}%"`)
            .order('delivery_date', { ascending: true })
            .limit(4)

        return (data || []) as unknown as VolunteerDelivery[]
    },
    ['related-volunteers-for-city'],
    { revalidate: 300, tags: ['volunteers'] }
)

// NEW - Paginated fetcher
export const getPaginatedItems = unstable_cache(
    async (page: number = 1, limit: number = 20) => {
        const supabase = getPublicSupabase()
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data } = await supabase
            .from('items')
            .select(`
                id, title, city, created_at, images, description, latitude, longitude, user_id, status, condition, category_id,
                categories (
                    name,
                    slug
                ),
                sub_categories (
                    name
                ),
                profiles (
                    id,
                    full_name,
                    avatar_url
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(from, to)

        return (data || []) as unknown as Item[]
    },
    ['paginated-items'],
    { revalidate: 60, tags: ['items'] }
)
