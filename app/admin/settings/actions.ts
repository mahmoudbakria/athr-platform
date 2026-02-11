'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdminOrMod } from '@/lib/auth-guard'

export async function updateSetting(key: string, value: boolean) {
    const { supabase } = await requireAdminOrMod()

    // 1. Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Update the setting
    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value })
        .select()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/settings')
    revalidatePath('/', 'layout')
    revalidateTag('settings')
    return { success: true }
}

export async function updatePointValue(key: string, value: number) {
    const { supabase } = await requireAdminOrMod()

    // 2. Update/Insert the point value
    const { error } = await supabase
        .from('point_values')
        .upsert({ key, value })
        .select()

    if (error) {
        console.error('Error updating point value:', error)
        return { error: 'Failed to update point value' }
    }

    revalidatePath('/admin/settings')
    return { success: true }
}
