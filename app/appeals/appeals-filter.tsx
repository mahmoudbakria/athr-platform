'use client'

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { cn } from "@/lib/utils"

interface AppealsFilterProps {
    categories: string[]
}

export function AppealsFilter({ categories }: AppealsFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentCategory = searchParams.get('category') || 'All'

    const allCategories = ['All', ...categories]

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())

            if (value === 'All') {
                params.delete(name)
            } else {
                params.set(name, value)
            }

            return params.toString()
        },
        [searchParams]
    )

    const handleCategoryChange = (category: string) => {
        router.push(`/appeals?${createQueryString('category', category)}`)
    }

    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {allCategories.map((category) => (
                <Button
                    key={category}
                    variant={currentCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className={cn(
                        "rounded-full transition-all",
                        currentCategory === category
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                    )}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
