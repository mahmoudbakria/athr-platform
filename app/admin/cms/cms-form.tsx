'use client'

import Image from "next/image"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateSiteConfig } from "./actions"
import { supabase } from "@/lib/supabase"
// import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    theme_primary_color: z.string().optional(),
    hero_title: z.string().optional(),
    hero_description: z.string().optional(),
    hero_overlay: z.string().optional(),
    hero_image: z.string().optional(),
    site_logo: z.string().optional(),
    footer_description: z.string().optional(),
    footer_copyright: z.string().optional(),
    social_facebook: z.string().optional(),
    social_facebook_active: z.string().optional(),
    social_twitter: z.string().optional(),
    social_twitter_active: z.string().optional(),
    social_instagram: z.string().optional(),
    social_instagram_active: z.string().optional(),
    footer_col1_title: z.string().optional(),
    footer_col1_links: z.string().optional(),
    footer_col2_title: z.string().optional(),
    footer_col2_links: z.string().optional(),
    banner_top_active: z.string().optional(),
    banner_top_image: z.string().optional(),
    banner_top_link: z.string().optional(),
    banner_middle_active: z.string().optional(),
    banner_middle_image: z.string().optional(),
    banner_middle_link: z.string().optional(),
    banner_bottom_active: z.string().optional(),
    banner_bottom_image: z.string().optional(),
    banner_bottom_link: z.string().optional(),
    footer_logo: z.string().optional(),
})

interface CMSFormProps {
    initialValues: Record<string, string>
}

