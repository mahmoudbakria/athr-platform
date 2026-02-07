'use client'

import { useState } from 'react'
import { VolunteerDelivery } from '@/types'
import { updateVolunteerDeliveryDetails } from '@/app/admin/volunteers/actions'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'

interface VolunteerEditDialogProps {
    data: VolunteerDelivery
    trigger?: React.ReactNode
}

export function VolunteerEditDialog({ data, trigger }: VolunteerEditDialogProps) {
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
            const res = await updateVolunteerDeliveryDetails(data.id, formData)
            if (res.success) {
                toast.success("Volunteer details updated")
                setOpen(false)
            } else {
                toast.error(res.error || "Failed to update")
            }
        } catch (err) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Edit</span>
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Volunteer Request</DialogTitle>
                    <DialogDescription>
                        Update the details of this volunteer request.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from_city">From City</Label>
                            <Input id="from_city" name="from_city" value={formData.from_city} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="to_city">To City</Label>
                            <Input id="to_city" name="to_city" value={formData.to_city} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="delivery_date">Date</Label>
                            <Input id="delivery_date" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delivery_time">Time</Label>
                            <Input id="delivery_time" name="delivery_time" type="time" value={formData.delivery_time} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="car_type">Car Type</Label>
                            <Input id="car_type" name="car_type" value={formData.car_type} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max_weight_kg">Max Weight (kg)</Label>
                            <Input id="max_weight_kg" name="max_weight_kg" type="number" step="0.1" value={formData.max_weight_kg} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_phone">Contact Phone</Label>
                        <Input id="contact_phone" name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} className="h-24" />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
