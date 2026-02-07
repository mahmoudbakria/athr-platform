'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Category, SubCategory } from "@/types"
import { supabase } from "@/lib/supabase"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import imageCompression from 'browser-image-compression'
import { X, Tag } from "lucide-react"
import dynamic from 'next/dynamic'
import { Badge } from "@/components/ui/badge"
import { createItem } from "@/app/items/actions"
import NextImage from "next/image"

// Dynamic import for Map to prevent SSR issues
const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center">جاري تحميل الخريطة...</div>
})

const formSchema = z.object({
    title: z.string().min(2, "يجب أن يكون العنوان حرفين على الأقل."),
    description: z.string().min(10, "يجب أن يكون الوصف 10 أحرف على الأقل."),
    city: z.string().min(2, "اسم المدينة مطلوب."),
    category_id: z.string().min(1, "يرجى اختيار التصنيف."),
    sub_category_id: z.string().optional(),
    contact_phone: z.string().min(5, "رقم الهاتف مطلوب."),
    condition: z.enum(['new', 'like_new', 'used']),
    delivery_available: z.boolean().default(false),
    needs_repair: z.boolean().default(false),
    needs_transport: z.boolean().default(false),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    tags: z.array(z.string()).optional(),
})

interface DonateFormProps {
    categories: Category[]
    subCategories: SubCategory[]
    featureFlags: {
        transporter: boolean
        maintenance: boolean
    }
}

