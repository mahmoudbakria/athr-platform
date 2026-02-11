'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { Item } from '@/types'

// Helper to check admin/mod permissions
async function checkAdminOrMod() {
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

export async function updateItemStatus(itemId: string, status: 'active' | 'rejected', rejectionReason?: string) {
    const supabase = await checkAdminOrMod()

    const updateData: { status: 'active' | 'rejected', rejection_reason?: string } = { status }
    if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason
    }

    const { error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', itemId)

    if (error) throw new Error(error.message)

    // Award points if status is changed to active (approved)
    if (status === 'active') {
        try {
            // Get item owner and points status
            const { data: item, error: itemError } = await supabase
                .from('items')
                .select('user_id, upload_points_awarded')
                .eq('id', itemId)
                .single()

            if (itemError || !item?.user_id) {
                console.error("Error fetching item owner for points:", itemError)
            } else if (item.upload_points_awarded) {
                // Points already awarded for this item upload. Skipping.
            } else {

                // Get upload points value
                const { data: pointData, error: pointError } = await supabase
                    .from('point_values')
                    .select('value')
                    .eq('key', 'upload_item')
                    .maybeSingle()

                if (pointError) {
                    console.error("Error fetching upload_item points:", pointError)
                }

                const points = pointData?.value || 0

                if (points > 0) {
                    const { error: rpcError } = await supabase.rpc('increment_points', {
                        user_id: item.user_id,
                        amount: points
                    })

                    if (rpcError) {
                        console.error("Error awarding points for approval:", rpcError)
                    } else {

                        // Mark points as awarded
                        await supabase
                            .from('items')
                            .update({ upload_points_awarded: true })
                            .eq('id', itemId)
                    }
                } else {
                    // Even if points are 0, mark as awarded so we don't retry unnecessarily
                    await supabase
                        .from('items')
                        .update({ upload_points_awarded: true })
                        .eq('id', itemId)
                }
            }
        } catch (err) {
            console.error("Failed to process points for item approval", err)
        }
    }

    revalidatePath('/admin/moderation')
    revalidatePath('/admin')
    revalidatePath('/admin/items')
    revalidatePath('/', 'layout')
}

export async function toggleItemUrgency(itemId: string, isUrgent: boolean) {
    const supabase = await checkAdminOrMod()

    const { error } = await supabase
        .from('items')
        .update({ is_urgent: isUrgent })
        .eq('id', itemId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/moderation')
    revalidatePath('/admin/items')
}

export async function toggleUserBan(userId: string, isBanned: boolean) {
    const supabase = await checkAdminOrMod()

    const { error } = await supabase
        .from('profiles')
        .update({ is_banned: isBanned })
        .eq('id', userId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/users')
}

export async function updateSystemSetting(key: string, value: boolean) {
    const supabase = await checkAdminOrMod()
    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/settings')
    revalidatePath('/', 'layout') // Revalidate everything as settings affect global UI (UserNav, Profile)
}

export async function updatePointValue(key: string, value: number) {
    const supabase = await checkAdminOrMod()
    const { error } = await supabase
        .from('point_values')
        .upsert({ key, value })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/settings')
}

export async function adminUpdateItem(itemId: string, formData: FormData) {
    const supabase = await checkAdminOrMod()

    // Simple extraction - in real app, add validation
    const data: Partial<Item> = {}
    if (formData.has('title')) data.title = formData.get('title') as string
    if (formData.has('description')) data.description = formData.get('description') as string
    if (formData.has('category_id')) data.category_id = formData.get('category_id') as string
    if (formData.has('city')) data.city = formData.get('city') as string

    const { error } = await supabase.from('items').update(data).eq('id', itemId)

    if (error) return { error: error.message }
    revalidatePath(`/admin/items`)
    revalidatePath(`/admin/items/${itemId}/edit`)
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updateAppealStatus(appealId: string, status: 'approved' | 'rejected' | 'closed') {
    const supabase = await checkAdminOrMod()

    const { error } = await supabase
        .from('appeals')
        .update({ status })
        .eq('id', appealId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/appeal-requests')
}

export async function deleteAppeal(appealId: string) {
    const supabase = await checkAdminOrMod()

    const { error } = await supabase
        .from('appeals')
        .delete()
        .eq('id', appealId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/appeal-requests')
}

export async function deleteItem(itemId: string) {
    const supabase = await checkAdminOrMod()

    const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/items')
    revalidatePath('/my-items')
    revalidatePath('/', 'layout')
}
