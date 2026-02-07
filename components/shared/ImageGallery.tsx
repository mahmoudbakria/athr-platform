'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageGalleryProps {
    images: string[] | null
    className?: string
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
    // 1. Sanitize/Fallback for images
    const validImages = images && images.length > 0
        ? images
        : []

    // 2. State for active image
    const [selectedImage, setSelectedImage] = useState<string | null>(
        validImages.length > 0 ? validImages[0] : null
    )

    // If no images at all, show fallback
    if (validImages.length === 0) {
        return (
            <div className={cn("w-full aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200", className)}>
                <div className="flex flex-col items-center text-slate-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <span className="text-sm">No images available</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            {/* Main View */}
            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center">
                {selectedImage && (
                    <Image
                        src={selectedImage}
                        alt="Main view"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain"
                    />
                )}
            </div>

            {/* Thumbnail Strip (Only if > 1 image) */}
            {validImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={cn(
                                "flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                                selectedImage === img
                                    ? "border-blue-600 ring-2 ring-blue-600/20"
                                    : "border-transparent hover:border-slate-300"
                            )}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx}`}
                                fill
                                sizes="100px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
