'use client'

import { Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getUserRatingStats } from '@/lib/actions/rating'
import { UserRatingDialog } from '@/components/users/UserRatingDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase'

interface UserRatingBadgeProps {
    userId: string
    userName: string
    userAvatar?: string | null
    className?: string
}

export function UserRatingBadge({ userId, userName, userAvatar, className }: UserRatingBadgeProps) {
    const [stats, setStats] = useState<{ average: number, count: number } | null>(null)
    const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined)

    useEffect(() => {
        // Fetch stats
        getUserRatingStats(userId).then(setStats)

        // Check current user
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setCurrentUserId(data.user.id)
            }
        })
    }, [userId])

    if (!stats) {
        return <Skeleton className="h-4 w-12" />
    }

    return (
        <UserRatingDialog
            userId={userId}
            userName={userName}
            userAvatar={userAvatar}
            currentRatingStats={stats}
            currentUserId={currentUserId}
        >
            <button
                className={`flex items-center gap-1 hover:bg-muted/50 rounded px-1 -ml-1 transition-colors ${className}`}
            >
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                <span className="text-xs font-medium text-muted-foreground pt-0.5">
                    {stats.average > 0 ? stats.average.toFixed(1) : 'New'}
                </span>
                {stats.count > 0 && <span className="text-[9px] text-muted-foreground/60">({stats.count})</span>}
            </button>
        </UserRatingDialog>
    )
}