export function DonateForm({ categories, subCategories, featureFlags }: DonateFormProps) {
    const router = useRouter()
    const [images, setImages] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            city: "",
            contact_phone: "",
            condition: undefined as any,
            needs_repair: false,
            needs_transport: false,
            delivery_available: false,
            latitude: null,
            longitude: null,
            tags: [],
            sub_category_id: undefined,
        },
    })

    // Watch category_id to filter sub-categories
    const selectedCategoryId = form.watch('category_id')

    // Filter sub-categories based on selected category
    const filteredSubCategories = useMemo(() => {
        if (!selectedCategoryId) return []
        return subCategories.filter(sub => sub.category_id === selectedCategoryId)
    }, [selectedCategoryId, subCategories])

    // Reset sub-category when category changes
    useEffect(() => {
        form.setValue('sub_category_id', '')
    }, [selectedCategoryId, form])

    const [uploadProgress, setUploadProgress] = useState<string>("")

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (images.length === 0) {
            toast.error("يرجى التأكد من رفع صورة واحدة على الأقل.")
            return
        }

        setIsSubmitting(true)
        setUploadProgress("جاري البدء...")

        try {
            const imageUrls: string[] = []

            // Process images sequentially to avoid freezing and provide feedback
            for (let i = 0; i < images.length; i++) {
                const file = images[i]
                setUploadProgress(`جاري معالجة الصورة ${i + 1} من ${images.length}...`)

                // Compress image
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1280,
                    useWebWorker: true,
                    initialQuality: 0.7
                }

                let compressedFile = file
                try {
                    // Update status for compression specifically if it takes time
                    compressedFile = await imageCompression(file, options)
                } catch (error) {
                    console.error("Compression failed, using original", error)
                }

                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

                // Upload
                const { error } = await supabase.storage
                    .from('item-images')
                    .upload(fileName, compressedFile)

                if (error) throw error

                const { data: publicData } = supabase.storage.from('item-images').getPublicUrl(fileName)
                imageUrls.push(publicData.publicUrl)
            }

            setUploadProgress("جاري إتمام التبرع...")

            // Insert Item via Server Action to handle points
            // Note: createItem handles user_id and status
            const itemData = {
                title: values.title,
                description: values.description,
                city: values.city,
                category_id: values.category_id,
                sub_category_id: values.sub_category_id ? parseInt(values.sub_category_id) : null,
                contact_phone: values.contact_phone,
                condition: values.condition,
                delivery_available: values.delivery_available,
                needs_repair: values.needs_repair,
                needs_transport: values.needs_transport,
                latitude: values.latitude,
                longitude: values.longitude,
                tags: tags,
                images: imageUrls,
            }

            await createItem(itemData)

            toast.success("تم إضافة الغرض بنجاح!", {
                description: "غرضك قيد المراجعة، شكراً لك!"
            })

            router.push('/')
            router.refresh()
        } catch (error: any) {
            toast.error("فشل في إضافة الغرض.", {
                description: error.message
            })
            console.error(error)
        } finally {
            setIsSubmitting(false)
            setUploadProgress("")
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)

            if (images.length + files.length > 5) {
                toast.error("يمكنك رفع 5 صور كحد أقصى.")
                return
            }

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
            setImages(prev => [...prev, ...files])
        }
    }

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index))
        setPreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            const newTag = tagInput.trim()
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag])
                setTagInput("")
            }
        }
    }

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove))
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-6" dir="rtl">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>عنوان الغرض</FormLabel>
                            <FormControl>
                                <Input placeholder="مثلاً: كرسي خشبي" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>الوصف</FormLabel>
                            <FormControl>
                                <Textarea placeholder="صف حالة الغرض، عمره، إلخ." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>التصنيف</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر تصنيفاً" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sub_category_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>التصنيف الفرعي {filteredSubCategories.length === 0 && selectedCategoryId && "(لا يوجد)"}</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={!selectedCategoryId || filteredSubCategories.length === 0}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={!selectedCategoryId ? "اختر التصنيف أولاً" : "اختر تصنيفاً فرعياً"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {filteredSubCategories.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>المدينة / المنطقة</FormLabel>
                                <FormControl>
                                    <Input placeholder="مثلاً: عرابة" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Location Picker Section */}
                <div className="space-y-2">
                    <FormLabel>الموقع (اختياري)</FormLabel>
                    <LocationPicker
                        onLocationSelect={(loc) => {
                            form.setValue('latitude', loc.lat)
                            form.setValue('longitude', loc.lng)
                        }}
                    />
                    {/* Hidden inputs to ensure form validation if we wanted to make it required later */}
                    <input type="hidden" {...form.register('latitude', { valueAsNumber: true })} />
                    <input type="hidden" {...form.register('longitude', { valueAsNumber: true })} />
                </div>

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>حالة الغرض</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                    >
                                        <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0 w-full text-right">
                                            <FormControl>
                                                <RadioGroupItem value="new" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                جديد (لم يستخدم قط)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0 w-full text-right">
                                            <FormControl>
                                                <RadioGroupItem value="like_new" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                شبه جديد (استخدم مرات قليلة، بدون أضرار)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex flex-row items-center justify-start gap-2 space-y-0 w-full text-right">
                                            <FormControl>
                                                <RadioGroupItem value="used" />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                مستعمل (تظهر عليه علامات الاستخدام، لكنه صالح)
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <FormLabel>الوسوم (اختياري)</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="hover:text-destructive focus:outline-none"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="relative">
                            <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="اكتب الوسم واضغط Enter (مثلاً: شتاء، ملابس)"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="pl-9"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">اضغط Enter لإضافة الوسم.</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>رقم الواتساب للتواصل</FormLabel>
                                <FormControl>
                                    <Input placeholder="+970xxxxxxxxx" {...field} />
                                </FormControl>
                                <FormDescription>
                                    سيتم التواصل معك من قبل المستفيدين عبر هذا الرقم.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <FormLabel>الصور (بحد أقصى 5)</FormLabel>
                    <div className="flex flex-wrap gap-4">
                        {previews.map((src, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden group">
                                <NextImage
                                    src={src}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <div className="w-24 h-24 border border-dashed rounded-md flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors relative">
                                <span className="text-xs text-muted-foreground">+ إضافة صورة</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    value=""
                                />
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">تم اختيار {images.length} / 5 صور</p>
                </div>

                <div className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="delivery_available"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-start gap-3 space-y-0 rounded-md border p-4 bg-green-50/50 w-full text-right">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        يمكنني توصيل الغرض بنفسي
                                    </FormLabel>
                                    <FormDescription>
                                        اختر هذا الخيار إذا كنت مستعداً لتوصيل الغرض للمستفيد.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="needs_repair"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-start gap-3 space-y-0 rounded-md border p-4 w-full text-right">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        يحتاج إصلاح؟
                                    </FormLabel>
                                    <FormDescription>
                                        اختر هذا إذا كان الغرض يحتاج لصيانة بسيطة ولكنه قابل للاستخدام.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                    {featureFlags.transporter && (
                        <FormField
                            control={form.control}
                            name="needs_transport"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-start gap-3 space-y-0 rounded-md border p-4 w-full text-right">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            بحاجة لمتطوع توصيل؟
                                        </FormLabel>
                                        <FormDescription>
                                            طلب مساعدة من متطوعي التوصيل في المنصة.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin text-lg">⏳</span> {uploadProgress || "جاري المعالجة..."}
                        </span>
                    ) : "نشر التبرع"}
                </Button>
            </form>
        </Form>
    )
}
