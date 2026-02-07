'use client'

import Image from 'next/image'

import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Item } from '@/types'
import { MapPin, Hammer, Navigation, Tag } from 'lucide-react'
import { useUserLocation } from '@/hooks/useUserLocation'
import { calculateDistance, CITY_COORDS } from '@/lib/locationUtils'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


interface ItemCardProps {
    item: Item
    showRepairBadge?: boolean
}

export function ItemCard({ item, showRepairBadge = false }: ItemCardProps) {
    const { userCoords, loading: locationLoading } = useUserLocation()
    const [distance, setDistance] = useState<number | null>(null)

    // Use first image or a placeholder
    const imageUrl = item.images && item.images.length > 0
        ? item.images[0]
        : 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'

    useEffect(() => {
        if (userCoords) {
            let itemLat = item.latitude
            let itemLng = item.longitude

            // Fallback to City Map if exact coords missing
            if ((!itemLat || !itemLng) && item.city) {
                const cityKey = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === (item.city || '').toLowerCase())
                const cityNav = cityKey ? CITY_COORDS[cityKey] : null

                if (cityNav) {
                    itemLat = cityNav.lat
                    itemLng = cityNav.lng
                }
            }

            if (itemLat && itemLng) {
                const dist = calculateDistance(userCoords.lat, userCoords.lng, itemLat, itemLng)
                setDistance(dist)
            }
        }
    }, [userCoords, item.latitude, item.longitude, item.city])

    // Determine Badge Color
    const getDistanceBadgeVariant = (dist: number) => {
        if (dist < 10) return "bg-green-100 text-green-800 border-green-200"
        if (dist < 30) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

    return (
        <article className="block h-full group" dir="rtl">
            <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl bg-card relative p-0 gap-0">
                <Link href={`/items/${item.id}`} className="absolute inset-0 z-10" aria-label={`View ${item.title}`} />
                {/* Image Section */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Distance Badge (Top Right for RTL) */}
                    <div className="absolute top-3 right-3 z-10">
                        {locationLoading ? (
                            <Skeleton className="h-5 w-16 rounded-full bg-white/50 backdrop-blur-md" />
                        ) : distance !== null ? (
                            <Badge variant="secondary" className={`gap-1 sm:gap-1.5 shadow-sm backdrop-blur-md text-[10px] sm:text-sm px-1.5 sm:px-3 py-0.5 sm:py-1 font-bold ${getDistanceBadgeVariant(distance)}`}>
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" /> {distance} km
                            </Badge>
                        ) : null}
                    </div>

                    {/* Left Side Badges (Condition & Repair) */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-end">
                        {/* Condition Badge */}
                        {item.condition && (
                            <Badge variant="secondary" className="gap-1 shadow-sm backdrop-blur-md text-[10px] sm:text-sm px-1.5 sm:px-3 py-0.5 sm:py-1 font-bold bg-white/90 text-slate-700">
                                {item.condition === 'new' && 'جديد'}
                                {item.condition === 'like_new' && 'شبه جديد'}
                                {item.condition === 'used' && 'مستعمل'}
                            </Badge>
                        )}

                        {/* Repair Badge */}
                        {showRepairBadge && item.needs_repair && (
                            <Badge variant="destructive" className="gap-1 shadow-sm text-[10px] px-2 py-0.5 font-medium">
                                <Hammer className="h-3 w-3" /> يحتاج إصلاح
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-2 pb-1.5 flex flex-col text-right">
                    {/* Category & SubCategory */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2 line-clamp-1">
                        <Tag className="h-3 w-3 shrink-0" />
                        {item.categories ? (
                            <div className="flex items-center gap-1 relative z-20">
                                <Link
                                    href={`/listings?category=${item.categories.slug}`}
                                    className="hover:text-primary hover:underline transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {item.categories.name}
                                </Link>
                                {item.sub_categories?.name && (
                                    <>
                                        <span>/</span>
                                        <span>{item.sub_categories.name}</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <span>بدون تصنيف</span>
                        )}
                    </div>

                    {/* Title & Price/Status Row */}
                    <div className="flex justify-between items-start gap-1.5 relative z-20">
                        <Link href={`/items/${item.id}`} className="font-bold text-[15px] leading-normal text-foreground line-clamp-1 group-hover:text-primary transition-colors pb-1">
                            {item.title}
                        </Link>
                    </div>

                    {/* Description */}
                    {item.description && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-[1.35] mt-1 mb-4">
                            {item.description}
                        </p>
                    )}

                    {/* Meta Info: Location & Status */}
                    <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground font-medium">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                            <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.city || 'غير محدد'}</span>
                        </div>

                        <Badge variant="outline" className="text-[10px] sm:text-sm px-1.5 sm:px-2 py-0 sm:py-0.5 font-medium bg-green-50 text-green-700 border-green-200 h-6 sm:h-7">
                            {item.status === 'active' ? 'متاح' : item.status}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </article>
    )
}
