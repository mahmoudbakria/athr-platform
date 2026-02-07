'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Simple debounce hook to avoid external dependency issues
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

export function VolunteerFilters() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const initialCity = searchParams.get('city') || ''
    const initialDate = searchParams.get('date') || ''
    const initialSort = searchParams.get('sort') || 'newest'

    const [city, setCity] = useState(initialCity)
    const [date, setDate] = useState(initialDate)
    const [sort, setSort] = useState(initialSort)

    const debouncedCity = useDebounce(city, 300)

    // Trigger search when debounced values change
    useEffect(() => {
        const params = new URLSearchParams(searchParams)

        // Only update if value matches current state to prevent loops or stale closures
        // but here we trust debouncedCity matches desired state

        if (debouncedCity) {
            params.set('city', debouncedCity)
        } else {
            params.delete('city')
        }

        if (date) {
            params.set('date', date)
        } else {
            params.delete('date')
        }

        if (sort && sort !== 'newest') {
            params.set('sort', sort)
        } else {
            params.delete('sort')
        }

        // Avoid pushing if params haven't changed effectively
        if (params.toString() === searchParams.toString()) return

        startTransition(() => {
            router.replace(`/volunteer?${params.toString()}`)
        })
    }, [debouncedCity, date, sort, router, searchParams])

    const onCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCity(e.target.value)
    }

    const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value)
    }

    const clearFilters = () => {
        setCity('')
        setDate('')
        setSort('newest')
        router.replace('/volunteer')
    }

    const hasFilters = city || date || sort !== 'newest'

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-auto md:min-w-[300px]">
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="البحث حسب المدينة..."
                    value={city}
                    onChange={onCityChange}
                    className="pr-8 text-right"
                />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto flex-1 md:justify-end">
                <div className="relative w-full md:w-auto">
                    <Input
                        type="date"
                        value={date}
                        onChange={onDateChange}
                        className="w-full md:w-[180px] cursor-pointer"
                    />
                </div>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">الأحدث أولاً</SelectItem>
                        <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 gap-1 text-muted-foreground hover:text-foreground md:mr-auto">
                    <X className="h-4 w-4" />
                    مسح
                </Button>
            )}
        </div>
    )
}
