'use client'
import * as React from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export function ImageGallery({ images }: { images: string[] | null }) {
    const imageList = images && images.length > 0
        ? images
        : ['https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image']

    return (
        <Carousel className="w-full mx-auto relative group">
            <CarouselContent>
                {imageList.map((src, index) => (
                    <CarouselItem key={index}>
                        <div className="p-1">
                            <Card className="border-none shadow-none bg-transparent">
                                <CardContent className="flex aspect-[4/3] items-center justify-center p-0 relative overflow-hidden rounded-xl bg-muted">
                                    <Image
                                        src={src}
                                        alt={`Item image ${index + 1}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-contain"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {imageList.length > 1 && (
                <>
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <CarouselPrevious className="relative left-0 translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <CarouselNext className="relative right-0 translate-y-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </>
            )}
        </Carousel>
    )
}
