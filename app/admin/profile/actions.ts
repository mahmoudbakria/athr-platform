'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const avatar_url = formData.get('avatar_url') as string
    const show_avatar = formData.get('show_avatar') === 'on'

    const { error } = await supabase
        .from('profiles')
        .update({ full_name, phone, avatar_url, show_avatar })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/admin/profile')
    revalidatePath('/', 'layout') // Update header avatar everywhere
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return { error: error.message }
    return { success: true }
}
