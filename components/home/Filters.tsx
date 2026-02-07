'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Category } from '@/types'
import { useState } from 'react'

interface FiltersProps {
    categories: Category[]
}

export function Filters({ categories }: FiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [city, setCity] = useState(searchParams.get('city') || '')
    const [category, setCategory] = useState(searchParams.get('category') || 'all')

    const applyFilters = () => {
        const params = new URLSearchParams()
        if (city) params.set('city', city)
        if (category && category !== 'all') params.set('category', category)
        router.push(`/?${params.toString()}`)
    }

    const resetFilters = () => {
        setCity('')
        setCategory('all')
        router.push('/')
    }

    return (
        <Card className="h-fit sticky top-24 border-none shadow-none md:shadow-sm md:border bg-transparent md:bg-card">
            <CardHeader className="px-0 md:px-6">
                <h2 className="font-semibold text-lg hidden md:block">Filters</h2>
            </CardHeader>
            <CardContent className="space-y-4 px-0 md:px-6">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                        placeholder="Enter city..."
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="bg-background"
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={applyFilters} className="flex-1">
                        Apply
                    </Button>
                    {(city || category !== 'all') && (
                        <Button variant="outline" onClick={resetFilters}>
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
