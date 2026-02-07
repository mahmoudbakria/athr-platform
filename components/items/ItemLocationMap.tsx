

'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Dynamic import for Map to prevent SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>
})

interface ItemLocationMapProps {
    latitude: number
    longitude: number
}

export function ItemLocationMap({ latitude, longitude }: ItemLocationMapProps) {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`

    return (
        <div>
            <div className="rounded-lg overflow-hidden border shadow-sm">
                <LocationPicker
                    readOnly={true}
                    initialLocation={{ lat: latitude, lng: longitude }}
                />
            </div>
            <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                        Open in Google Maps
                    </a>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
                        Open in Waze
                    </a>
                </Button>
            </div>
        </div>
    )
}
