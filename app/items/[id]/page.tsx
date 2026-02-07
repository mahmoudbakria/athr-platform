import { createClient } from '@/lib/supabase-server'
import { getCachedItemById, getCachedRelatedVolunteers, getCachedSystemSettings } from '@/lib/fetchers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ImageGallery } from '@/components/shared/ImageGallery'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    MessageCircle,
    MapPin,
    Calendar,
    Hammer,
    Truck,
    Tag,
    User,
    Mail,
    Phone,
    ShieldCheck
} from 'lucide-react'
import { Item, VolunteerDelivery } from '@/types'
import { ItemLocationMap } from '@/components/items/ItemLocationMap'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UserRatingBadge } from '@/components/users/UserRatingBadge'
import { VolunteerCard } from '@/components/volunteer/VolunteerCard'

export const revalidate = 60

// Fix for Next.js 15 params as promise
type Params = Promise<{ id: string }>

export async function generateMetadata(props: { params: Params }) {
    const params = await props.params
    const id = params.id
    let item = await getCachedItemById(id)

    if (!item) {
        const supabase = await createClient()
        const { data: privItem } = await supabase
            .from('items')
            .select('title, description, images')
            .eq('id', id)
            .single()

        if (privItem) {
            item = privItem as any
        }
    }

    if (!item) {
        return {
            title: 'الغرض غير موجود',
        }
    }

    const imageUrl = item.images && item.images.length > 0
        ? item.images[0]
        : '/og-image.jpg' // Fallback

    return {
        title: `${item.title} | خير`,
        description: item.description?.substring(0, 160) || 'شاهد هذا الغرض على منصة خير.',
        openGraph: {
            title: item.title,
            description: item.description?.substring(0, 160),
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 600,
                    alt: item.title,
                },
            ],
            type: 'website',
        },
    }
}

