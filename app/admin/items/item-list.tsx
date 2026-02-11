'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateItemStatus, deleteItem } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import { Check, X, Search, ImageIcon, Trash2, Pencil, Filter, User, Eye, AlertTriangle, FileDown } from "lucide-react"
import { format } from "date-fns"
import { exportToCSV } from "@/lib/export-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import NextImage from "next/image"
import { Item } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Category {
    id: string
    name: string
}

export function ItemRegistry({ items, categories }: { items: Item[], categories: Category[] }) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [cityFilter, setCityFilter] = useState('')
    const [dateSort, setDateSort] = useState('newest')
    const [userFilter, setUserFilter] = useState<string | null>(null) // User ID

    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleAction = async (id: string, status: 'active' | 'rejected') => {
        setLoadingId(id)
        try {
            await updateItemStatus(id, status)
            toast.success(`Item status updated to ${status}`)
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setLoadingId(null)
        }
    }

    const handlePermanentDelete = async (id: string) => {
        setIsDeleting(true)
        try {
            await deleteItem(id)
            toast.success('Item permanently deleted')
            setItemToDelete(null)
        } catch (error) {
            toast.error('Failed to delete item')
        } finally {
            setIsDeleting(false)
        }
    }

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
            item.description?.toLowerCase().includes(search.toLowerCase())

        // Status filtering is now handled by Tabs, but we still respect the dropdown if 'all' is not selected in tabs?
        // Actually, let's make the Tabs default override the logic.
        // But wait, the original code had a dropdown. We are switching to Tabs.
        // So we will filter by `statusFilter` derived from Tabs state.
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter

        const matchesCategory = categoryFilter === 'all' || item.category_id === categoryFilter
        const matchesCity = item.city?.toLowerCase().includes(cityFilter.toLowerCase()) || cityFilter === ''
        const matchesUser = userFilter === 'guest'
            ? !item.user_id
            : (userFilter ? item.user_id === userFilter : true)

        return matchesSearch && matchesStatus && matchesCategory && matchesCity && matchesUser
    }).sort((a, b) => {
        if (dateSort === 'newest') {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        } else {
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        }
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'pending': return 'secondary';
            case 'donated': return 'default';
            case 'rejected': return 'destructive';
            case 'deleted': return 'outline'; // Or destructive outline
            default: return 'outline';
        }
    }

    const getCategoryName = (id: string | null) => {
        if (!id) return '-'
        return categories.find(c => c.id === id)?.name || '-'
    }

    return (
        <div className="space-y-4">
            {/* Main Filters */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search items..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    {userFilter && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setUserFilter(null)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            <User className="w-3 h-3 mr-2" />
                            Filtered by User (Clear)
                        </Button>
                    )}

                    {/* Status Select replaced by Tabs */}

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        placeholder="City..."
                        className="w-[140px]"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                    />

                    <Select value={dateSort} onValueChange={setDateSort}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={() => {
                            const exportData = filteredItems.map(item => ({
                                'Title': item.title,
                                'Category': getCategoryName(item.category_id),
                                'Donor Name': item.profiles?.full_name || 'Anonymous',
                                'City': item.city || '-',
                                'Status': item.status,
                                'Created At': item.created_at
                            }));
                            exportToCSV(`athr-items-${new Date().toISOString().split('T')[0]}.csv`, exportData);
                        }}
                    >
                        <FileDown className="w-4 h-4 mr-2" />
                        📥 Export to CSV
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="donated">Donated</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="deleted" className="text-red-500 data-[state=active]:text-red-600 data-[state=active]:bg-red-50">Deleted</TabsTrigger>
                </TabsList>

                {/* We just render the table once, filteredItems handles the logic based on statusFilter state */}

                {/* Table */}
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>Item Details</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => {
                                const user = item.profiles;
                                const userInitials = user?.full_name ? user.full_name[0] : 'U';

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            {item.images && item.images.length > 0 ? (
                                                <div className="relative h-10 w-10 shrink-0">
                                                    <NextImage
                                                        src={item.images[0]}
                                                        alt={item.title}
                                                        fill
                                                        className="rounded object-cover border"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                {item.title}
                                                {item.item_number && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                                                        #{item.item_number}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                {format(new Date(item.created_at), 'yyyy-MM-dd')}
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
                                                        <AvatarImage src={user.avatar_url || undefined} />
                                                        <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs group-hover:text-blue-600 transition-colors">{user.full_name || 'User'}</span>
                                                </a>
                                            ) : (
                                                <div className="flex items-center gap-2 p-1">
                                                    <Avatar className="w-6 h-6 bg-amber-100">
                                                        <AvatarFallback className="text-[10px] text-amber-600">G</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-slate-700">{(item as any).guest_name || 'Guest'}</span>
                                                        <Badge variant="outline" className="text-[10px] w-fit px-1 py-0 h-4 border-amber-200 text-amber-700 bg-amber-50">
                                                            Guest
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(item.status) as any} className={item.status === 'donated' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{getCategoryName(item.category_id)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">{item.city || '-'}</span>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1">
                                            <div className="flex justify-end gap-1">
                                                {item.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleAction(item.id, 'active')}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleAction(item.id, 'rejected')}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                                {item.status === 'active' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleAction(item.id, 'rejected')}
                                                        title="Reject/Hide"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {item.status === 'rejected' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleAction(item.id, 'active')}
                                                        title="Activate / Unhide"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {item.status === 'deleted' ? (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setItemToDelete(item.id)}
                                                        title="Permanently Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        asChild
                                                        title="Edit Item"
                                                    >
                                                        <a href={`/admin/items/${item.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                                                    asChild
                                                    title="View Item"
                                                >
                                                    <a href={`/items/${item.item_number || item.id}`} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => setItemToDelete(item.id)}
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {filteredItems.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No items found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Tabs>

            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredItems.length} of {items.length} items
            </div>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This item will be permanently removed from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => itemToDelete && handlePermanentDelete(itemToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? "Deleting..." : "Permanently Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
