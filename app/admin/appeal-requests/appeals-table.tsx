'use client'

import { Check, X, Trash2, Eye, FileDown, Pencil } from 'lucide-react'
import { exportToCSV } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { EditAppealDialog } from "@/components/appeals/EditAppealDialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { updateAppealStatus, deleteAppeal } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Appeal {
    id: string
    title: string
    story: string
    target_amount?: number
    category: string
    city?: string // New
    admin_note?: string // New
    contact_info: string
    created_at: string
    status: 'pending' | 'approved' | 'rejected' | 'closed' | 'deleted'
    user_id: string
    profiles?: {
        full_name: string | null
        email?: string | null
    } | null
}

interface ItemRegistryProps {
    appeals: Appeal[]
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AppealsTable({ appeals }: ItemRegistryProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("pending")

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        setLoadingId(id)
        try {
            await updateAppealStatus(id, status)
            toast.success(status === 'approved' ? "Appeal Approved" : "Appeal Rejected")
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this appeal? This cannot be undone.")) return

        setLoadingId(id)
        try {
            await deleteAppeal(id)
            toast.success("Appeal Deleted")
        } catch (error) {
            toast.error("Failed to delete appeal")
        } finally {
            setLoadingId(null)
        }
    }

    const filteredAppeals = appeals.filter(appeal => {
        if (activeTab === 'all') return true
        return appeal.status === activeTab
    })

    const renderTable = (items: Appeal[]) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-slate-50 border-dashed">
                    <div className="text-muted-foreground">No appeals found in this category.</div>
                </div>
            )
        }
        return (
            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title / User</TableHead>
                            <TableHead>Category / Location</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((appeal) => (
                            <TableRow key={appeal.id}>
                                <TableCell>
                                    <div className="font-medium">{appeal.title}</div>
                                    <div className="text-sm text-muted-foreground">
                                        by {appeal.profiles?.full_name || 'Unknown'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="mb-1">{appeal.category}</Badge>
                                    <div className="text-xs text-muted-foreground">
                                        {appeal.city || '-'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {appeal.target_amount ? `$${appeal.target_amount}` : '-'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(appeal.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        appeal.status === 'approved' ? 'default' :
                                            appeal.status === 'rejected' ? 'destructive' :
                                                appeal.status === 'deleted' ? 'outline' : // Destructive outline or similar
                                                    appeal.status === 'pending' ? 'secondary' : 'outline'
                                    } className={appeal.status === 'deleted' ? 'border-red-200 text-red-400 bg-red-50' : ''}>
                                        {appeal.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" title="View Details">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{appeal.title}</DialogTitle>
                                                    <DialogDescription>
                                                        Posted by {appeal.profiles?.full_name} on {new Date(appeal.created_at).toLocaleDateString()}
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4 pt-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-1">Story</h4>
                                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{appeal.story}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Category</h4>
                                                            <span className="text-sm">{appeal.category}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Location</h4>
                                                            <span className="text-sm">{appeal.city || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Target Amount</h4>
                                                            <span className="text-sm">{appeal.target_amount ? `$${appeal.target_amount}` : 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Contact Info</h4>
                                                            <span className="text-sm">{appeal.contact_info}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-1">User Email</h4>
                                                            <span className="text-sm">{appeal.profiles?.email || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-1">Status</h4>
                                                            <Badge>{appeal.status}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        {appeal.status === 'pending' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    onClick={() => handleStatusUpdate(appeal.id, 'approved')}
                                                    disabled={loadingId === appeal.id}
                                                    title="Approve"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleStatusUpdate(appeal.id, 'rejected')}
                                                    disabled={loadingId === appeal.id}
                                                    title="Reject"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}

                                        <EditAppealDialog
                                            appeal={appeal}
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            }
                                        />

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(appeal.id)}
                                            disabled={loadingId === appeal.id}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div >
        )
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="pending">Pending ({appeals.filter(a => a.status === 'pending').length})</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        <TabsTrigger value="deleted">Deleted</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    <Button
                        variant="outline"
                        onClick={() => {
                            const exportData = filteredAppeals.map(a => ({
                                'Requester Name': a.profiles?.full_name || 'Unknown',
                                'Item Needed': a.title,
                                'City': a.city || '-',
                                'Urgency Level': (a as any).urgency_level || (a.status === 'pending' ? 'High' : 'Normal'),
                                'Status': a.status
                            }));
                            exportToCSV(`athr-appeals-${new Date().toISOString().split('T')[0]}.csv`, exportData);
                        }}
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        📥 Export to CSV
                    </Button>
                </div>

                <TabsContent value="pending" className="mt-4">
                    {renderTable(appeals.filter(a => a.status === 'pending'))}
                </TabsContent>
                <TabsContent value="approved" className="mt-4">
                    {renderTable(appeals.filter(a => a.status === 'approved'))}
                </TabsContent>
                <TabsContent value="rejected" className="mt-4">
                    {renderTable(appeals.filter(a => a.status === 'rejected'))}
                </TabsContent>
                <TabsContent value="deleted" className="mt-4">
                    {renderTable(appeals.filter(a => a.status === 'deleted'))}
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                    {renderTable(appeals)}
                </TabsContent>
            </Tabs>
        </div>
    )
}
