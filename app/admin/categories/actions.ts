'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath, updateTag } from 'next/cache'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        throw new Error('Unauthorized')
    }
    return supabase
}

export async function createCategory(formData: FormData) {
    const supabase = await checkAdmin()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const icon = formData.get('icon') as string // optional

    if (!name || !slug) {
        return { error: 'Name and slug are required' }
    }

    const { error } = await supabase
        .from('categories')
        .insert({ name, slug, icon })

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = await checkAdmin()

    const name = formData.get('name') as string
    const slug = formData.get('slug') as string
    const icon = formData.get('icon') as string

    const { error } = await supabase
        .from('categories')
        .update({ name, slug, icon })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}

export async function deleteCategory(id: string) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}

export async function createSubCategory(formData: FormData) {
    const supabase = await checkAdmin()

    const name = formData.get('name') as string
    const category_id = formData.get('category_id') as string

    if (!name || !category_id) {
        return { error: 'Name and category are required' }
    }

    const { error } = await supabase
        .from('sub_categories')
        .insert({ name, category_id })

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}

export async function updateSubCategory(id: number, formData: FormData) {
    const supabase = await checkAdmin()

    const name = formData.get('name') as string

    if (!name) {
        return { error: 'Name is required' }
    }

    const { error } = await supabase
        .from('sub_categories')
        .update({ name })
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}

export async function deleteSubCategory(id: number) {
    const supabase = await checkAdmin()

    const { error } = await supabase
        .from('sub_categories')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/categories')
    updateTag('categories')
    return { success: true }
}
