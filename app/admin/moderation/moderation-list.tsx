'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateItemStatus, toggleItemUrgency } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import { Check, X, ImageIcon, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import NextImage from "next/image"
import { Item } from "@/types"

interface ModerationListProps {
    items: Item[]
}

export function ModerationList({ items }: ModerationListProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectingItem, setRejectingItem] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')

    // Filters
    const [cityFilter, setCityFilter] = useState('')
    const [userFilter, setUserFilter] = useState<string | null>(null)

    const filteredItems = items.filter(item => {
        if (cityFilter && !item.city?.toLowerCase().includes(cityFilter.toLowerCase())) return false
        if (userFilter && item.user_id !== userFilter) return false
        return true
    })

    const handleApprove = async (id: string) => {
        setLoadingId(id)
        try {
            await updateItemStatus(id, 'active')
            toast.success('Item approved')
        } catch (error) {
            toast.error('Failed to approve')
        } finally {
            setLoadingId(null)
        }
    }

    const handleRejectClick = (id: string) => {
        setRejectingItem(id)
        setRejectionReason('')
    }

    const confirmReject = async () => {
        if (!rejectingItem) return
        setLoadingId(rejectingItem)
        try {
            await updateItemStatus(rejectingItem, 'rejected', rejectionReason)
            toast.success('Item rejected')
            setRejectingItem(null)
        } catch (error) {
            toast.error('Failed to reject')
        } finally {
            setLoadingId(null)
        }
    }

    const handleUrgencyToggle = async (id: string, current: boolean) => {
        try {
            await toggleItemUrgency(id, !current)
            toast.success(`Item marked as ${!current ? 'URGENT' : 'Normal'}`)
        } catch (error) {
            toast.error('Failed to update urgency')
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-muted-foreground">No pending items to moderate.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex gap-4 items-center">
                <Input
                    placeholder="Filter by City..."
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="max-w-[200px]"
                />
                {userFilter && (
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setUserFilter(null)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                        <Check className="w-3 h-3 mr-2" /> {/* Reusing Check icon or text since User icon not imported */}
                        Filtered by User (Clear)
                    </Button>
                )}
                {/* Add Category Filter here if category data is available in items or passed as prop */}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="hidden md:table-cell">Contact</TableHead>
                            <TableHead>Urgent</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => {
                            // Assuming item.profiles is the joined user data based on common Supabase usage
                            // If not joined, we might show reduced info. Let's try to access it safely.
                            const user = (item as any).profiles;
                            const userInitials = user?.full_name ? user.full_name[0] : 'U';

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        {item.images && item.images.length > 0 ? (
                                            <div className="relative h-12 w-12 shrink-0">
                                                <NextImage
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    fill
                                                    className="rounded object-cover border"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                                                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium flex items-center gap-2">
                                            {item.title}
                                            {item.is_urgent && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">URGENT</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user ? (
                                            <a
                                                href={`/admin/users/${user.id}`}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded transition-colors group"
                                                title="View User Profile & Items"
                                            >
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs group-hover:text-blue-600 transition-colors">{user.full_name || 'User'}</span>
                                            </a>
                                        ) : <span className="text-xs text-muted-foreground">Guest</span>}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="text-sm">{item.contact_phone}</div>
                                        <div className="text-xs text-muted-foreground">{item.city}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant={item.is_urgent ? "default" : "ghost"}
                                            size="icon"
                                            className={item.is_urgent ? "bg-red-600 hover:bg-red-700 h-8 w-8" : "h-8 w-8 text-gray-400"}
                                            onClick={() => handleUrgencyToggle(item.id, item.is_urgent)}
                                            title="Mark as Urgent"
                                        >
                                            <AlertTriangle className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                            onClick={() => handleApprove(item.id)}
                                            disabled={loadingId === item.id}
                                        >
                                            {loadingId === item.id ? '...' : <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            onClick={() => handleRejectClick(item.id)}
                                            disabled={loadingId === item.id}
                                        >
                                            {loadingId === item.id ? '...' : <X className="h-4 w-4" />}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Item</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejection. This will be visible to the user.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection (e.g., Inappropriate content, Duplicate)..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectingItem(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason.trim()}>
                            Reject Item
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
