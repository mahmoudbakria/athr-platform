'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface StarRatingProps {
    value: number
    onChange?: (value: number) => void
    readOnly?: boolean
    size?: number
    className?: string
}

export function StarRating({ value, onChange, readOnly = false, size = 16, className }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState<number | null>(null)

    const stars = [1, 2, 3, 4, 5]

    return (
        <div className={cn("flex items-center gap-0.5", className)} dir="ltr">
            {stars.map((star) => {
                const isFilled = (hoverValue !== null ? hoverValue : value) >= star
                const isHalf = !Number.isInteger(value) && value > star - 1 && value < star

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readOnly}
                        onClick={() => !readOnly && onChange?.(star)}
                        onMouseEnter={() => !readOnly && setHoverValue(star)}
                        onMouseLeave={() => !readOnly && setHoverValue(null)}
                        className={cn(
                            "transition-colors focus:outline-none",
                            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"
                        )}
                        aria-label={`Rate ${star} stars`}
                    >
                        <Star
                            size={size}
                            className={cn(
                                "stroke-1",
                                isFilled
                                    ? "fill-yellow-400 text-yellow-500"
                                    : "fill-transparent text-muted-foreground/40"
                            )}
                        />
                    </button>
                )
            })}
        </div>
    )
}
