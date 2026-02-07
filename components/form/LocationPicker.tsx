'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Loader2 } from "lucide-react"
import dynamic from 'next/dynamic'
import { toast } from "sonner"

// Dynamically import Map to avoid SSR issues
const LocationMap = dynamic(() => import('./LocationMap'), {
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>,
    ssr: false
})

interface LocationPickerProps {
    latitude?: number
    longitude?: number
    onChange: (lat: number, lng: number) => void
    label?: string
    error?: string
}

export function LocationPicker({ latitude, longitude, onChange, label = "Item Location", error }: LocationPickerProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [position, setPosition] = useState<[number, number]>([31.7683, 35.2137]) // Default: Jerusalem
    const [hasLocation, setHasLocation] = useState(false)

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude])
            setHasLocation(true)
        }
    }, [latitude, longitude])

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setPosition([lat, lng])
        setHasLocation(true)
        onChange(lat, lng)
    }, [onChange])

    const handleSearchCheck = async () => {
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            // Use Nominatim OpenStreetMap API for geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
            const data = await response.json()

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lon = parseFloat(data[0].lon)
                handleLocationSelect(lat, lon)
                toast.success(`Moved map to: ${data[0].display_name}`)
            } else {
                toast.error("Location not found. Try a different query.")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to search location.")
        } finally {
            setIsSearching(false)
        }
    }

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        setIsSearching(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                handleLocationSelect(position.coords.latitude, position.coords.longitude)
                setIsSearching(false)
                toast.success("Location updated to your current position")
            },
            (error) => {
                console.error(error)
                toast.error("Unable to retrieve your location")
                setIsSearching(false)
            }
        )
    }

    return (
        <div className="space-y-3">
            <Label className={error ? "text-destructive" : ""}>{label}</Label>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search city or place..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchCheck())}
                        className="pl-9"
                    />
                </div>
                <Button type="button" variant="secondary" onClick={handleSearchCheck} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={getCurrentLocation} title="Use my current location">
                    <MapPin className="h-4 w-4" />
                </Button>
            </div>

            <div className={`h-[300px] w-full rounded-md border overflow-hidden ${error ? "border-destructive ring-1 ring-destructive" : ""}`}>
                <LocationMap
                    position={position}
                    onLocationSelect={handleLocationSelect}
                />
            </div>

            {hasLocation ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Selected: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">Click on the map to pin the exact location.</p>
            )}

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    )
}
