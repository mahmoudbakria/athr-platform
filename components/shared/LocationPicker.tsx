'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet/dist/leaflet.css'
import 'leaflet-geosearch/dist/geosearch.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { Button } from '@/components/ui/button'
import { Locate } from 'lucide-react'

// Fix for default marker icon in Next.js
import L from 'leaflet'

interface LocationPickerProps {
    onLocationSelect?: (location: { lat: number; lng: number }) => void
    initialLocation?: { lat: number; lng: number }
    readOnly?: boolean
}

function LocationMarker({ position, setPosition, onSelect, readOnly }: any) {
    const map = useMapEvents({
        click(e) {
            if (readOnly) return
            setPosition(e.latlng)
            onSelect?.({ lat: e.latlng.lat, lng: e.latlng.lng })
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    return position === null ? null : (
        <Marker position={position} draggable={!readOnly} eventHandlers={{
            dragend: (e) => {
                if (readOnly) return
                const marker = e.target
                const position = marker.getLatLng()
                setPosition(position)
                onSelect?.({ lat: position.lat, lng: position.lng })
            }
        }} />
    )
}

function SearchField({ provider }: { provider: any }) {
    const map = useMap();

    useEffect(() => {
        const searchControl = new (GeoSearchControl as any)({
            provider,
            style: 'bar',
            showMarker: true,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Enter address or city',
        });

        map.addControl(searchControl);
        return () => map.removeControl(searchControl) as any;
    }, [map, provider]);

    return null;
}

export default function LocationPicker({ onLocationSelect, initialLocation, readOnly = false }: LocationPickerProps) {
    const defaultCenter = { lat: 30.0444, lng: 31.2357 } // Cairo Default
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialLocation || null)

    const center = useMemo(() => initialLocation || defaultCenter, [initialLocation])

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    const newPos = { lat: latitude, lng: longitude }
                    setPosition(newPos)
                    onLocationSelect?.(newPos)
                },
                (err) => {
                    console.error("Geolocation error:", err)
                    alert("Could not access your location.")
                }
            )
        }
    }

    // Custom component to handle map flyTo when locate me is clicked (external to map container)
    const MapUpdater = ({ center }: { center: { lat: number, lng: number } | null }) => {
        const map = useMap()
        useEffect(() => {
            if (center) {
                map.flyTo(center, 13)
            }
        }, [center, map])
        return null
    }

    return (
        <div className="space-y-2">
            {!readOnly && (
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Pin Location on Map</label>
                    <Button variant="outline" size="sm" type="button" onClick={handleLocateMe} className="gap-2">
                        <Locate className="w-4 h-4" /> Locate Me
                    </Button>
                </div>
            )}
            <div className={`w-full rounded-md overflow-hidden border z-0 relative ${readOnly ? 'h-[200px]' : 'h-[300px]'}`}>
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={!readOnly}
                    dragging={!readOnly}
                    doubleClickZoom={!readOnly}
                    touchZoom={!readOnly}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {!readOnly && <SearchField provider={new OpenStreetMapProvider()} />}
                    <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationSelect} readOnly={readOnly} />
                    <MapUpdater center={position} />
                </MapContainer>
            </div>
            {!readOnly && (
                <p className="text-xs text-muted-foreground">
                    Click on the map or drag the marker to adjust location.
                </p>
            )}
        </div>
    )
}
