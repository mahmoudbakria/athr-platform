'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { requireAdminOrMod } from '@/lib/auth-guard'

export async function getVolunteerDeliveries() {
    const { supabase } = await requireAdminOrMod()

    const { data: userSess } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('volunteer_deliveries')
        .select(`
            *,
            profiles:user_id (
                full_name,
                phone,
                email
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching volunteer deliveries:", error)
        return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data, error: null }
}

export async function updateVolunteerStatus(id: string, status: 'approved' | 'rejected') {
    const { supabase } = await requireAdminOrMod()

    // Auth check usually handled by middleware/layout, but good to be safe if strictly admin action
    // We assume checking role is done via RLS or caller, but better to check if needed.
    // For now, relies on RLS 'public.is_admin_or_mod()'

    const { error } = await supabase
        .from('volunteer_deliveries')
        .update({ status })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/volunteers')

    // Award points if status is changed to approved
    if (status === 'approved') {
        try {
            // Get volunteer delivery details to find user_id
            const { data: volunteerAuth, error: volError } = await supabase
                .from('volunteer_deliveries')
                .select('user_id, points_awarded')
                .eq('id', id)
                .single()

            if (volError || !volunteerAuth?.user_id) {
                console.error("Error fetching volunteer owner for points:", volError)
            } else if (volunteerAuth.points_awarded) {
                // Points already awarded for this volunteer delivery. Skipping.
            } else {
                // Get volunteer points value
                const { data: pointData, error: pointError } = await supabase
                    .from('point_values')
                    .select('value')
                    .eq('key', 'volunteer_delivery')
                    .maybeSingle()

                if (pointError) {
                    console.error("Error fetching volunteer_delivery points:", pointError)
                }

                const points = pointData?.value || 0

                let success = false
                if (points > 0) {
                    // Use new specific RPC for volunteer points
                    const { error: rpcError } = await supabase.rpc('increment_volunteer_points', {
                        user_id: volunteerAuth.user_id,
                        amount: points
                    })

                    if (rpcError) {
                        console.error("Error awarding volunteer points:", rpcError)
                    } else {
                        success = true
                    }
                } else {
                    success = true
                }

                if (success) {
                    await supabase
                        .from('volunteer_deliveries')
                        .update({ points_awarded: true })
                        .eq('id', id)
                }
            }
        } catch (err) {
            console.error("Failed to process points for volunteer approval", err)
        }
    }

    return { success: true }
}

export async function toggleVolunteerSystem(enabled: boolean) {
    const { supabase } = await requireAdminOrMod()

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key: 'feature_volunteer_delivery', value: enabled })

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/volunteer/create')
    revalidatePath('/admin/volunteers')
    return { success: true }
}

export async function updateVolunteerDeliveryDetails(id: string, data: any) {
    const { supabase } = await requireAdminOrMod()

    const { error } = await supabase
        .from('volunteer_deliveries')
        .update(data)
        .eq('id', id)

    if (error) {
        console.error("Error updating volunteer details:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/volunteers')
    return { success: true }
}

export async function deleteVolunteerDelivery(id: string) {
    const { supabase } = await requireAdminOrMod()

    const { error } = await supabase
        .from('volunteer_deliveries')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Error deleting volunteer:", error)
        return { success: false, error: "Failed to delete" }
    }

    revalidatePath('/admin/volunteers')
    return { success: true }
}

export async function getLogisticsData() {
    const { supabase } = await requireAdminOrMod()

    const { data: items, error } = await supabase
        .from('items')
        .select(`
            title,
            city,
            status,
            volunteer_id,
            profiles:volunteer_id (
                full_name,
                vehicle_type
            )
        `)
        .eq('needs_transport', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching logistics data:", error)
        return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: items, error: null }
}
