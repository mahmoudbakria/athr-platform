'use server'

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function markItemAsDonated(itemId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

    // Verify ownership
    const { data: item, error: fetchError } = await supabase
        .from('items')
        .select('user_id, donation_points_awarded')
        .eq('id', itemId)
        .single()

    if (fetchError || !item) {
        throw new Error("Item not found")
    }

    if (item.user_id !== user.id) {
        throw new Error("You do not have permission to modify this item")
    }

    // ATOMIC Check-and-Update:
    // Only update if status is NOT 'donated' (or check another flag/status combination)
    // AND donation_points_awarded is false.
    // This lock ensures we only process this ONCE.
    const { data: updatedItem, error: updateError } = await supabase
        .from('items')
        .update({
            status: 'donated',
            donation_points_awarded: true
        })
        .eq('id', itemId)
        .eq('donation_points_awarded', false) // THE LOCK
        .select()
        .single()

    // If no row was returned, it means the condition failed (already awarded or not found)
    if (!updatedItem) {
        // We can check if it was already done to give a better message, or just return success/idempotency
        // If updateError exists, it's a DB error. If neither data nor error, it means no rows matched criteria (already processed).
        if (updateError) {
            throw new Error("Failed to update item status")
        }

        // Already processed? We can just return silently or log.
        // For the user, it looks like "Done".
        return;
    }

    // Award points logic - NOW SAFE because we are inside the atomic success block
    try {
        // Fetch points value
        const { data: pointData, error: pointError } = await supabase
            .from('point_values')
            .select('value')
            .eq('key', 'donate_item')
            .maybeSingle()

        if (pointError) {
            console.error("Error fetching donate_item points:", pointError)
        }

        const points = pointData?.value || 0

        if (points > 0) {
            const { error: rpcError } = await supabase.rpc('increment_points', {
                user_id: user.id,
                amount: points
            })

            if (rpcError) {
                console.error("Error calling increment_points RPC:", rpcError)
                // Note: If this fails, the item is already marked 'donated' and 'awarded'.
                // Ideally we'd wrap this all in a transaction or have a retry mechanism, 
                // but Supabase RPC + simple update isn't fully transactional across the network unless using a PG function for the whole flow.
                // Given the instructions, the Atomic Lock on the ITEM is the priority fix.
            }
        }
    } catch (err) {
        console.error("Failed to award points", err)
    }

    revalidatePath('/my-items')
    revalidatePath(`/items/${itemId}`)
}

export async function createItem(itemData: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Insert Item
    const { data, error } = await supabase
        .from('items')
        .insert({
            ...itemData,
            user_id: user.id,
            status: 'pending'
        })
        .select()
        .single()

    if (error) throw new Error(error.message)

    // Award points logic moved to admin approval
    // See: app/admin/actions.ts -> updateItemStatus

    return { success: true, itemId: data.id }
}
