"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
    className,
}: React.HTMLAttributes<HTMLDivElement>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Initialize state from URL params
    const initialFrom = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined
    const initialTo = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: initialFrom,
        to: initialTo,
    })

    // Update URL when date changes
    React.useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())

        if (date?.from) {
            params.set('from', date.from.toISOString())
        } else {
            params.delete('from')
        }

        if (date?.to) {
            params.set('to', date.to.toISOString())
        } else {
            params.delete('to')
        }

        // Only replacing if there's a change to avoid loops, though useEffect dep helps
        // Using replace to avoid clogging history
        router.replace(`${pathname}?${params.toString()}`)
    }, [date, pathname, router, searchParams])


    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