export default async function ItemDetails(props: { params: Params }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    // 1. Fetch Item & Settings via cached fetchers
    const [cachedItem, settingsData] = await Promise.all([
        getCachedItemById(id),
        getCachedSystemSettings()
    ])

    // 2. Secondary Parallel Fetch: Profile & Related Volunteers
    // If item missing from public cache (e.g. pending/private), try fetching with auth
    let item = cachedItem

    if (!item) {
        const { data: privItem } = await supabase
            .from('items')
            .select(`
                id, title, description, images, created_at, city,
                latitude, longitude, user_id, status, condition,
                delivery_available, needs_repair, contact_phone, tags,
                categories(name, slug),
                sub_categories(name)
            `)
            .eq('id', id)
            .single()

        if (privItem) {
            item = privItem as any
        }
    }

    if (!item) {
        notFound()
    }

    // Feature Flags
    const featureEnabled = settingsData?.find(s => s.key === 'feature_volunteer_delivery')?.value ?? true
    const showRelatedEnabled = settingsData?.find(s => s.key === 'feature_item_related_volunteers')?.value ?? true
    const isVolunteerEnabled = featureEnabled && showRelatedEnabled

    // 3. Profiles & Volunteers
    const volunteerPromise = (isVolunteerEnabled && item.city)
        ? getCachedRelatedVolunteers(item.city)
        : Promise.resolve([])

    const profilePromise = supabase
        .from('profiles')
        .select('full_name, avatar_url, show_avatar, email, phone')
        .eq('id', item.user_id)
        .single()

    const [relatedVolunteers, profileRes] = await Promise.all([volunteerPromise, profilePromise])
    const profile = profileRes.data

    const whatsappLink = `https://wa.me/${item.contact_phone}?text=${encodeURIComponent(`مرحباً، أنا مهتم بغرض: ${item.title}`)}`
    const emailLink = profile?.email ? `mailto:${profile.email}?subject=${encodeURIComponent(`استفسار حول: ${item.title}`)}` : '#'

    // Donor Display Logic
    const showAvatar = profile?.show_avatar ?? true
    const donorName = profile?.full_name || 'متبرع فاعل خير'
    const donorInitials = donorName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* LEFT COLUMN: Images & Map & Description */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-background rounded-2xl overflow-hidden shadow-sm border">
                        <ImageGallery images={item.images} />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold flex items-center gap-2">
                            الوصف
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-muted-foreground bg-muted/30 p-6 rounded-xl border border-border/50">
                            <p className="whitespace-pre-wrap leading-relaxed">{item.description}</p>
                        </div>
                    </div>

                    {item.tags && item.tags.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">الوسوم</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal text-muted-foreground flex items-center gap-1.5 bg-muted/50 hover:bg-muted transition-colors">
                                        <Tag className="h-3.5 w-3.5" /> {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.latitude && item.longitude && (
                        <div className="space-y-4 pt-4 border-t">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" /> الموقع
                            </h2>
                            <div className="">
                                <ItemLocationMap
                                    latitude={item.latitude}
                                    longitude={item.longitude}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Details & Actions */}
                <div className="space-y-8">
                    <div className="lg:sticky lg:top-24 space-y-6">

                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {item.categories && (
                                    <Link href={`/listings?category=${item.categories.slug}`}>
                                        <Badge variant="outline" className="text-sm py-1 hover:bg-muted cursor-pointer transition-colors border-primary/20 text-primary">
                                            {item.categories.name}
                                        </Badge>
                                    </Link>
                                )}
                                {item.sub_categories?.name && (
                                    <Badge variant="outline" className="text-sm py-1 bg-muted/50">{item.sub_categories.name}</Badge>
                                )}
                                <Badge variant={item.status === 'active' ? "default" : "secondary"} className={item.status === 'active' ? "bg-green-500 hover:bg-green-600" : ""}>
                                    {item.status.toUpperCase()}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{item.title}</h1>

                            <div className="flex flex-col gap-2 text-muted-foreground text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 shrink-0" />
                                    <span>{item.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 shrink-0" />
                                    <span>تم الإدراج بتاريخ {new Date(item.created_at).toLocaleDateString('ar-SA', { dateStyle: 'long' })}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Quick Attributes */}
                        <div className="grid grid-cols-2 gap-3">
                            {item.condition && (
                                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50 flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">الحالة</span>
                                    <span className="font-medium text-blue-700 dark:text-blue-300 capitalize text-sm leading-tight">
                                        {item.condition === 'new' ? 'جديد (لم يستخدم قط)' :
                                            item.condition === 'like_new' ? 'شبه جديد' :
                                                item.condition === 'used' ? 'مستعمل' :
                                                    (item.condition as string)?.replace(/_/g, ' ')}
                                    </span>
                                </div>
                            )}

                            <div className={`p-3 rounded-lg border flex flex-col gap-1 ${item.delivery_available
                                ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50'
                                : 'bg-muted/30 border-border/50'
                                }`}>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">التوصيل</span>
                                <span className={`font-medium flex items-center gap-1.5 text-sm ${item.delivery_available ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
                                    }`}>
                                    <Truck className="h-3.5 w-3.5" />
                                    {item.delivery_available ? 'يمكنني التوصيل' : 'الاستلام من الموقع فقط'}
                                </span>
                            </div>

                            <div className={`p-3 rounded-lg border flex flex-col gap-1 ${item.needs_repair
                                ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50'
                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                                }`}>
                                <span className="text-xs text-muted-foreground uppercase font-semibold">حالة العمل</span>
                                <span className={`font-medium flex items-center gap-1.5 text-sm ${item.needs_repair ? 'text-orange-700 dark:text-orange-300' : 'text-emerald-700 dark:text-emerald-300'
                                    }`}>
                                    {item.needs_repair ? <Hammer className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                    {item.needs_repair ? 'يحتاج إصلاح' : 'جاهز للاستخدام'}
                                </span>
                            </div>
                        </div>

                        {/* Donor Card */}
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                        {showAvatar && profile?.avatar_url && (
                                            <AvatarImage src={profile.avatar_url} alt={donorName} />
                                        )}
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                            {showAvatar ? donorInitials : <User className="h-6 w-6" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium">تبرع بواسطة</p>
                                        <Link href={`/listings?userId=${item.user_id}`} className="hover:text-primary hover:underline transition-colors">
                                            <h3 className="font-semibold text-lg">{donorName}</h3>
                                        </Link>
                                        {profile && (
                                            <div className="mt-1">
                                                <UserRatingBadge
                                                    userId={item.user_id!}
                                                    userName={donorName}
                                                    userAvatar={profile.avatar_url}
                                                />
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            <span dir="ltr">{item.contact_phone}</span>
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-3">
                                    <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm font-medium" asChild>
                                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                            <MessageCircle className="h-5 w-5" />
                                            تحدث عبر واتساب
                                        </a>
                                    </Button>

                                    {profile?.email && (
                                        <Button variant="outline" size="lg" className="w-full gap-2 border-border/60 hover:bg-muted/50" asChild>
                                            <a href={emailLink}>
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                إرسال بريد إلكتروني
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Safety Tip */}
                        <div className="bg-muted/20 p-4 rounded-lg text-xs text-muted-foreground space-y-2 border border-border/50">
                            <p className="font-medium flex items-center gap-1.5 text-foreground/80 text-right">
                                <ShieldCheck className="h-3.5 w-3.5" /> نصائح السلامة
                            </p>
                            <ul className="list-disc list-inside space-y-1 opacity-90 pl-1 text-right" dir="rtl">
                                <li>التقِ في مكان عام وآمن.</li>
                                <li>لا تشارك معلومات شخصية حساسة.</li>
                                <li>افحص حالة الغرض شخصياً.</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>

            {/* RELATED VOLUNTEERS SECTION */}
            {isVolunteerEnabled && relatedVolunteers.length > 0 && (
                <div className="mt-16 space-y-6 border-t pt-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">متطوعون متاحون في {item.city}</h2>
                            <p className="text-muted-foreground">هؤلاء المتطوعون نشطون في هذه المنطقة وقد يكونون قادرين على المساعدة في التوصيل.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedVolunteers.map((volunteer) => (
                            <VolunteerCard key={volunteer.id} volunteer={volunteer} />
                        ))}
                    </div>
                </div>
            )}
        </div >
    )
}