export function CMSForm({ initialValues }: CMSFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false)
    const [uploadingHero, setUploadingHero] = useState(false)
    // Banner loading states
    const [uploadingBannerTop, setUploadingBannerTop] = useState(false)
    const [uploadingBannerMiddle, setUploadingBannerMiddle] = useState(false)
    const [uploadingBannerBottom, setUploadingBannerBottom] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            theme_primary_color: initialValues.theme_primary_color || "oklch(0.6 0.15 180)",
            hero_title: initialValues.hero_title || "",
            hero_description: initialValues.hero_description || "",
            hero_overlay: initialValues.hero_overlay || "true",
            hero_image: initialValues.hero_image || "",
            site_logo: initialValues.site_logo || "",
            footer_description: initialValues.footer_description || "",
            footer_copyright: initialValues.footer_copyright || "",
            social_facebook: initialValues.social_facebook || "",
            social_facebook_active: initialValues.social_facebook_active || "true",
            social_twitter: initialValues.social_twitter || "",
            social_twitter_active: initialValues.social_twitter_active || "true",
            social_instagram: initialValues.social_instagram || "",
            social_instagram_active: initialValues.social_instagram_active || "true",
            footer_col1_title: initialValues.footer_col1_title || "Platform",
            footer_col1_links: initialValues.footer_col1_links || "About Us|/about\nHow it Works|/how-it-works\nOur Impact|/impact\nContact|/contact",
            footer_col2_title: initialValues.footer_col2_title || "Legal",
            footer_col2_links: initialValues.footer_col2_links || "Privacy Policy|/privacy\nTerms of Service|/terms\nCookie Policy|/cookies",
            banner_top_active: initialValues.banner_top_active || "false",
            banner_top_image: initialValues.banner_top_image || "",
            banner_top_link: initialValues.banner_top_link || "",
            banner_middle_active: initialValues.banner_middle_active || "false",
            banner_middle_image: initialValues.banner_middle_image || "",
            banner_middle_link: initialValues.banner_middle_link || "",
            banner_bottom_active: initialValues.banner_bottom_active || "false",
            banner_bottom_image: initialValues.banner_bottom_image || "",
            banner_bottom_link: initialValues.banner_bottom_link || "",
            footer_logo: initialValues.footer_logo || "",
        }, // End of defaults
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        try {
            // Filter out undefined/null values
            const updates = Object.fromEntries(
                Object.entries(values).filter(([_, v]) => v != null)
            ) as Record<string, string>

            const result = await updateSiteConfig(updates)

            if (result.error) {
                toast.error("Failed to update settings", { description: result.error })
            } else {
                toast.success("Settings updated successfully")
            }
        } catch (error) {
            toast.error("An error occurred")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpload = async (file: File, field: "site_logo" | "hero_image" | "banner_top_image" | "banner_middle_image" | "banner_bottom_image" | "footer_logo") => {
        let setUploading: (v: boolean) => void;
        switch (field) {
            case "site_logo": setUploading = setUploadingLogo; break;
            case "footer_logo": setUploading = setUploadingFooterLogo; break;
            case "hero_image": setUploading = setUploadingHero; break;
            case "banner_top_image": setUploading = setUploadingBannerTop; break;
            case "banner_middle_image": setUploading = setUploadingBannerMiddle; break;
            case "banner_bottom_image": setUploading = setUploadingBannerBottom; break;
            default: setUploading = () => { };
        }

        try {
            setUploading(true)

            // Compression options
            const options = {
                maxSizeMB: field === 'site_logo' ? 0.2 : 0.8, // Smaller for logo
                maxWidthOrHeight: field === 'site_logo' ? 400 : 1600,
                useWebWorker: true,
                initialQuality: 0.7
            }

            let compressedFile = file
            try {
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

                {/* THEME SETTINGS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Settings</CardTitle>
                        <CardDescription>Customize the primary color of the website.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="theme_primary_color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Primary Color (CSS Value)</FormLabel>
                                    <div className="flex gap-4 items-center">
                                        <div
                                            className="w-10 h-10 rounded-full border shadow-sm shrink-0"
                                            style={{ background: field.value }}
                                        />
                                        <FormControl>
                                            <Input {...field} placeholder="oklch(0.6 0.15 180) or #10b981" />
                                        </FormControl>
                                    </div>
                                    <FormDescription>
                                        Valid CSS color value. Default is <code>oklch(0.6 0.15 180)</code>.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* HERO SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Section</CardTitle>
                        <CardDescription>Customize the main homepage banner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="hero_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>Supports HTML (e.g. &lt;br /&gt;)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hero_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hero_overlay"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2 border p-3 rounded-md">
                                    <FormControl>
                                        <Switch
                                            checked={field.value !== "false"}
                                            onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                                        />
                                    </FormControl>
                                    <div className="space-y-0.5">
                                        <FormLabel className="!mt-0">Enable Dark Overlay</FormLabel>
                                        <FormDescription>
                                            Darkens the background image to make text more readable.
                                        </FormDescription>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="hero_image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hero Background Image</FormLabel>
                                    <div className="flex flex-col gap-4">
                                        {field.value && (
                                            <div className="relative h-40 w-full overflow-hidden rounded-md border">
                                                <Image
                                                    src={field.value}
                                                    alt="Hero Preview"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                {...field}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <div className="relative">
                                                <Button type="button" variant="outline" size="sm" disabled={uploadingHero}>
                                                    {uploadingHero ? "Uploading..." : "Upload"}
                                                </Button>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleUpload(file, "hero_image")
                                                    }}
                                                    disabled={uploadingHero}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* BRANDING SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding</CardTitle>
                        <CardDescription>Manage site logo and general appearance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="site_logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Logo</FormLabel>
                                    <div className="flex flex-col gap-4">
                                        {field.value && (
                                            <div className="relative h-20 w-20 overflow-hidden rounded-md border p-2 bg-slate-100">
                                                <Image
                                                    src={field.value}
                                                    alt="Logo Preview"
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                {...field}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <div className="relative">
                                                <Button type="button" variant="outline" size="sm" disabled={uploadingLogo}>
                                                    {uploadingLogo ? "Uploading..." : "Upload"}
                                                </Button>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleUpload(file, "site_logo")
                                                    }}
                                                    disabled={uploadingLogo}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* FOOTER SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Footer</CardTitle>
                        <CardDescription>Update footer content.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="footer_logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Footer Logo</FormLabel>
                                    <div className="flex flex-col gap-4">
                                        {field.value && (
                                            <div className="relative h-20 w-full overflow-hidden rounded-md border p-2 bg-slate-100">
                                                <Image
                                                    src={field.value}
                                                    alt="Footer Logo Preview"
                                                    fill
                                                    className="object-contain object-left"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                {...field}
                                                placeholder="https://..."
                                                className="flex-1"
                                            />
                                            <div className="relative">
                                                <Button type="button" variant="outline" size="sm" disabled={uploadingFooterLogo}>
                                                    {uploadingFooterLogo ? "Uploading..." : "Upload"}
                                                </Button>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) handleUpload(file, "footer_logo")
                                                    }}
                                                    disabled={uploadingFooterLogo}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <FormDescription>Displayed at the bottom of the footer (or top left column).</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="footer_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Footer About Text</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="footer_copyright"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Copyright Text</FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                            {/* Column 1 */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="footer_col1_title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Column 1 Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="footer_col1_links"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Column 1 Links</FormLabel>
                                            <FormDescription>Format: Label|URL (one per line)</FormDescription>
                                            <FormControl>
                                                <Textarea {...field} rows={6} className="font-mono text-xs" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="footer_col2_title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Column 2 Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="footer_col2_links"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Column 2 Links</FormLabel>
                                            <FormDescription>Format: Label|URL (one per line)</FormDescription>
                                            <FormControl>
                                                <Textarea {...field} rows={6} className="font-mono text-xs" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SOCIAL MEDIA SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Social Media</CardTitle>
                        <CardDescription>Manage social media links. Leave existing links empty to hide them.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="social_facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Facebook</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="social_facebook_active"
                                            render={({ field: activeField }) => (
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Switch
                                                            checked={activeField.value === "true"}
                                                            onCheckedChange={(checked) => activeField.onChange(checked ? "true" : "false")}
                                                        />
                                                    </FormControl>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activeField.value === "true" ? "Active" : "Inactive"}
                                                    </span>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormControl>
                                        <Input {...field} placeholder="https://facebook.com/..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_twitter"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Twitter (X)</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="social_twitter_active"
                                            render={({ field: activeField }) => (
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Switch
                                                            checked={activeField.value === "true"}
                                                            onCheckedChange={(checked) => activeField.onChange(checked ? "true" : "false")}
                                                        />
                                                    </FormControl>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activeField.value === "true" ? "Active" : "Inactive"}
                                                    </span>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormControl>
                                        <Input {...field} placeholder="https://twitter.com/..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="social_instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Instagram</FormLabel>
                                        <FormField
                                            control={form.control}
                                            name="social_instagram_active"
                                            render={({ field: activeField }) => (
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Switch
                                                            checked={activeField.value === "true"}
                                                            onCheckedChange={(checked) => activeField.onChange(checked ? "true" : "false")}
                                                        />
                                                    </FormControl>
                                                    <span className="text-sm text-muted-foreground">
                                                        {activeField.value === "true" ? "Active" : "Inactive"}
                                                    </span>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormControl>
                                        <Input {...field} placeholder="https://instagram.com/..." />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
