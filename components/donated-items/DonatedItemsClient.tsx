'use client'

import { useState, useMemo } from "react"
import { Item, Category } from "@/types"
import { ItemCard } from "@/components/items/ItemCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search, FilterX, MapPin, Calendar } from "lucide-react"

interface DonatedItemsClientProps {
    initialItems: Item[]
    categories: Category[]
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

export function DonatedItemsClient({ initialItems, categories }: DonatedItemsClientProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedCity, setSelectedCity] = useState<string>("all")
    const [sortBy, setSortBy] = useState<SortOption>('newest')

    // Get unique cities from items
    const cities = useMemo(() => {
        const uniqueCities = Array.from(new Set(initialItems.map(item => item.city).filter(Boolean)))
        return uniqueCities.sort()
    }, [initialItems])

    // Derived filtered items
    const filteredItems = useMemo(() => {
        let result = [...initialItems]

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerQuery) ||
                (item.description && item.description.toLowerCase().includes(lowerQuery))
            )
        }

        // 2. Category
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(item => item.category_id === selectedCategory)
        }

        // 3. City
        if (selectedCity && selectedCity !== 'all') {
            result = result.filter(item => item.city === selectedCity)
        }

        // 4. Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                case 'title-asc':
                    return a.title.localeCompare(b.title)
                case 'title-desc':
                    return b.title.localeCompare(a.title)
                default:
                    return 0
            }
        })

        return result
    }, [initialItems, searchQuery, selectedCategory, selectedCity, sortBy])

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCategory("all")
        setSelectedCity("all")
        setSortBy("newest")
    }

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedCity !== 'all'

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Donated Items Gallery</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Browse items that have found new homes. A testament to our community's generosity.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-card border rounded-xl p-4 md:p-6 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search donated items..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
                    {/* Category Filter */}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* City Filter */}
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="City" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map((city: any) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Sort By" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto sm:ml-0 text-muted-foreground hover:text-foreground">
                            <FilterX className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Results */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed flex flex-col items-center justify-center">
                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium">No items found</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        We couldn't find any donated items matching your current filters.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={clearFilters}>
                        Clear All Filters
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <div key={item.id} className="h-full">
                            <ItemCard
                                item={item}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
