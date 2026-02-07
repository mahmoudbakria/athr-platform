"use client"

import { useState, useMemo } from 'react'
import { Search, MapPin, Filter, Calendar, HandHelping, Info, CheckCircle2, HeartHandshake, X, Loader2, Trash2, Pencil } from 'lucide-react'
import { EditAppealDialog } from './EditAppealDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
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
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'

interface AppealsFeedProps {
    initialAppeals: any[]
    viewMode?: 'public' | 'user'
}

const categories = [
    'Medical',
    'Financial',
    'Education',
    'Food',
    'Debt',
    'Home',
    'Other'
]

const cities = [
    'المثلث الشمالي',
    'المثلث الجنوبي',
    'الجليل الأعلى',
    'الجليل الأسفل',
    'النقب',
    'القدس',
    'رهط',
    'عكا',
    'حيفا',
    'يافا',
    'أم الفحم',
    'الناصرة',
    'سخنين',
    'طمرة',
    'عرابة',
    'الطيبة',
    'الطيرة',
    'باقة الغربية',
    'قلنسوة',
    'كفر قاسم',
    'شفا عمرو',
    'مجد الكروم',
    'كابول',
    'طوبا الزنغرية',
    'تمره',
    'كسيفه',
    'تل السبع',
    'حورة',
    'عرعرة النقب',
    'اللقية',
    'قرى أخرى'
]

const getCategoryStyles = (category: string) => {
    switch (category) {
        case 'Medical': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' }
        case 'Financial': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }
        case 'Education': return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' }
        default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' }
    }
}

const getStatusStyles = (status: string) => {
    switch (status) {
        case 'approved': return { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'موافق عليه' }
        case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'قيد المراجعة' }
        case 'rejected': return { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' }
        default: return { bg: 'bg-slate-100', text: 'text-slate-700', label: status }
    }
}

