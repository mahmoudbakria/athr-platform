'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// We need a separate client for Admin Auth operations using Service Key
// This requires SUPABASE_SERVICE_ROLE_KEY in .env.local
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
    : null

export async function createUser(formData: FormData) {
    // 1. Verify Requesting User is Admin
    const supabase = await createServerClient()
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

    // 2. Check Service Key
    if (!supabaseAdmin) {
        return {
            error: 'Missing SUPABASE_SERVICE_ROLE_KEY. Cannot create user programmatically without it. Please add it to your environment variables.'
        }
    }

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const full_name = formData.get('full_name') as string
    const role = formData.get('role') as string
    const phone = formData.get('phone') as string

    // 3. Create User via Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, phone }
    })

    if (createError) return { error: createError.message }
    if (!newUser.user) return { error: 'Failed to create user' }

    // 4. Update Profile Role
    // The trigger 'handle_new_user' might have already run, creating a profile with default role 'user'.
    // We need to update it to the selected role.

    // Wait a bit or Just upsert directly
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role, full_name, phone }) // ensure these are correct
        .eq('id', newUser.user.id)

    if (profileError) {
        // If update fails, maybe trigger hasn't run yet?
        // Let's try upserting just in case
        await supabaseAdmin.from('profiles').upsert({
            id: newUser.user.id,
            role,
            full_name,
            phone,
            email
        })
    }

    revalidatePath('/admin/users')
    redirect('/admin/users')
}
