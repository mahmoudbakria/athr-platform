'use client'

import { VolunteerDelivery } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { MapPin, Truck, Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserVolunteerViewDialog } from './UserVolunteerViewDialog'
import { UserVolunteerEditDialog } from './UserVolunteerEditDialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { cancelVolunteerDelivery } from '@/app/volunteer/actions'

interface VolunteerListProps {
    data: VolunteerDelivery[]
}

export default function VolunteerList({ data }: VolunteerListProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">لا يوجد طلبات تطوع بعد</h3>
                <p className="text-muted-foreground mt-1 mb-4">لم تقم بالتطوع لأي عمليات توصيل بعد.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'approved' ? 'bg-green-500' :
                        item.status === 'rejected' ? 'bg-red-500' :
                            item.status === 'cancelled' ? 'bg-gray-400' : 'bg-yellow-500'
                        }`} />
                    <CardHeader className="pb-3 pl-6">
                        <div className="flex justify-between items-start">
                            <Badge variant={
                                item.status === 'approved' ? 'default' :
                                    item.status === 'rejected' ? 'destructive' :
                                        item.status === 'cancelled' ? 'outline' : 'secondary'
                            } className={
                                item.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-none' :
                                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-none' :
                                        item.status === 'cancelled' ? 'text-muted-foreground border-dashed' : ''
                            }>

                                {item.status === 'approved' ? 'موافق عليه' :
                                    item.status === 'rejected' ? 'مرفوض' :
                                        item.status === 'cancelled' ? 'ملغي' : 'قيد المراجعة'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(item.created_at), 'd MMM', { locale: ar })}
                            </span>
                        </div>
                        <CardTitle className="flex items-center gap-2 text-lg mt-2">
                            <span className="truncate">{item.from_city}</span>
                            <span className="text-muted-foreground">←</span>
                            <span className="truncate">{item.to_city}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pl-6 space-y-3 text-sm">
                        <div className="flex items-center text-muted-foreground">
                            <Calendar className="ml-2 h-4 w-4" />
                            <span>
                                {format(new Date(item.delivery_date), 'PPP', { locale: ar })}
                                {item.delivery_time && ` في ${item.delivery_time}`}
                            </span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <Truck className="ml-2 h-4 w-4" />
                            <span>{item.car_type} • بحد أقصى {item.max_weight_kg} كجم</span>
                        </div>
                        {item.notes && (
                            <div className="mt-2 text-xs bg-muted/50 p-2 rounded italic text-muted-foreground">
                                "{item.notes}"
                            </div>
                        )}
                        <div className="mt-4 pt-2 border-t flex flex-col gap-2">
                            <UserVolunteerViewDialog data={item} />
                            <UserVolunteerEditDialog data={item} />
                            <CancelButton id={item.id} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function CancelButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    async function handleCancel() {
        if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟")) return
        setLoading(true)
        try {
            await cancelVolunteerDelivery(id)
            toast.success("تم حذف الطلب")
        } catch {
            toast.error("فشل الحذف")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleCancel}
            disabled={loading}
        >
            <Trash2 className="ml-2 h-4 w-4" />
            {loading ? 'جاري الحذف...' : 'حذف الطلب'}
        </Button>
    )
}
