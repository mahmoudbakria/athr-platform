'use client'

import { useState, useMemo } from "react"
import { Item, Category } from "@/types"
import { MyItemCard } from "./MyItemCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LayoutGrid, List, Search, FilterX } from "lucide-react"

interface MyItemsClientProps {
    initialItems: Item[]
    categories: Category[]
    points: number
}

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

export function MyItemsClient({ initialItems, categories, points }: MyItemsClientProps) {
    const [items, setItems] = useState<Item[]>(initialItems)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')

    // Filter States
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [sortBy, setSortBy] = useState<SortOption>('newest')

    // Derived filtered items
    const filteredItems = useMemo(() => {
        let result = [...initialItems]

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(item =>
                (item.title.toLowerCase().includes(lowerQuery) || (item.description && item.description.toLowerCase().includes(lowerQuery)))
            )
        }

        // 2. Category
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(item => item.category_id === selectedCategory)
        }

        // 3. Status
        if (selectedStatus && selectedStatus !== 'all') {
            result = result.filter(item => item.status === selectedStatus)
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
    }, [initialItems, searchQuery, selectedCategory, selectedStatus, sortBy])

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedCategory("all")
        setSelectedStatus("all")
        setSortBy("newest")
    }

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'

    return (
        <div className="space-y-6">
            {/* Data Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-emerald-600">نقاط تأثيرك</p>
                        <h3 className="text-2xl font-bold text-emerald-700 mt-1">{points}</h3>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-card border rounded-lg p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="بحث في الأغراض..."
                            className="pr-9 text-right"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* View Toggle (Desktop) */}
                    <div className="hidden md:flex items-center bg-muted/50 p-1 rounded-md border">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-2 lg:px-3"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4 ml-2" />
                            شبكة
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-2 lg:px-3"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4 ml-2" />
                            قائمة
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center flex-wrap">
                    {/* Category Filter */}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="التصنيف" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع التصنيفات</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="rejected">مرفوض</SelectItem>
                            <SelectItem value="donated">تم التبرع به</SelectItem>
                            {/* Add other statuses if exist in DB enum */}
                        </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="ترتيب حسب" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">الأحدث أولاً</SelectItem>
                            <SelectItem value="oldest">الأقدم أولاً</SelectItem>
                            <SelectItem value="title-asc">العنوان (أ-ي)</SelectItem>
                            <SelectItem value="title-desc">العنوان (ي-أ)</SelectItem>
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="mr-auto sm:mr-0">
                            <FilterX className="h-4 w-4 ml-2" />
                            مسح
                        </Button>
                    )}
                </div>
            </div>

            {/* Results */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <h3 className="text-lg font-medium">لم يتم العثور على أغراض</h3>
                    <p className="text-muted-foreground mt-1">حاول تعديل الفلاتر أو عبارة البحث.</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        مسح الفلاتر
                    </Button>
                </div>
            ) : (
                <div className={
                    viewMode === 'grid'
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        : "flex flex-col gap-4"
                }>
                    {filteredItems.map(item => (
                        <div key={item.id} className={viewMode === 'list' ? "w-full" : "h-full"}>
                            <MyItemCard
                                item={item}
                                layout={viewMode}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
