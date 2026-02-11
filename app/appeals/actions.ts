'use server'

import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const appealSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    story: z.string().min(20, "Please provide more detail in your story"),
    category: z.string().min(1, "Category is required"),
    city: z.string().min(1, "City is required"),
    target_amount: z.coerce.number().optional(),
    contact_info: z.string().min(5, "Contact info is required"),
})

export async function createAppeal(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // 1. Check Feature Flag
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_appeals_creation_enabled')
        .maybeSingle()

    if (!feature?.value) {
        return { error: "Community Appeals are currently disabled.", success: false }
    }

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to submit an appeal.", success: false }
    }

    // 3. Validation
    const rawData = {
        title: formData.get('title'),
        story: formData.get('story'),
        category: formData.get('category'),
        city: formData.get('city'),
        target_amount: formData.get('target_amount'),
        contact_info: formData.get('contact_info'),
    }

    const valResult = appealSchema.safeParse(rawData)
    if (!valResult.success) {
        return { error: valResult.error.issues[0].message, success: false }
    }

    // Ensure Profile Exists (Fix for 'Unknown' user)
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        // Profile missing? Create it from user metadata using Admin Client
        const adminClient = createAdminClient()

        // Fetch user via admin to ensure we have metadata
        const { data: { user: adminUser }, error: userError } = await adminClient.auth.admin.getUserById(user.id)

        if (adminUser) {
            const fullName = adminUser.user_metadata?.full_name || adminUser.email?.split('@')[0] || 'User'

            await adminClient
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    email: adminUser.email,
                    updated_at: new Date().toISOString(),
                })
        }
    }

    const { data, error } = await supabase
        .from('appeals')
        .insert({
            user_id: user.id,
            title: valResult.data.title,
            story: valResult.data.story,
            category: valResult.data.category,
            city: valResult.data.city, // New
            target_amount: valResult.data.target_amount || null,
            contact_info: valResult.data.contact_info,
            status: 'pending' // Default via DB override
        })
        .select()
        .single()

    if (error) {
        console.error("Appeal creation error:", error)
        return { error: "Failed to submit appeal. Please try again.", success: false }
    }

    revalidatePath('/appeals')
    return { success: true, error: null }
}

export async function updateAppeal(id: string, prevState: any, formData: FormData) {
    const supabase = await createClient()

    try {
        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { error: "You must be logged in to edit an appeal.", success: false }
        }

        // 2. Fetch current appeal
        const { data: existingAppeal, error: fetchError } = await supabase
            .from('appeals')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingAppeal) {
            return { error: "Appeal not found or you don't have permission.", success: false }
        }

        // Verify ownership/admin
        const isAdmin = await (async () => {
            const { data: rpcData } = await supabase.rpc('is_admin_or_mod')
            return !!rpcData
        })()

        if (existingAppeal.user_id !== user.id && !isAdmin) {
            return { error: "You can only edit your own appeals.", success: false }
        }

        // 3. Validation
        const rawData = {
            title: formData.get('title'),
            story: formData.get('story'),
            category: formData.get('category'),
            city: formData.get('city'),
            target_amount: formData.get('target_amount'),
            contact_info: formData.get('contact_info'),
        }

        const valResult = appealSchema.safeParse(rawData)
        if (!valResult.success) {
            return { error: valResult.error.issues[0].message, success: false }
        }

        // 4. Update
        // Note: The DB Trigger 'on_appeal_update_reset_status' forces status to 'pending'
        // for non-admins. We set it here optimistically for the UI/logic.
        const newStatus = isAdmin ? existingAppeal.status : 'pending'

        const updates = {
            title: valResult.data.title,
            story: valResult.data.story,
            category: valResult.data.category,
            city: valResult.data.city,
            target_amount: valResult.data.target_amount || null,
            contact_info: valResult.data.contact_info,
            status: newStatus,
        }


        const { error } = await supabase
            .from('appeals')
            .update(updates)
            .eq('id', id)

        if (error) {
            console.error("[updateAppeal] DB Update Error:", error)
            throw error
        }

        revalidatePath('/my-appeals')
        revalidatePath('/admin/appeal-requests')
        revalidatePath('/appeals')
        return { success: true, error: null }
    } catch (err: any) {
        console.error("[updateAppeal] Unexpected Error:", err)
        return { error: "Failed to update appeal. Please try again.", success: false }
    }
}

export async function deleteAppeal(id: string) {
    const supabase = await createClient()

    try {
        console.log("[deleteAppeal] Starting deletion for ID:", id)

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.log("[deleteAppeal] No user found")
            return { error: "You must be logged in to delete an appeal.", success: false }
        }
        console.log("[deleteAppeal] User authenticated:", user.id)

        // 2. Fetch appeal to check ownership
        // Use admin client to ensure we can read even if RLS somehow blocks read (unlikely but safe)
        const adminClient = createAdminClient()

        const { data: existingAppeal, error: fetchError } = await adminClient
            .from('appeals')
            .select('user_id')
            .eq('id', id)
            .single()

        if (fetchError || !existingAppeal) {
            console.error("[deleteAppeal] Appeal fetch error:", fetchError)
            return { error: "Appeal not found.", success: false }
        }
        console.log("[deleteAppeal] Appeal found, owner:", existingAppeal.user_id)

        // Check if user is admin/mod
        const isAdmin = await (async () => {
            const { data: rpcData } = await supabase.rpc('is_admin_or_mod')
            return !!rpcData
        })()
        console.log("[deleteAppeal] Is Admin:", isAdmin)

        if (existingAppeal.user_id !== user.id && !isAdmin) {
            console.log("[deleteAppeal] Permission denied. Owner:", existingAppeal.user_id, "Requester:", user.id)
            return { error: "You are not authorized to delete this appeal.", success: false }
        }

        if (isAdmin) {
            // Admin: Permanent Delete
            const { error } = await adminClient
                .from('appeals')
                .delete()
                .eq('id', id)

            if (error) {
                console.error("[deleteAppeal] DB Delete Error:", error)
                throw error
            }
            console.log("[deleteAppeal] Appeal permanently deleted by admin")
        } else {
            // User: Soft Delete (Update status to 'deleted')
            const { error } = await adminClient
                .from('appeals')
                .update({ status: 'deleted' })
                .eq('id', id)

            if (error) {
                console.error("[deleteAppeal] DB Soft Delete Error:", error)
                throw error
            }
            console.log("[deleteAppeal] Appeal soft deleted by user")
        }

        revalidatePath('/my-appeals')
        revalidatePath('/admin/appeal-requests')
        revalidatePath('/appeals')
        return { success: true, error: null }
    } catch (err: any) {
        console.error("[deleteAppeal] Unexpected Error:", err)
        return { error: `Failed to delete appeal: ${err.message || 'Unknown error'}`, success: false }
    }
}
