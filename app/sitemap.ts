import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase-server'
import { siteConfig } from '@/config/site'

// Force dynamic because we fetch from DB
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    const baseUrl = siteConfig.url

    // 1. Static Routes
    const routes = [
        '',
        '/listings',
        '/categories',
        '/appeals',
        '/volunteer',
        '/donate',
        '/mission',
        '/contact',
        '/auth/login',
        '/auth/signup',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // 2. Dynamic Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, name')

    const categoryRoutes = (categories || []).map((cat) => ({
        url: `${baseUrl}/listings?category=${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    // 3. Dynamic Items (Latest 1000)
    const { data: items } = await supabase
        .from('items')
        .select('id, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1000)

    const itemRoutes = (items || []).map((item) => ({
        url: `${baseUrl}/items/${item.id}`,
        lastModified: new Date(item.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...categoryRoutes, ...itemRoutes]
}
