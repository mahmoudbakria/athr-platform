'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'

interface LocationMapProps {
    position: [number, number]
    onLocationSelect: (lat: number, lng: number) => void
    readonly?: boolean
}

function LocationMarker({ position, onLocationSelect, readonly }: LocationMapProps) {
    const map = useMapEvents({
        click(e) {
            if (!readonly) {
                onLocationSelect(e.latlng.lat, e.latlng.lng)
                map.flyTo(e.latlng, map.getZoom())
            }
        },
    })

    useEffect(() => {
        map.flyTo(position, map.getZoom())
    }, [position, map])

    return position ? <Marker position={position} /> : null
}

export default function LocationMap({ position, onLocationSelect, readonly = false }: LocationMapProps) {
    // Default to Jerusalem/Center of region if no position provided (though parent handles this)
    const center = position || [31.7683, 35.2137]

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} onLocationSelect={onLocationSelect} readonly={readonly} />
        </MapContainer>
    )
}
