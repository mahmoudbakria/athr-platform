import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BannerProps {
    image: string
    link?: string
    alt?: string
    className?: string
    height?: string
}

export function Banner({ image, link, alt = "Promotional Banner", className, height = "250px" }: BannerProps) {
    if (!image) return null

    const content = (
        <div className={cn("container mx-auto px-4 py-8", className)}>
            <div
                className="relative w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                style={{ height: height }}
            >
                <Image
                    src={image}
                    alt={alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    priority={false}
                />
            </div>
        </div>
    )

    if (link) {
        return (
            <Link href={link} className="block w-full">
                {content}
            </Link>
        )
    }

    return content
}
