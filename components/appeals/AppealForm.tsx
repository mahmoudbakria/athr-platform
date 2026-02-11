"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from 'lucide-react'

interface AppealFormProps {
    initialData?: {
        title: string
        category: string
        city: string
        target_amount?: number | null
        contact_info: string
        story: string
    }
    action: (formData: FormData) => void
    isPending: boolean
    submitLabel?: string
}

import { createClient } from "@/lib/supabase"
import { useEffect, useState } from "react"

const hardcodedCategories = [
    'Medical',
    'Financial',
    'Education',
    'Food',
    'Debt',
    'Home',
    'Other'
]

export function AppealForm({ initialData, action, isPending, submitLabel = "إرسال الطلب" }: AppealFormProps) {
    const [categories, setCategories] = useState<any[]>([])

    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('appeal_categories')
                .select('name')
                .eq('is_active', true)
                .order('name')

            if (!error && data) {
                setCategories(data)
            } else {
                // Fallback if fetch fails
                setCategories(hardcodedCategories.map(c => ({ name: c })))
            }
        }
        fetchCategories()
    }, [])

    return (
        <form action={action} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
                <Label htmlFor="title">عنوان الطلب *</Label>
                <Input
                    id="title"
                    name="title"
                    defaultValue={initialData?.title}
                    placeholder="مثلاً: بحاجة لمساعدة لإجراء عملية جراحية عاجلة"
                    required
                    minLength={5}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="category">التصنيف *</Label>
                <Select name="category" required defaultValue={initialData?.category}>
                    <SelectTrigger>
                        <SelectValue placeholder="اختر تصنيفاً" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="city">المدينة / المنطقة *</Label>
                <Input
                    id="city"
                    name="city"
                    defaultValue={initialData?.city}
                    placeholder="مثلاً: عرابة، ديرحنا"
                    required
                    minLength={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="target_amount">المبلغ المستهدف ($) (اختياري)</Label>
                <Input
                    id="target_amount"
                    name="target_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={initialData?.target_amount || ''}
                    placeholder="0.00"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact_info">رقم التواصل *</Label>
                <Input
                    id="contact_info"
                    name="contact_info"
                    defaultValue={initialData?.contact_info}
                    placeholder="رقم الواتساب أو الهاتف"
                    required
                />
                <p className="text-xs text-muted-foreground">مهم ليتمكن المتبرعون من الوصول إليك.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="story">القصة *</Label>
                <Textarea
                    id="story"
                    name="story"
                    defaultValue={initialData?.story}
                    placeholder="يرجى شرح سبب حاجتك للمساعدة..."
                    className="min-h-[150px]"
                    required
                    minLength={20}
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="w-full md:w-auto">
                    {isPending ? (
                        <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري المعالجة...
                        </>
                    ) : submitLabel}
                </Button>
            </div>
        </form>
    )
}
