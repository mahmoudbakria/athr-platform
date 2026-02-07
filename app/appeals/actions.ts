'use server'

import { createClient } from '@/lib/supabase-server'
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
        revalidatePath('/admin/appeals')
        revalidatePath('/appeals')
        return { success: true, error: null }
    } catch (err: any) {
        console.error("[updateAppeal] Unexpected Error:", err)
        return { error: "Failed to update appeal. Please try again.", success: false }
    }
}
