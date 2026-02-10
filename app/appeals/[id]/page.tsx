
import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShareButton } from '@/components/shared/ShareButton'
import { siteConfig } from '@/config/site'
import {
    MapPin,
    Calendar,
    HeartHandshake,
    HandHelping,
    Info,
    CheckCircle2,
    ArrowRight
} from 'lucide-react'

// Fix for Next.js 15 params as promise
type Params = Promise<{ id: string }>

export async function generateMetadata(props: { params: Params }) {
    const params = await props.params
    const id = params.id
    const supabase = await createClient()

    const { data: appeal } = await supabase
        .from('appeals')
        .select('*')
        .eq('id', id)
        .single()

    if (!appeal) {
        return {
            title: 'النداء غير موجود',
        }
    }

    return {
        title: `${appeal.title} | خير`,
        description: appeal.story?.substring(0, 160) || 'ساعد في تلبية هذا النداء على منصة خير.',
        openGraph: {
            title: appeal.title,
            description: appeal.story?.substring(0, 160),
            type: 'website',
        },
    }
}

export default async function AppealDetails(props: { params: Params }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    const { data: appeal } = await supabase
        .from('appeals')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url,
                email,
                phone
            )
        `)
        .eq('id', id)
        .single()

    if (!appeal) {
        notFound()
    }

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Medical': return { bg: 'bg-rose-50', text: 'text-rose-600', icon: HeartHandshake }
            case 'Financial': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: HandHelping }
            case 'Education': return { bg: 'bg-sky-50', text: 'text-sky-600', icon: Info }
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: HeartHandshake }
        }
    }

    const theme = getCategoryStyles(appeal.category)
    const CategoryIcon = theme.icon

    return (
        <div className="min-h-screen bg-slate-50/50 py-10" dir="rtl">
            <div className="container max-w-4xl mx-auto px-4">

                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" asChild className="gap-2 hover:bg-slate-100">
                        <Link href="/appeals">
                            <ArrowRight className="h-4 w-4" />
                            العودة إلى المناشدات
                        </Link>
                    </Button>
                </div>

                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className={`h-40 md:h-56 w-full relative overflow-hidden ${theme.bg}`}>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                        <div className="absolute bottom-0 right-0 p-8 md:p-12">
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-white shadow-xl flex items-center justify-center rotate-6 transform translate-y-8">
                                <CategoryIcon className={`h-10 w-10 md:h-12 md:w-12 ${theme.text}`} />
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-8 md:px-10 md:pb-12 md:pt-12">
                        {/* Header Content */}
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className={`${theme.bg} ${theme.text} border-0 px-3 py-1 rounded-full`}>
                                        {appeal.category}
                                    </Badge>
                                    {appeal.city && (
                                        <Badge variant="outline" className="px-3 py-1 border-slate-200 text-slate-600 rounded-full gap-1.5 bg-slate-50">
                                            <MapPin className="h-3 w-3" />
                                            {appeal.city}
                                        </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                        <Calendar className="h-3 w-3 ml-1.5" />
                                        {new Date(appeal.created_at).toLocaleDateString('ar-EG', { dateStyle: 'long' })}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
                                    {appeal.title}
                                </h1>
                            </div>

                            <div className="shrink-0">
                                <ShareButton
                                    title={appeal.title}
                                    text={`يرجى المساهمة في هذا النداء: ${appeal.title}`}
                                    url={`${siteConfig.url.replace(/\/$/, "")}/appeals/${appeal.id}`}
                                    variant="outline"
                                    size="lg"
                                    className="w-full md:w-auto"
                                />
                            </div>
                        </div>

                        {/* Story */}
                        <div className="prose prose-lg prose-slate max-w-none mb-10">
                            <div className="p-6 md:p-8 bg-slate-50 rounded-[2rem] text-slate-600 leading-loose whitespace-pre-wrap border border-slate-100/50">
                                {appeal.story}
                            </div>
                        </div>

                        {/* Target Amount */}
                        {appeal.target_amount && (
                            <div className="mb-10 p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                                <span className="font-bold text-emerald-900">المبلغ المطلوب</span>
                                <span className="text-2xl font-black text-emerald-600">{Number(appeal.target_amount).toLocaleString()} شاقل</span>
                            </div>
                        )}

                        {/* Contact Section */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>

                            <div className="relative z-10">
                                <h4 className="font-bold text-xl mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full">
                                        <Info className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    معلومات التواصل
                                </h4>

                                <div className="grid gap-6">
                                    <p className="text-slate-300 leading-relaxed">
                                        لتقديم المساعدة، يرجى التواصل مباشرة مع صاحب الحالة. تأكّد من التحقّق من التفاصيل قبل التحويل.
                                    </p>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <div className="font-mono text-xl tracking-wider font-bold select-all text-emerald-400">
                                            {appeal.contact_info}
                                        </div>
                                    </div>

                                    <Button asChild size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-900/20 font-bold gap-2 h-14 rounded-2xl text-lg">
                                        <a
                                            href={`https://wa.me/${(() => {
                                                const raw = appeal.contact_info.trim()
                                                if (raw.startsWith('+972')) return raw.replace(/\s/g, '')
                                                let digits = raw.replace(/\D/g, '')
                                                if (digits.startsWith('972')) return `+${digits}`
                                                if (digits.startsWith('0')) digits = digits.substring(1)
                                                return `+972${digits}`
                                            })()}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            تواصل عبر واتساب
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        </div>


                        {/* Creator Info */}
                        <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                                    {appeal.profiles?.avatar_url ? (
                                        <Image src={appeal.profiles.avatar_url} alt={appeal.profiles.full_name || 'User'} width={48} height={48} className="object-cover h-full w-full" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                            <span className="text-lg font-bold">{(appeal.profiles?.full_name || 'U').charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{appeal.profiles?.full_name || 'فاعل خير'}</p>
                                    <p className="text-xs text-slate-500">صاحب النداء</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
