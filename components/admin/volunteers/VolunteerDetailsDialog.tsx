'use client'

import { VolunteerDelivery } from '@/types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Calendar, MapPin, Phone, Truck, User, FileText } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface VolunteerDetailsDialogProps {
    data: VolunteerDelivery
    trigger?: React.ReactNode
    onApprove: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
    isProcessing: boolean
}

export function VolunteerDetailsDialog({ data, trigger, onApprove, onReject, isProcessing }: VolunteerDetailsDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">View</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Volunteer Request Details</DialogTitle>
                    <DialogDescription>
                        Review the details submitted by the volunteer.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* User Profile Section */}
                    <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg">
                        <Avatar>
                            <AvatarFallback>
                                {data.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{data.profiles?.full_name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{data.profiles?.email}</p>
                            <p className="text-xs text-muted-foreground">{data.profiles?.phone || 'No profile phone'}</p>
                        </div>
                        <div className="ml-auto">
                            <Badge variant={data.status === 'approved' ? 'default' : data.status === 'rejected' ? 'destructive' : 'secondary'}>
                                {data.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Route Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> From
                            </span>
                            <span className="font-medium text-sm">{data.from_city}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> To
                            </span>
                            <span className="font-medium text-sm">{data.to_city}</span>
                        </div>
                    </div>

                    {/* Timing & Vehicle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date & Time
                            </span>
                            <span className="font-medium text-sm block">
                                {format(new Date(data.delivery_date), 'MMM d, yyyy')}
                            </span>
                            <span className="font-medium text-sm block">
                                {data.delivery_time || 'Any time'}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Truck className="h-3 w-3" /> Vehicle & Load
                            </span>
                            <span className="font-medium text-sm block">{data.car_type}</span>
                            <span className="font-medium text-sm block">Max {data.max_weight_kg} kg</span>
                        </div>
                    </div>

                    {/* Contact Phone */}
                    {data.contact_phone && (
                        <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
                            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-semibold">
                                <Phone className="h-3 w-3" /> Contact Phone
                            </span>
                            <span className="font-medium text-sm">{data.contact_phone}</span>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Notes
                        </span>
                        <p className="text-sm bg-muted p-2 rounded-md whitespace-pre-wrap">
                            {data.notes || 'No additional notes provided.'}
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    {data.status === 'pending' && (
                        <>
                            <Button
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => onApprove(data.id)}
                                disabled={isProcessing}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                                onClick={() => onReject(data.id)}
                                disabled={isProcessing}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
