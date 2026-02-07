'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVolunteerDelivery } from '@/app/volunteer/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function VolunteerForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const res = await createVolunteerDelivery(null, formData)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success("تم إرسال طلب التطوع بنجاح! بانتظار الموافقة.")
                router.push('/my-volunteers')
            }
        } catch (err) {
            toast.error("حدث خطأ ما via يرجى المحاولة مرة أخرى.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-lg mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border text-right" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold mb-2">تطوع للتوصيل</h2>
                <p className="text-muted-foreground text-sm">ساعد في نقل الأغراض لمن يحتاجها. يتطلب موافقة المسؤول.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="from_city">من مدينة</Label>
                    <Input id="from_city" name="from_city" placeholder="مثلاً: حيفا" required className="text-right" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="to_city">إلى مدينة</Label>
                    <Input id="to_city" name="to_city" placeholder="مثلاً: القدس" required className="text-right" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="delivery_date">التاريخ</Label>
                    <Input
                        id="delivery_date"
                        name="delivery_date"
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="text-right"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="delivery_time">الوقت (اختياري)</Label>
                    <Input id="delivery_time" name="delivery_time" type="time" className="text-right" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="car_type">نوع المركبة</Label>
                    <Input id="car_type" name="car_type" placeholder="مثلاً: فان، سيارة صغيرة" required className="text-right" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="max_weight_kg">الوزن الأقصى (كغم)</Label>
                    <Input id="max_weight_kg" name="max_weight_kg" type="number" step="0.1" placeholder="مثلاً: 50" required className="text-right" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact_phone">رقم الهاتف للتواصل</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" placeholder="050xxxxxxx" required dir="ltr" className="text-right" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea id="notes" name="notes" placeholder="أي تفاصيل إضافية..." className="text-right" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </Button>
        </form>
    )
}
