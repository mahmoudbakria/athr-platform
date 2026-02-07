'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { zfd } from 'zod-form-data'

// Schemas
const updateProfileSchema = zfd.formData({
    full_name: zfd.text(z.string().min(3, "Full name must be at least 3 characters")),
    phone: zfd.text(z.string().optional()),
    avatar_url: zfd.text(z.string().url("Invalid avatar URL").optional().or(z.literal(''))),
    show_avatar: zfd.checkbox(),
})

const updatePasswordSchema = zfd.formData({
    password: zfd.text(z.string().min(6, "Password must be at least 6 characters")),
    confirmPassword: zfd.text(z.string().min(6, "Password must be at least 6 characters")),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    // Validate Input
    const result = updateProfileSchema.safeParse(formData)

    if (!result.success) {
        const error = result.error.flatten().fieldErrors
        // Return the first error found for simplicity, or handle field errors in UI
        const firstError = Object.values(error)[0]?.[0] || "Invalid input"
        return { error: firstError }
    }

    const { full_name, phone, avatar_url, show_avatar } = result.data

    const { error } = await supabase
        .from('profiles')
        .update({ 
            full_name, 
            phone, 
            avatar_url: avatar_url || null, // Handle empty string as null if needed
            show_avatar 
        })
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/profile')
    revalidatePath('/', 'layout')
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()

    // Validate Input
    const result = updatePasswordSchema.safeParse(formData)

    if (!result.success) {
        const error = result.error.flatten().fieldErrors
        const firstError = Object.values(error)[0]?.[0] || "Invalid input"
        return { error: firstError }
    }

    const { password } = result.data

    const { error } = await supabase.auth.updateUser({ password })

    if (error) return { error: error.message }
    return { success: true }
}


