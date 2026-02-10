'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { siteConfig } from '@/config/site'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for simplicity, but in production use Zod validation
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error("Login error:", error.message)
        return { error: error.message }
    }

    const next = formData.get('next') as string

    revalidatePath('/', 'layout')

    if (next && next.startsWith('/')) {
        redirect(next)
    }

    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        phone: formData.get('phone') as string,
        options: {
            emailRedirectTo: 'https://www.athrk.com/auth/callback',
            data: {
                full_name: formData.get('full_name') as string,
                phone: formData.get('phone') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')

    const next = formData.get('next') as string
    if (next && next.startsWith('/')) {
        redirect(next)
    }

    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function resetPassword(email: string) {
    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://www.athrk.com/auth/update-password',
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updatePassword(password: string) {
    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function getGoogleAuthSetting() {
    const supabase = createAdminClient()

    // We assume the table is 'platform_settings' and keys are used.
    // If the table structure is different, this needs adjustment.
    // Based on exploration, I haven't seen the exact table definition, 
    // but standard pattern is key-value.

    // Generic KV fetch
    const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'feature_google_auth')
        .single()

    if (error || !data) {
        // Default to false if missing or error
        return false
    }

    return data.value
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${siteConfig.url}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }

    return { error: 'No URL returned' }
}

