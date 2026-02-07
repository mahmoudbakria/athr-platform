'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export interface RatingStats {
    average: number
    count: number
}

export interface UserRating {
    id: string
    rating: number
    comment: string | null
    created_at: string
    rater?: {
        full_name: string | null
        avatar_url: string | null
    }
}

export async function rateUser(ratedUserId: string, rating: number, comment?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (user.id === ratedUserId) {
        return { error: 'Cannot rate yourself' }
    }

    const { error } = await supabase
        .from('user_ratings')
        .upsert(
            {
                rater_id: user.id,
                rated_user_id: ratedUserId,
                rating,
                comment,
            },
            { onConflict: 'rater_id, rated_user_id' }
        )

    if (error) {
        console.error('Error rating user:', error)
        return { error: 'Failed to submit rating' }
    }

    revalidatePath(`/listings`)
    revalidatePath(`/items/[id]`, 'page')
    return { success: true }
}

export async function getUserRatingStats(userId: string): Promise<RatingStats> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .rpc('get_user_rating_stats', { p_user_id: userId })

    if (error) {
        console.error('Error fetching rating stats:', error)
        return { average: 0, count: 0 }
    }

    return {
        average: Number(data.average) || 0,
        count: Number(data.count) || 0
    }
}

export async function getUserRatings(userId: string, limit = 5): Promise<UserRating[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_ratings')
        .select(`
      id,
      rating,
      comment,
      created_at,
      rater:profiles!user_ratings_rater_id_fkey(full_name, avatar_url)
    `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching user ratings:', error)
        return []
    }

    return data as unknown as UserRating[]
}

export async function getMyRatingForUser(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('user_ratings')
        .select('rating, comment')
        .eq('rater_id', user.id)
        .eq('rated_user_id', targetUserId)
        .single()

    if (error) return null

    return data
}
