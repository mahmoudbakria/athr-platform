'use client'

import { useState } from "react"
import NextImage from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateSiteConfig } from "../cms/actions"
import { supabase } from "@/lib/supabase"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    banner_top_active: z.string().optional(),
    banner_top_image: z.string().optional(),
    banner_top_link: z.string().optional(),
    banner_top_height: z.string().optional(),
    banner_middle_active: z.string().optional(),
    banner_middle_image: z.string().optional(),
    banner_middle_link: z.string().optional(),
    banner_middle_height: z.string().optional(),
    banner_bottom_active: z.string().optional(),
    banner_bottom_image: z.string().optional(),
    banner_bottom_link: z.string().optional(),
    banner_bottom_height: z.string().optional(),
})

interface BannersFormProps {
    initialValues: Record<string, string>
}

export function BannersForm({ initialValues }: BannersFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingBannerTop, setUploadingBannerTop] = useState(false)
    const [uploadingBannerMiddle, setUploadingBannerMiddle] = useState(false)
    const [uploadingBannerBottom, setUploadingBannerBottom] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            banner_top_active: initialValues.banner_top_active || "false",
            banner_top_image: initialValues.banner_top_image || "",
            banner_top_link: initialValues.banner_top_link || "",
            banner_top_height: initialValues.banner_top_height || "250px",
            banner_middle_active: initialValues.banner_middle_active || "false",
            banner_middle_image: initialValues.banner_middle_image || "",
            banner_middle_link: initialValues.banner_middle_link || "",
            banner_middle_height: initialValues.banner_middle_height || "250px",
            banner_bottom_active: initialValues.banner_bottom_active || "false",
            banner_bottom_image: initialValues.banner_bottom_image || "",
            banner_bottom_link: initialValues.banner_bottom_link || "",
            banner_bottom_height: initialValues.banner_bottom_height || "250px",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            const updates = Object.fromEntries(
                Object.entries(values).filter(([_, v]) => v != null)
            ) as Record<string, string>

            const result = await updateSiteConfig(updates)

            if (result.error) {
                toast.error("Failed to update banners", { description: result.error })
            } else {
                toast.success("Banners updated successfully")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpload = async (file: File, field: "banner_top_image" | "banner_middle_image" | "banner_bottom_image") => {
        let setUploading: (v: boolean) => void;
        switch (field) {
            case "banner_top_image": setUploading = setUploadingBannerTop; break;
            case "banner_middle_image": setUploading = setUploadingBannerMiddle; break;
            case "banner_bottom_image": setUploading = setUploadingBannerBottom; break;
            default: setUploading = () => { };
        }

        try {
            setUploading(true)

            // Compression options
            const options = {
                maxSizeMB: 0.8, // Max 800KB
                maxWidthOrHeight: 1280, // Reasonable max dimension
                useWebWorker: true,
                initialQuality: 0.7
            }

            let compressedFile = file
            try {
                // Dynamically import to avoid server-side issues (though this is a client component)
                const imageCompression = (await import('browser-image-compression')).default
                compressedFile = await imageCompression(file, options)
            } catch (err) {
                console.error("Compression failed, uploading original:", err)
            }

            const fileExt = compressedFile.name.split('.').pop()
            const fileName = `${field}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('cms-assets')
                .upload(fileName, compressedFile)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('cms-assets')
                .getPublicUrl(fileName)

            form.setValue(field, publicUrl, { shouldDirty: true })
            toast.success("Image uploaded successfully")
        } catch (error: any) {
            toast.error("Upload failed", { description: error.message })
        } finally {
            setUploading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Homepage Banners</CardTitle>
                        <CardDescription>Manage promotional or motivational banners on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {/* TOP BANNER */}
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    Top Banner <span className="text-xs font-normal text-muted-foreground">(After Categories)</span>
                                </h4>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="banner_top_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Enable Banner</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="banner_top_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Link (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="/listings?cat=1 or https://..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_top_height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Height (CSS)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="250px" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_top_image"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Image</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-4 items-center">
                                                            {field.value && (
                                                                <div className="relative w-24 h-16 shrink-0">
                                                                    <NextImage
                                                                        src={field.value}
                                                                        alt="Banner Preview"
                                                                        fill
                                                                        className="object-cover rounded border"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0]
                                                                        if (file) handleUpload(file, "banner_top_image")
                                                                    }}
                                                                    disabled={uploadingBannerTop}
                                                                />
                                                                {uploadingBannerTop && <span className="text-xs text-muted-foreground">Uploading...</span>}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* MIDDLE BANNER */}
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    Middle Banner <span className="text-xs font-normal text-muted-foreground">(After Latest Items)</span>
                                </h4>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="banner_middle_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Enable Banner</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="banner_middle_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Link (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="/listings?cat=1 or https://..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_middle_height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Height (CSS)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="250px" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_middle_image"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Image</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-4 items-center">
                                                            {field.value && (
                                                                <div className="relative w-24 h-16 shrink-0">
                                                                    <NextImage
                                                                        src={field.value}
                                                                        alt="Banner Preview"
                                                                        fill
                                                                        className="object-cover rounded border"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0]
                                                                        if (file) handleUpload(file, "banner_middle_image")
                                                                    }}
                                                                    disabled={uploadingBannerMiddle}
                                                                />
                                                                {uploadingBannerMiddle && <span className="text-xs text-muted-foreground">Uploading...</span>}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* BOTTOM BANNER */}
                            <div className="p-4 border rounded-lg bg-slate-50">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    Bottom Banner <span className="text-xs font-normal text-muted-foreground">(Before Footer)</span>
                                </h4>
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="banner_bottom_active"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value === "true"}
                                                        onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                                    />
                                                </FormControl>
                                                <FormLabel className="!mt-0">Enable Banner</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="banner_bottom_link"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Link (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="/listings?cat=1 or https://..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_bottom_height"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Height (CSS)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="250px" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="banner_bottom_image"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Banner Image</FormLabel>
                                                    <FormControl>
                                                        <div className="flex gap-4 items-center">
                                                            {field.value && (
                                                                <div className="relative w-24 h-16 shrink-0">
                                                                    <NextImage
                                                                        src={field.value}
                                                                        alt="Banner Preview"
                                                                        fill
                                                                        className="object-cover rounded border"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1">
                                                                <Input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0]
                                                                        if (file) handleUpload(file, "banner_bottom_image")
                                                                    }}
                                                                    disabled={uploadingBannerBottom}
                                                                />
                                                                {uploadingBannerBottom && <span className="text-xs text-muted-foreground">Uploading...</span>}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Banners"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
