'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { ActionState, VolunteerDelivery } from '@/types'

const volunteerSchema = z.object({
    from_city: z.string().min(1, "From city is required"),
    to_city: z.string().min(1, "To city is required"),
    delivery_date: z.string().min(1, "Date is required"),
    delivery_time: z.string().optional(),
    car_type: z.string().min(1, "Car type is required"),
    max_weight_kg: z.coerce.number().min(0.1, "Max weight must be positive"),
    notes: z.string().optional(),
    contact_phone: z.string().min(5, "Contact phone is required"),
})

export async function createVolunteerDelivery(prevState: ActionState | null, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    // 1. Check Feature Flag
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_volunteer_delivery')
        .maybeSingle()

    if (feature && feature.value === false) {
        return { error: "Volunteer delivery system is currently disabled.", success: false }
    }

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: "You must be logged in to volunteer.", success: false }
    }

    // 3. Validation
    const rawData = {
        from_city: formData.get('from_city'),
        to_city: formData.get('to_city'),
        delivery_date: formData.get('delivery_date'),
        delivery_time: formData.get('delivery_time'),
        car_type: formData.get('car_type'),
        max_weight_kg: formData.get('max_weight_kg'),
        notes: formData.get('notes'),
        contact_phone: formData.get('contact_phone'),
    }

    const valResult = volunteerSchema.safeParse(rawData)
    if (!valResult.success) {
        return { error: valResult.error.issues[0].message, success: false }
    }

    const { error } = await supabase
        .from('volunteer_deliveries')
        .insert({
            user_id: user.id,
            from_city: valResult.data.from_city,
            to_city: valResult.data.to_city,
            delivery_date: valResult.data.delivery_date,
            delivery_time: valResult.data.delivery_time || null,
            car_type: valResult.data.car_type,
            max_weight_kg: valResult.data.max_weight_kg,
            notes: valResult.data.notes || null,
            contact_phone: valResult.data.contact_phone,
            status: 'pending'
        })

    if (error) {
        console.error("Volunteer creation error:", error)
        return { error: "Failed to submit request. Please try again.", success: false }
    }

    revalidatePath('/admin/volunteers')
    return { success: true, error: null }
}

export async function getUserVolunteerDeliveries(): Promise<{ success: boolean; data: VolunteerDelivery[] }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, data: [] }

    const { data, error } = await supabase
        .from('volunteer_deliveries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching user deliveries:", error)
        return { success: false, data: [] }
    }

    // Filter out cancelled items in JS to avoid potentially crashing SQL if enum isn't updated
    const visibleData = (data as VolunteerDelivery[]) ? (data as VolunteerDelivery[]).filter((item: VolunteerDelivery) => item.status !== 'cancelled') : []

    return { success: true, data: visibleData }
}

export async function cancelVolunteerDelivery(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Ensure users can only cancel their own requests
    const { error } = await supabase
        .from('volunteer_deliveries')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error cancelling request:", error)
        return { success: false, error: "Failed to cancel request" }
    }

    revalidatePath('/my-volunteers')
    return { success: true }
}

export async function updateUserVolunteerDelivery(id: string, data: Partial<VolunteerDelivery>): Promise<ActionState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Users can only update their own requests
    // Reset status to pending so admin must re-approve
    const { error } = await supabase
        .from('volunteer_deliveries')
        .update({ ...data, status: 'pending' })
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error("Error updating user request:", error)
        return { success: false, error: "Failed to update" }
    }

    revalidatePath('/my-volunteers')
    return { success: true }
}