export function AppealsFeed({ initialAppeals, viewMode = 'public' }: AppealsFeedProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [cityFilter, setCityFilter] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [appeals, setAppeals] = useState(initialAppeals)

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(id)
            const supabase = createClient()
            const { error } = await supabase
                .from('appeals')
                .delete()
                .eq('id', id)

            if (error) throw error

            setAppeals(prev => prev.filter(a => a.id !== id))
            toast.success('تم حذف النداء بنجاح')
        } catch (error) {
            console.error('Delete error:', error)
            toast.error('فشل في حذف النداء')
        } finally {
            setIsDeleting(null)
        }
    }

    const filteredAppeals = useMemo(() => {
        let result = appeals.filter(appeal => {
            const matchesSearch =
                appeal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appeal.story.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = categoryFilter === 'all' || appeal.category === categoryFilter
            const matchesCity = cityFilter === 'all' || appeal.city === cityFilter

            return matchesSearch && matchesCategory && matchesCity
        })

        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })

        return result
    }, [appeals, searchTerm, categoryFilter, cityFilter, sortBy])

    return (
        <div className="space-y-10">
            {/* Soft Filter Bar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-slate-100 p-5 sticky top-4 z-40 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <Input
                                placeholder="بحث عن نداء..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 bg-slate-50/50 border-slate-200 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl h-11 transition-all"
                            />
                        </div>
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-col sm:flex-row gap-3 lg:w-auto w-full overflow-x-auto pb-1 sm:pb-0">
                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <Filter className="h-4 w-4 text-slate-500" />
                                    <SelectValue placeholder="التصنيف" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">كل التصنيفات</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* City Filter */}
                        <Select value={cityFilter} onValueChange={setCityFilter}>
                            <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                    <SelectValue placeholder="المدينة" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="all">كل المدن</SelectItem>
                                {cities.map(city => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Sort By Date */}
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-[140px] rounded-xl h-11 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 transition-colors">
                                <div className="flex items-center gap-2 truncate">
                                    <Calendar className="h-4 w-4 text-slate-500" />
                                    <SelectValue placeholder="الترتيب" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100">
                                <SelectItem value="newest">الأحدث</SelectItem>
                                <SelectItem value="oldest">الأقدم</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {
                filteredAppeals.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-sm">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">لا توجد نتائج مطابقة</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-6">لم نجد أي نداءات تطابق خيارات البحث الحالية.</p>
                        <Button
                            variant="outline"
                            onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setCityFilter('all'); }}
                            className="rounded-full px-6 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                        >
                            مسح كل الفلاتر
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 lg:gap-8">
                        {filteredAppeals.map((appeal) => {
                            const styles = getCategoryStyles(appeal.category)
                            const statusStyle = getStatusStyles(appeal.status)
                            return (
                                <Dialog key={appeal.id}>
                                    <DialogTrigger asChild>
                                        <div className="group relative bg-white rounded-[2rem] p-5 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-transparent hover:border-emerald-100/50 flex flex-col h-full overflow-hidden">

                                            {/* Top Meta Info */}
                                            <div className="flex flex-col items-start gap-2 mb-4 relative z-10">
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <Badge variant="outline" className={`${styles.bg} ${styles.text} ${styles.border} border px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm`}>
                                                        {appeal.category}
                                                    </Badge>

                                                    {viewMode === 'user' && (
                                                        <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text} border-transparent px-2.5 py-1.5 rounded-full text-xs font-bold`}>
                                                            {statusStyle.label}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {appeal.city && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                                        <MapPin className="h-3 w-3" />
                                                        {appeal.city}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="space-y-4 flex-1">
                                                <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                                    {appeal.title}
                                                </h3>

                                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                                                    {appeal.story}
                                                </p>
                                            </div>

                                            {/* Footer / User */}
                                            <div className="mt-6 pt-5 border-t border-slate-50 flex items-start justify-between">
                                                <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                                                    <div className="relative">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm">
                                                            {appeal.profiles?.avatar_url ? (
                                                                <Image src={appeal.profiles.avatar_url} alt={appeal.profiles.full_name || 'User'} fill className="object-cover" />
                                                            ) : (
                                                                <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                                                                    <span className="text-sm font-bold">{(appeal.profiles?.full_name || 'U').charAt(0)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full ring-2 ring-white flex items-center justify-center">
                                                            <CheckCircle2 className="h-2 w-2 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col text-center md:text-right">
                                                        <span className="text-[10px] text-slate-400 font-medium pt-1">
                                                            {new Date(appeal.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {viewMode === 'user' ? (
                                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <EditAppealDialog
                                                            appeal={appeal}
                                                            trigger={
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-9 w-9 rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-10 w-10 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    {isDeleting === appeal.id ? (
                                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="h-5 w-5" />
                                                                    )}
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>هل أنت متأكد من حذف هذا النداء؟</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        لا يمكن التراجع عن هذا الإجراء. سيتم حذف النداء نهائياً من النظام.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>إلغاء</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                                                        onClick={() => handleDelete(appeal.id)}
                                                                    >
                                                                        حذف
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-emerald-500/30 group-hover:scale-110">
                                                        <HandHelping className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DialogTrigger>

                                    {/* Dialog Content */}
                                    <DialogContent className="max-w-lg w-[95%] md:w-full max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[1.5rem] md:rounded-[2rem] border-0 shadow-2xl" dir="rtl">
                                        <div className={`h-24 md:h-32 w-full relative overflow-hidden shrink-0 ${styles.bg}`}>
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
                                            <div className="absolute bottom-0 right-0 p-6 md:p-8">
                                                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl md:rounded-3xl bg-white shadow-xl flex items-center justify-center rotate-6 transform translate-y-4 md:translate-y-6">
                                                    {appeal.category === 'Medical' && <HeartHandshake className="h-8 w-8 md:h-10 md:w-10 text-rose-500" />}
                                                    {appeal.category === 'Financial' && <HandHelping className="h-8 w-8 md:h-10 md:w-10 text-emerald-500" />}
                                                    {appeal.category === 'Education' && <Info className="h-8 w-8 md:h-10 md:w-10 text-sky-500" />}
                                                    {!['Medical', 'Financial', 'Education'].includes(appeal.category) && <HeartHandshake className="h-8 w-8 md:h-10 md:w-10 text-slate-500" />}
                                                </div>
                                            </div>
                                            <DialogClose asChild>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-3 left-3 md:top-4 md:left-4 rounded-full bg-white/50 hover:bg-white text-slate-600 backdrop-blur-sm z-50 h-8 w-8 md:h-10 md:w-10"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </DialogClose>
                                        </div>

                                        <div className="px-5 py-6 md:px-8 md:pb-10 md:pt-10">
                                            <DialogHeader className="mb-6 md:mb-8 space-y-3 md:space-y-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="secondary" className={`${styles.bg} ${styles.text} border-0 px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm`}>
                                                        {appeal.category}
                                                    </Badge>
                                                    {viewMode === 'user' && (
                                                        <Badge variant="outline" className={`${statusStyle.bg} ${statusStyle.text} border-transparent px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm`}>
                                                            {statusStyle.label}
                                                        </Badge>
                                                    )}
                                                    {appeal.city && (
                                                        <Badge variant="outline" className="px-3 py-1 md:px-4 md:py-1.5 border-slate-200 text-slate-600 rounded-full gap-1.5 bg-slate-50 text-xs md:text-sm">
                                                            <MapPin className="h-3 w-3" />
                                                            {appeal.city}
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] md:text-xs text-muted-foreground flex items-center mr-auto font-medium bg-slate-50 px-2 py-1 md:px-3 md:py-1 rounded-full">
                                                        {new Date(appeal.created_at).toLocaleDateString('ar-EG')}
                                                    </span>
                                                </div>
                                                <DialogTitle className="text-xl md:text-3xl font-bold text-slate-900 leading-tight">
                                                    {appeal.title}
                                                </DialogTitle>
                                            </DialogHeader>

                                            <div className="prose prose-slate max-w-none mb-6 md:mb-10">
                                                <div className="p-5 md:p-8 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-lg leading-relaxed text-slate-600 whitespace-pre-wrap border border-slate-100/50 shadow-inner">
                                                    {appeal.story}
                                                </div>
                                            </div>

                                            {appeal.target_amount && (
                                                <div className="mb-6 md:mb-10 p-4 md:p-6 bg-emerald-50/50 rounded-2xl md:rounded-3xl border border-emerald-100 flex items-center justify-between">
                                                    <span className="font-bold text-sm md:text-base text-emerald-900">المبلغ المطلوب</span>
                                                    <span className="text-xl md:text-2xl font-black text-emerald-600">{Number(appeal.target_amount).toLocaleString()} شاقل</span>
                                                </div>
                                            )}

                                            <div className="bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 text-white shadow-2xl relative overflow-hidden">
                                                {/* Decorative shine */}
                                                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 bg-white/5 rounded-full blur-2xl"></div>

                                                <h4 className="font-bold text-lg md:text-xl mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                                    <div className="p-1.5 md:p-2 bg-white/10 rounded-full">
                                                        <Info className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
                                                    </div>
                                                    معلومات التواصل
                                                </h4>

                                                <div className="grid gap-4 md:gap-6">
                                                    <p className="text-slate-300/90 text-xs md:text-sm leading-relaxed">
                                                        لتقديم المساعدة، يرجى التواصل مباشرة مع صاحب الحالة. تأكّد من التحقّق من التفاصيل قبل التحويل.
                                                    </p>

                                                    <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                                                        <div className="font-mono text-lg md:text-xl tracking-wider font-bold select-all text-emerald-400">
                                                            {appeal.contact_info}
                                                        </div>
                                                    </div>

                                                    <Button asChild size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-900/20 font-bold gap-2 h-12 md:h-14 rounded-xl md:rounded-2xl text-base md:text-lg mt-1 md:mt-2">
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
                                    </DialogContent>
                                </Dialog>
                            )
                        })}
                    </div>
                )
            }
        </div>
    )
}
