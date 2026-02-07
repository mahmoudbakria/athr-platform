'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

export async function adminUpdateItem(itemId: string, formData: FormData) {
    const supabase = await checkAdmin()

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const city = formData.get('city') as string
    const category_id = formData.get('category_id') as string
    const sub_category_id = formData.get('sub_category_id') ? parseInt(formData.get('sub_category_id') as string) : null
    const condition = formData.get('condition') as string
    const delivery_available = formData.get('delivery_available') === 'on'
    const is_urgent = formData.get('is_urgent') === 'on'
    const contact_phone = formData.get('contact_phone') as string
    const tagsRaw = formData.get('tags') as string
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : null

    // Parse location
    const latitudeRaw = formData.get('latitude') as string
    const longitudeRaw = formData.get('longitude') as string
    const latitude = latitudeRaw ? parseFloat(latitudeRaw) : null
    const longitude = longitudeRaw ? parseFloat(longitudeRaw) : null

    const imagesJson = formData.get('images') as string

    const images = imagesJson ? JSON.parse(imagesJson) : null

    const { error } = await supabase
        .from('items')
        .update({
            title,
            description,
            city,
            category_id,
            sub_category_id,
            condition,
            delivery_available,
            is_urgent,
            contact_phone,
            tags,
            latitude,
            longitude,
            images
        })
        .eq('id', itemId)

    if (error) return { error: error.message }

    revalidatePath('/admin/items')
    return { success: true }
}
