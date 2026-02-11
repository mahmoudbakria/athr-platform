import { createClient } from '@/lib/supabase-server'
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
    ShieldCheck,
    Edit
} from 'lucide-react'
import { Item } from '@/types'
import { ItemLocationMap } from '@/components/items/ItemLocationMap'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const revalidate = 0

export default async function AdminItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // 1. Fetch Item Data
    const { data: item, error } = await supabase
        .from('items')
        .select(`
            *,
            categories(name, slug),
            sub_categories(name)
        `)
        .eq('id', id)
        .single()

    if (error || !item) {
        notFound()
    }

    const typedItem = item as unknown as (Item & {
        categories: { name: string, slug: string } | null,
        sub_categories: { name: string } | null
    })

    // 2. Fetch Profile Data (Donor Info)
    const { data: profile } = typedItem.user_id
        ? await supabase
            .from('profiles')
            .select('full_name, avatar_url, show_avatar, email, phone')
            .eq('id', typedItem.user_id)
            .single()
        : { data: null }

    const whatsappLink = `https://wa.me/${typedItem.contact_phone}?text=${encodeURIComponent(`Hello, I am interested in your item: ${typedItem.title}`)}`

    // Determine contact email
    const contactEmail = profile?.email || (typedItem as any).guest_email
    const emailLink = contactEmail ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Inquiry about: ${typedItem.title}`)}` : '#'

    // Donor Display Logic
    const isGuest = !typedItem.user_id
    const showAvatar = isGuest ? true : (profile?.show_avatar ?? true)
    const donorName = isGuest ? ((typedItem as any).guest_name || 'Guest Visitor') : (profile?.full_name || 'Anonymous Donor')

    const donorInitials = donorName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="space-y-6">
            {/* Admin Controls */}
            <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border border-border/50">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Item Preview</h1>
                    <p className="text-sm text-muted-foreground">This is how the item appears to public users</p>
                </div>
                <Button asChild>
                    <Link href={`/admin/items/${item.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Item
                    </Link>
                </Button>
            </div>

            {/* Public View Content */}
            <div className="container mx-auto px-0 max-w-7xl">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* LEFT COLUMN: Images & Map (occupies 2 cols on large screens) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-background rounded-2xl overflow-hidden shadow-sm border">
                            <ImageGallery images={typedItem.images} />
                        </div>

                        {/* Description Section */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold flex items-center gap-2">
                                Description
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground bg-muted/30 p-6 rounded-xl border border-border/50">
                                <p className="whitespace-pre-wrap leading-relaxed">{typedItem.description}</p>
                            </div>
                        </div>

                        {/* Tags */}
                        {typedItem.tags && typedItem.tags.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {typedItem.tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal text-muted-foreground flex items-center gap-1.5 bg-muted/50 hover:bg-muted transition-colors">
                                            <Tag className="h-3.5 w-3.5" /> {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Map */}
                        {typedItem.latitude && typedItem.longitude && (
                            <div className="space-y-4 pt-4 border-t">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" /> Location
                                </h2>
                                <div className="">
                                    <ItemLocationMap
                                        latitude={typedItem.latitude}
                                        longitude={typedItem.longitude}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Details & Actions (Sticky on desktop) */}
                    <div className="space-y-8">
                        <div className="space-y-6">

                            {/* Header Info */}
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {/* Category Link */}
                                    {typedItem.categories && (
                                        <Badge variant="outline" className="text-sm py-1 border-primary/20 text-primary">
                                            {typedItem.categories.name}
                                        </Badge>
                                    )}
                                    {typedItem.sub_categories?.name && (
                                        <Badge variant="outline" className="text-sm py-1 bg-muted/50">{typedItem.sub_categories.name}</Badge>
                                    )}
                                    <Badge variant={typedItem.status === 'active' ? "default" : "secondary"} className={typedItem.status === 'active' ? "bg-green-500 hover:bg-green-600" : ""}>
                                        {typedItem.status.toUpperCase()}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{typedItem.title}</h1>

                                <div className="flex flex-col gap-2 text-muted-foreground text-sm">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                        <span>{typedItem.city}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 shrink-0" />
                                        <span>Listed on {new Date(typedItem.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Quick Attributes */}
                            <div className="grid grid-cols-2 gap-3">
                                {typedItem.condition && (
                                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50 flex flex-col gap-1">
                                        <span className="text-xs text-muted-foreground uppercase font-semibold">Condition</span>
                                        <span className="font-medium text-blue-700 dark:text-blue-300 capitalize text-sm leading-tight">
                                            {{
                                                'new': 'New (Never used)',
                                                'like_new': 'Like New (Used)',
                                                'used': 'Used (Signs of wear)'
                                            }[typedItem.condition] || typedItem.condition.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                )}

                                {/* Delivery Status - Always Show */}
                                <div className={`p-3 rounded-lg border flex flex-col gap-1 ${typedItem.delivery_available
                                    ? 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50'
                                    : 'bg-muted/30 border-border/50'
                                    }`}>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Delivery</span>
                                    <span className={`font-medium flex items-center gap-1.5 text-sm ${typedItem.delivery_available ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'
                                        }`}>
                                        <Truck className="h-3.5 w-3.5" />
                                        {typedItem.delivery_available ? 'I can deliver' : 'Pick-up only'}
                                    </span>
                                </div>

                                {/* Repair Status - Always Show */}
                                <div className={`p-3 rounded-lg border flex flex-col gap-1 ${typedItem.needs_repair
                                    ? 'bg-orange-50/50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/50'
                                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50'
                                    }`}>
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Working Status</span>
                                    <span className={`font-medium flex items-center gap-1.5 text-sm ${typedItem.needs_repair ? 'text-orange-700 dark:text-orange-300' : 'text-emerald-700 dark:text-emerald-300'
                                        }`}>
                                        {typedItem.needs_repair ? <Hammer className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                                        {typedItem.needs_repair ? 'Needs Repair' : 'Ready to use'}
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
                                            <p className="text-sm text-muted-foreground font-medium">Donated by</p>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{donorName}</h3>
                                                {isGuest && <Badge variant="outline" className="text-xs font-normal bg-amber-50 text-amber-700 border-amber-200">Guest</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span dir="ltr">{typedItem.contact_phone}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-3">
                                        <Button size="lg" className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm font-medium" disabled>
                                            <MessageCircle className="h-5 w-5" />
                                            Chat on WhatsApp
                                        </Button>

                                        {contactEmail && (
                                            <Button variant="outline" size="lg" className="w-full gap-2 border-border/60 hover:bg-muted/50" disabled>
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                Send Email
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center italic">
                                        * Contact buttons disabled in admin view
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Safety Safety Tip */}
                            <div className="bg-muted/20 p-4 rounded-lg text-xs text-muted-foreground space-y-2 border border-border/50">
                                <p className="font-medium flex items-center gap-1.5 text-foreground/80">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Safety Tips
                                </p>
                                <ul className="list-disc list-inside space-y-1 opacity-90 pl-1">
                                    <li>Meet in a safe, public place.</li>
                                    <li>Don't share sensitive personal info.</li>
                                    <li>Check the item condition in person.</li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
