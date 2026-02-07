"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase"
import Link from "next/link"
import NextImage from "next/image"
import { cn } from "@/lib/utils"

// Type for search results
interface SearchResult {
    id: string
    title: string
    city: string | null
    images: string[] | null
    category_id: string
}

export function SearchBar({ className }: { className?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = React.useState(searchParams.get("search") || "")
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [isOpen, setIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Debounce logic
    const [debouncedQuery, setDebouncedQuery] = React.useState(query)

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [query])

    // Fetch results when debounced query changes
    React.useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults([])
                setIsOpen(false)
                return
            }

            setIsLoading(true)
            const supabase = createClient()

            // Search items strictly by title for predictive text
            const { data, error } = await supabase
                .from('items')
                .select('id, title, city, images, category_id')
                .eq('status', 'active')
                .ilike('title', `%${debouncedQuery}%`)
                .limit(5)

            if (!error && data) {
                setResults(data)
                setIsOpen(true)
            }
            setIsLoading(false)
        }

        fetchResults()
    }, [debouncedQuery])

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            setIsOpen(false)
            router.push(`/listings?search=${encodeURIComponent(query)}`)
        }
    }

    const clearSearch = () => {
        setQuery("")
        setResults([])
        setIsOpen(false)
    }

    return (
        <div ref={containerRef} className={cn("relative w-full max-w-xl mx-auto", className)}>
            <form onSubmit={handleSearch} className="relative">
                <Input
                    type="text"
                    placeholder="ابحث عن الأغراض..."
                    className="w-full pl-4 pr-10 bg-slate-100 border-transparent rounded-full h-10 focus:bg-white focus:border-emerald-500 focus-visible:ring-emerald-500 transition-all shadow-inner text-right"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (!e.target.value.trim()) setIsOpen(false)
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true)
                    }}
                />
                <div className="absolute right-0 top-0 h-full flex items-center pr-2 gap-1">
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full"
                            onClick={clearSearch}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-emerald-600 rounded-full"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>

            {/* Predictive Dropdown */}
            {isOpen && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="max-h-[300px] overflow-y-auto py-1">
                        {results.length > 0 ? (
                            <>
                                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                                    المقترحات
                                </div>
                                {results.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/items/${item.id}`}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 transition-colors group"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="h-10 w-10 shrink-0 rounded-md bg-slate-100 overflow-hidden border border-slate-200 relative">
                                            {item.images && item.images.length > 0 ? (
                                                <NextImage
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                    <Search className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 truncate">
                                                {item.title}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                {item.city || 'متاح'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            // Only show "No results" if the query is long enough to have expected results, otherwise quiet?
                            // Actually, if we searched and got nothing, show it.
                            !isLoading && debouncedQuery.length > 1 && (
                                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                    لم يتم العثور على نتائج مباشرة. اضغط Enter لعرض جميع النتائج.
                                </div>
                            )
                        )}

                        {/* Always show "Search for ..." option at bottom */}
                        {debouncedQuery.trim() && (
                            <div className="border-t border-slate-100 mt-1">
                                <button
                                    className="w-full text-right px-3 py-2.5 text-sm text-emerald-600 font-medium hover:bg-emerald-50 flex items-center gap-2 transition-colors flex-row-reverse"
                                    onClick={(e) => handleSearch(e as any)}
                                >
                                    <Search className="h-4 w-4" />
                                    البحث عن "{debouncedQuery}"
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
