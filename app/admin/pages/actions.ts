'use server'

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { requireAdminOrMod } from "@/lib/auth-guard"

export async function getPages() {
    const { supabase } = await requireAdminOrMod()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    const { data, error } = await supabase
        .from('pages')
        .select('slug, title, updated_at')
        .order('title')

    if (error) throw new Error(error.message)
    return data
}

export async function getPage(slug: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()

    // Allow public read (no auth check needed strictly for fetching, but good to handle errors)
    // If used in admin, we generally trust the caller or add checks.
    if (error) return null

    return data
}

export async function updatePage(slug: string, updates: { title: string; content: string }) {
    const { supabase } = await requireAdminOrMod()

    // Optionally check role via rpc or claims if stricter security is needed
    // Assuming RLS policies handle the "Admins/Mods" check on value write.

    const { error } = await supabase
        .from('pages')
        .update({
            title: updates.title,
            content: updates.content,
            updated_at: new Date().toISOString()
        })
        .eq('slug', slug)

    if (error) {
        return { error: error.message }
    }

    revalidatePath(`/admin/pages`)
    revalidatePath(`/admin/pages/${slug}`)
    revalidatePath(`/${slug}`) // Revalidate the frontend page

    return { success: true }
}
