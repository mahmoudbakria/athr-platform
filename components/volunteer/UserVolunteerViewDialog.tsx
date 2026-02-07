'use client'

import { useState } from 'react'
import { VolunteerDelivery } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { Calendar, MapPin, Phone, Truck, FileText, Eye, Trash2 } from 'lucide-react'
import { UserVolunteerEditDialog } from './UserVolunteerEditDialog'
import { cancelVolunteerDelivery } from '@/app/volunteer/actions'
import { toast } from 'sonner'

interface UserVolunteerViewDialogProps {
    data: VolunteerDelivery
    trigger?: React.ReactNode
}

export function UserVolunteerViewDialog({ data, trigger }: UserVolunteerViewDialogProps) {
    const [open, setOpen] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    async function handleCancel() {
        if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟")) return
        setIsCancelling(true)
        try {
            await cancelVolunteerDelivery(data.id)
            toast.success("تم حذف الطلب")
            setOpen(false)
        } catch {
            toast.error("فشل الحذف")
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="w-full">
                        <Eye className="ml-2 h-4 w-4" /> عرض التفاصيل
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md text-right" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle>تفاصيل الطلب</DialogTitle>
                    <DialogDescription>
                        التفاصيل الكاملة لعرض التطوع الخاص بك.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Status Badge */}
                    <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                        <span className="text-sm font-medium">الحالة</span>
                        <Badge variant={
                            data.status === 'approved' ? 'default' :
                                data.status === 'rejected' ? 'destructive' :
                                    data.status === 'cancelled' ? 'outline' : 'secondary'
                        }
                            className={
                                data.status === 'cancelled' ? 'text-muted-foreground border-dashed' : ''
                            }
                        >
                            {data.status === 'approved' ? 'موافق عليه' :
                                data.status === 'rejected' ? 'مرفوض' :
                                    data.status === 'cancelled' ? 'ملغي' : 'قيد المراجعة'}
                        </Badge>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-2 gap-4 text-right">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> من
                            </span>
                            <span className="font-medium text-sm">{data.from_city}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> إلى
                            </span>
                            <span className="font-medium text-sm">{data.to_city}</span>
                        </div>
                    </div>

                    {/* Timing & Vehicle */}
                    <div className="grid grid-cols-2 gap-4 text-right">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> التاريخ والوقت
                            </span>
                            <span className="font-medium text-sm block">
                                {format(new Date(data.delivery_date), 'PPP', { locale: ar })}
                            </span>
                            <span className="font-medium text-sm block">
                                {data.delivery_time || 'أي وقت'}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Truck className="h-3 w-3" /> المركبة والحمولة
                            </span>
                            <span className="font-medium text-sm block">{data.car_type}</span>
                            <span className="font-medium text-sm block">بحد أقصى {data.max_weight_kg} كجم</span>
                        </div>
                    </div>

                    {/* Contact Phone */}
                    {data.contact_phone && (
                        <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 text-right">
                            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
                                <Phone className="h-3 w-3" /> رقم التواصل
                            </span>
                            <span className="font-medium text-sm text-right block" dir="ltr">{data.contact_phone}</span>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1 text-right">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" /> ملاحظات
                        </span>
                        <p className="text-sm bg-muted p-2 rounded-md whitespace-pre-wrap">
                            {data.notes || 'لا توجد ملاحظات إضافية.'}
                        </p>
                    </div>
                </div>

                {data.status === 'pending' && (
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto"
                            onClick={handleCancel}
                            disabled={isCancelling}
                        >
                            <Trash2 className="ml-2 h-4 w-4" />
                            {isCancelling ? 'جاري الحذف...' : 'حذف'}
                        </Button>
                        <UserVolunteerEditDialog
                            data={data}
                            trigger={
                                <Button className="w-full sm:w-auto">
                                    تعديل الطلب
                                </Button>
                            }
                        />
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}
