'use client'

import Image from 'next/image'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Item } from '@/types'
import { MapPin, Edit, Trash2, Eye, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { markItemAsDonated } from '@/app/items/actions'
import { cn } from "@/lib/utils"

interface MyItemCardProps {
    item: Item
    layout?: 'grid' | 'list'
}

export function MyItemCard({ item, layout = 'grid' }: MyItemCardProps) {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [isMarking, setIsMarking] = useState(false)

    // Use first image or a placeholder
    const imageUrl = item.images && item.images.length > 0
        ? item.images[0]
        : 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image'

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const supabase = createClient()
            // Soft delete: update status to 'deleted'
            const { error } = await supabase
                .from('items')
                .update({ status: 'deleted' })
                .eq('id', item.id)

            if (error) throw error

            toast.success('Item moved to trash')
            router.refresh()
        } catch (error: any) {
            toast.error('Failed to delete item: ' + error.message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleMarkDonated = async () => {
        setIsMarking(true)
        try {
            await markItemAsDonated(item.id)
            toast.success('Item marked as donated!')
        } catch (error: any) {
            toast.error('Failed to update status: ' + error.message)
        } finally {
            setIsMarking(false)
        }
    }

    if (layout === 'list') {
        return (
            <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-xl bg-card flex flex-col md:flex-row h-auto group bg-muted/20 p-0 gap-0">
                {/* Image Section - Smaller for List */}
                <div className="relative aspect-video md:aspect-square md:w-48 md:h-full shrink-0 overflow-hidden bg-muted">
                    <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 md:left-2 md:right-auto">
                        <Badge variant={item.status === 'active' ? "default" : item.status === 'rejected' ? "destructive" : "secondary"} className="shadow-sm">
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                    </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-4 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{item.city}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto md:mt-0 shrink-0">
                        <Button variant="outline" size="sm" className="h-9" asChild>
                            <Link href={`/items/${item.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                            </Link>
                        </Button>
                        <Button variant="secondary" size="sm" className="h-9" asChild>
                            <Link href={`/items/${item.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Link>
                        </Button>

                        {(item.status === 'active' || item.status === 'pending' || item.status === 'donated') && (
                            <Button
                                variant="default"
                                size="sm"
                                className={cn(
                                    "h-9 text-white",
                                    item.status === 'donated'
                                        ? "bg-muted-foreground/50 hover:bg-muted-foreground/50 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700"
                                )}
                                onClick={handleMarkDonated}
                                disabled={isMarking || item.status === 'donated'}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isMarking ? "Updating..." : item.status === 'donated' ? "Donated" : "Mark Donated"}
                            </Button>
                        )}

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="h-9 w-9">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This item will be moved to the trash. You can contact support to restore it if needed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card >
        )
    }

    // Grid Layout (Default)
    return (
        <Card className="h-full overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-xl bg-card flex flex-col group p-0 gap-0">
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2">
                    <Badge variant={item.status === 'active' ? "default" : item.status === 'rejected' ? "destructive" : "secondary"} className="shadow-sm">
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{item.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{item.city}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>

                <div className="mt-auto flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                        <Link href={`/items/${item.id}`}>
                            <Eye className="h-3 w-3 mr-1.5" />
                            View
                        </Link>
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1 h-8 text-xs" asChild>
                        <Link href={`/items/${item.id}/edit`}>
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                        </Link>
                    </Button>

                    {(item.status === 'active' || item.status === 'pending' || item.status === 'donated') && (
                        <Button
                            variant="default"
                            size="sm"
                            className={cn(
                                "flex-1 h-8 text-xs text-white",
                                item.status === 'donated'
                                    ? "bg-muted-foreground/50 hover:bg-muted-foreground/50 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                            )}
                            onClick={handleMarkDonated}
                            disabled={isMarking || item.status === 'donated'}
                        >
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            {isMarking ? "Updating..." : item.status === 'donated' ? "Donated" : "Mark Donated"}
                        </Button>
                    )}

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-8 w-8">
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your item.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}
