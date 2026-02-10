"use client"

import { useState } from "react"
import { Share2, Check, Copy, Facebook, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ShareButtonProps {
    title: string
    text?: string
    url: string
    className?: string
    variant?: "default" | "outline" | "ghost" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
}

export function ShareButton({
    title,
    text,
    url,
    className,
    variant = "outline",
    size = "default"
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        // Prepare share data
        const shareData = {
            title,
            text,
            url
        }

        // Try native share first
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData)
                return
            } catch (err) {
                // User cancelled or error, fall back to dropdown/copy
                console.log("Error sharing:", err)
            }
        }

        // Fallback: Copy to clipboard
        handleCopy()
        // Here we could also open a custom modal, but for now we'll rely on the Dropdown if native fail, 
        // or just copy feedback. 
        // Actually, the structure below is: Try Native -> If not, show Dropdown. 
        // But we need to know if native is supported before rendering to decide whether to show a simple button or a dropdown trigger.
        // However, `navigator` is only available on client. Hydration mismatch if we conditionally render based on it.
        // So we will allow the button to attempt native share, and if that fails/isn't supported, we can manually trigger copy or show fallback UI.

        // Since we can't easily detect "native share supported" during SSR, 
        // we'll make the main button try native share, and if it fails (desktop often), 
        // we might want a UI that allows copying.
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("تم نسخ الرابط")
        setTimeout(() => setCopied(false), 2000)
    }

    const shareToSocial = (platform: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp') => {
        let shareUrl = ''
        const encodedUrl = encodeURIComponent(url)
        const encodedText = encodeURIComponent(text || title)

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                break
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
                break
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
                break
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
                break
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400')
        }
    }

    // Advanced Strategy:
    // Render a Dropdown. The trigger is the Share button.
    // If user is on mobile (we can't detect easily), they might prefer Native.
    // Let's offer "Native Share" as the first option in the dropdown if we want to be safe, 
    // OR just have the button do Native Share if possible, and if not, copy?

    // Better UX: Button opens Native Share. 
    // BUT on Desktop, Native Share is often not available or limited.
    // So let's use a Dropdown that has "Copy Link" and Social Links.

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className}>
                    <Share2 className="h-4 w-4 md:mr-2" />
                    {size !== "icon" && <span className="hidden md:inline">مشاركة</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>مشاركة عبر الجهاز</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                    {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                    <span>نسخ الرابط</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToSocial('whatsapp')} className="cursor-pointer">
                    <div className="mr-2 h-4 w-4 bg-green-500 rounded-sm" />
                    <span>واتساب</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToSocial('facebook')} className="cursor-pointer">
                    <Facebook className="mr-2 h-4 w-4" />
                    <span>فيسبوك</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareToSocial('twitter')} className="cursor-pointer">
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>تويتر</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
