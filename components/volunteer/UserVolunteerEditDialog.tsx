'use client'

import { useState } from 'react'
import { VolunteerDelivery } from '@/types'
import { updateUserVolunteerDelivery } from '@/app/volunteer/actions'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

interface UserVolunteerEditDialogProps {
    data: VolunteerDelivery
    trigger?: React.ReactNode
}

export function UserVolunteerEditDialog({ data, trigger }: UserVolunteerEditDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        from_city: data.from_city,
        to_city: data.to_city,
        delivery_date: data.delivery_date,
        delivery_time: data.delivery_time || '',
        car_type: data.car_type,
        max_weight_kg: data.max_weight_kg || '',
        notes: data.notes || '',
        contact_phone: data.contact_phone || ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }


    async function handleSave() {
        setLoading(true)
        try {
            const payload = {
                ...formData,
                max_weight_kg: formData.max_weight_kg ? parseFloat(formData.max_weight_kg.toString()) : null
            }
            const res = await updateUserVolunteerDelivery(data.id, payload)
            if (res.success) {
                toast.success("تم تحديث الطلب بنجاح")
                setOpen(false)
            } else {
                toast.error(res.error || "فشل التحديث")
            }
        } catch (err) {
            toast.error("حدث خطأ ما")
        } finally {
            setLoading(false)
        }
    }

    // Only allow editing if pending
    // if (data.status !== 'pending') return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="w-full">
                        <Pencil className="ml-2 h-4 w-4" /> تعديل
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg text-right" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>تعديل طلب التطوع</DialogTitle>
                    <DialogDescription>
                        قم بتحديث تفاصيل طلب التطوع الخاص بك.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from_city">من مدينة</Label>
                            <Input id="from_city" name="from_city" value={formData.from_city} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to_city">إلى مدينة</Label>
                            <Input id="to_city" name="to_city" value={formData.to_city} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="delivery_date">التاريخ</Label>
                            <Input id="delivery_date" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery_time">الوقت</Label>
                            <Input id="delivery_time" name="delivery_time" type="time" value={formData.delivery_time} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="car_type">نوع المركبة</Label>
                            <Input id="car_type" name="car_type" value={formData.car_type} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_weight_kg">الوزن الأقصى (كجم)</Label>
                            <Input id="max_weight_kg" name="max_weight_kg" type="number" step="0.1" value={formData.max_weight_kg} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_phone">رقم التواصل</Label>
                        <Input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} className="text-right" dir="ltr" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="h-24" />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>إلغاء</Button>
                    <Button onClick={handleSave} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
