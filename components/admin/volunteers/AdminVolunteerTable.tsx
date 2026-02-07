'use client'

import { useState } from 'react'
import { VolunteerDelivery } from '@/types'
import { updateVolunteerStatus, deleteVolunteerDelivery, getLogisticsData } from '@/app/admin/volunteers/actions'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Trash2, FileDown, CheckCircle } from 'lucide-react'
import { exportToCSV } from "@/lib/export-utils"

interface AdminVolunteerTableProps {
    data: VolunteerDelivery[]
}

import { VolunteerDetailsDialog } from './VolunteerDetailsDialog'
import { VolunteerEditDialog } from './VolunteerEditDialog'

export default function AdminVolunteerTable({ data }: AdminVolunteerTableProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'active' | 'deleted'>('active')

    // Filter data based on view mode
    const filteredData = data.filter(item => {
        if (viewMode === 'active') {
            return item.status !== 'cancelled'
        } else {
            return item.status === 'cancelled'
        }
    })

    async function handleApprove(id: string) {
        await handleStatusUpdate(id, 'approved')
    }

    async function handleReject(id: string) {
        await handleStatusUpdate(id, 'rejected')
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to permanently delete this request? This cannot be undone.")) return
        setLoadingId(id)
        try {
            const res = await deleteVolunteerDelivery(id)
            if (res.success) {
                toast.success("Request deleted permanently")
            } else {
                toast.error(res.error || "Failed to delete")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setLoadingId(null)
        }
    }

    async function handleStatusUpdate(id: string, status: 'approved' | 'rejected') {
        setLoadingId(id)
        try {
            const res = await updateVolunteerStatus(id, status)
            if (res?.success) {
                toast.success(`Request ${status} successfully`)
            } else {
                toast.error(res?.error || "Failed to update status")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2 border-b pb-2">
                <Button
                    variant={viewMode === 'active' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('active')}
                    className="gap-2"
                >
                    Active Requests
                    <Badge variant="secondary" className="ml-1 bg-white/20 hover:bg-white/30 text-current">
                        {data.filter(i => i.status !== 'cancelled').length}
                    </Badge>
                </Button>
                <Button
                    variant={viewMode === 'deleted' ? 'destructive' : 'ghost'}
                    onClick={() => setViewMode('deleted')}
                    className="gap-2"
                >
                    Deleted / Cancelled
                    <Badge variant="secondary" className="ml-1 bg-white/20 hover:bg-white/30 text-current">
                        {data.filter(i => i.status === 'cancelled').length}
                    </Badge>
                </Button>

                <div className="flex-1" />

                <Button
                    variant="outline"
                    onClick={async () => {
                        const { success, data: items, error } = await getLogisticsData();
                        if (!success) {
                            toast.error("Failed to fetch logistics data");
                            return;
                        }
                        const exportData = (items || []).map(item => ({
                            'Item Title': item.title,
                            'From City': item.city || '-',
                            'To City': 'N/A', // Items only have one city currently
                            'Driver Name': (item.profiles as any)?.full_name || 'Unassigned',
                            'Vehicle Type': (item.profiles as any)?.vehicle_type || '-',
                            'Status': item.status
                        }));
                        exportToCSV(`athr-deliveries-${new Date().toISOString().split('T')[0]}.csv`, exportData);
                    }}
                >
                    <FileDown className="w-4 h-4 mr-2" />
                    📥 Export to CSV
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Route</TableHead>
                            <TableHead>Date/Time</TableHead>
                            <TableHead>Car/Weight</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    {viewMode === 'active' ? 'No active volunteer requests found.' : 'No deleted requests found.'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.id} className={item.status === 'cancelled' ? 'opacity-70 bg-gray-50' : ''}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.profiles?.full_name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{item.profiles?.phone}</span>
                                            {item.contact_phone && (
                                                <span className="text-xs text-blue-600 mt-1 font-medium">
                                                    Contact: {item.contact_phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>From: {item.from_city}</span>
                                            <span>To: {item.to_city}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{format(new Date(item.delivery_date), 'MMM d, yyyy')}</span>
                                            {item.delivery_time && <span className="text-xs text-muted-foreground">{item.delivery_time}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{item.car_type}</span>
                                            <span className="text-xs text-muted-foreground">{item.max_weight_kg} kg</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[150px] truncate text-sm text-muted-foreground" title={item.notes || ''}>
                                            {item.notes || '-'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            item.status === 'approved' ? 'default' :
                                                item.status === 'rejected' ? 'destructive' :
                                                    item.status === 'cancelled' ? 'outline' : 'secondary'
                                        }
                                            className={
                                                item.status === 'cancelled' ? 'text-muted-foreground border-dashed' : ''
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <VolunteerEditDialog
                                                data={item}
                                                trigger={
                                                    <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                                                        Edit
                                                    </Button>
                                                }
                                            />
                                            <VolunteerDetailsDialog
                                                data={item}
                                                onApprove={handleApprove}
                                                onReject={handleReject}
                                                isProcessing={loadingId === item.id}
                                            />
                                            {item.status === 'pending' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    onClick={() => handleApprove(item.id)}
                                                    disabled={loadingId === item.id}
                                                    title="Approve Request"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="sr-only">Approve</span>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={loadingId === item.id}
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
