'use client'

import dynamic from 'next/dynamic'
import NextImage from 'next/image'

const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">Loading Map...</div>
})

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminUpdateItem } from '../../actions'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EditItemFormProps {
    item: any
    categories: any[]
    subCategories: any[]
}

export function EditItemForm({ item, categories, subCategories }: EditItemFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(item.category_id || '')
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
        item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : null
    )

    // Initialize with existing gallery or fallback to single image
    const [currentImages, setCurrentImages] = useState<string[]>(
        item.images && item.images.length > 0
            ? item.images
            : (item.image_url ? [item.image_url] : [])
    )
    const [newFiles, setNewFiles] = useState<File[]>([])

    // Import supabase client for storage upload
    // Note: We need a client-side supabase instance here
    const { createClient } = require('@/lib/supabase')
    const supabase = createClient()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFiles(Array.from(e.target.files))
        }
    }

    const removeExistingImage = (imageToRemove: string) => {
        setCurrentImages(prev => prev.filter(img => img !== imageToRemove))
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            // 1. Upload new files
            const uploadedUrls: string[] = []
            if (newFiles.length > 0) {
                const uploadPromises = newFiles.map(async (file) => {
                    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
                    const { data, error } = await supabase.storage
                        .from('item-images')
                        .upload(fileName, file)

                    if (error) throw error

                    const { data: publicData } = supabase.storage.from('item-images').getPublicUrl(fileName)
                    return publicData.publicUrl
                })

                const results = await Promise.all(uploadPromises)
                uploadedUrls.push(...results)
            }

            // 2. Combine with existing images
            const finalImages = [...currentImages, ...uploadedUrls]

            // 3. Append to FormData
            formData.set('images', JSON.stringify(finalImages))

            const res = await adminUpdateItem(item.id, formData)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success('Item updated successfully')
                // Reset new files
                setNewFiles([])
                // Redirect logic
                router.push('/admin/items')
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={item.title} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select name="category_id" defaultValue={item.category_id || ''} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sub_category_id">Sub Category</Label>
                    <Select name="sub_category_id" defaultValue={item.sub_category_id?.toString() || ''} disabled={!selectedCategoryId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                            {subCategories
                                .filter(sub => sub.category_id === selectedCategoryId)
                                .map((sub) => (
                                    <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select name="condition" defaultValue={item.condition || 'new'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="like_new">Like New</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-wrap gap-6 border p-4 rounded-md bg-slate-50">
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="delivery_available"
                        name="delivery_available"
                        defaultChecked={item.delivery_available}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="delivery_available" className="cursor-pointer">Delivery Available</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_urgent"
                        name="is_urgent"
                        defaultChecked={item.is_urgent}
                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <Label htmlFor="is_urgent" className="cursor-pointer text-red-600 font-medium">Mark as Urgent</Label>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={item.description} required rows={5} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" defaultValue={item.city} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input id="contact_phone" name="contact_phone" defaultValue={item.contact_phone} placeholder="+971..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" defaultValue={item.tags?.join(', ')} placeholder="electronics, urgent, used" />
            </div>

            {/* Location Map */}
            <div className="space-y-2 border rounded-lg p-4 bg-slate-50">
                <Label>Location</Label>
                <div className="h-[300px] w-full mt-2">
                    <LocationPicker
                        initialLocation={item.latitude && item.longitude ? { lat: item.latitude, lng: item.longitude } : undefined}
                        onLocationSelect={(loc) => {
                            setLocation({ lat: loc.lat, lng: loc.lng })
                        }}
                    />
                </div>
                <input type="hidden" name="latitude" value={location?.lat || ''} />
                <input type="hidden" name="longitude" value={location?.lng || ''} />
                <p className="text-xs text-muted-foreground">Click on the map to update the item's location.</p>
            </div>

            {/* Gallery Management */}
            <div className="space-y-3 border rounded-lg p-4 bg-slate-50">
                <Label className="text-base font-semibold">Image Gallery</Label>

                {/* Existing Images */}
                {currentImages.length > 0 && (
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Current Images</Label>
                        <div className="flex gap-2 flex-wrap">
                            {currentImages.map((img, idx) => (
                                <div key={idx} className="relative group w-24 h-24 border rounded-md overflow-hidden bg-white">
                                    <NextImage
                                        src={img}
                                        alt="Item"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img)}
                                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove Image"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Uploads */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Add New Images</Label>
                    <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer bg-white"
                    />
                    {newFiles.length > 0 && (
                        <div className="text-xs text-slate-500">
                            {newFiles.length} file(s) selected to upload.
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 flex gap-2">
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="secondary" asChild>
                    <Link href={`/admin/items/${item.id}`}>Cancel</Link>
                </Button>
            </div>
        </form >
    )
}
