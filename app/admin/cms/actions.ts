'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { requireAdminOrMod } from '@/lib/auth-guard'

export async function getSiteConfig() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('site_config')
        .select('*')

    if (error) {
        console.error('Error fetching site config:', error)
        return {}
    }

    // Convert array to object
    const config: Record<string, string> = {}
    data.forEach((item: any) => {
        config[item.key] = item.value
    })

    return config
}

export async function updateSiteConfig(updates: Record<string, string>) {
    const { supabase } = await requireAdminOrMod()

    // Ideally check role here too if strict, but RLS handles it. 
    // We'll trust RLS or add a quick check if needed. Rules are in schema.

    const updatesArray = Object.entries(updates).map(([key, value]) => ({
        key,
        value
    }))

    const { error } = await supabase
        .from('site_config')
        .upsert(updatesArray)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    revalidatePath('/admin/cms')
    return { success: true }
}
