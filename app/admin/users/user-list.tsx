'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Search, UserPlus, Trash2, Ban, Shield, MessageCircle, Mail, FileDown } from "lucide-react"
import { exportToCSV } from "@/lib/export-utils"
import { Switch } from "@/components/ui/switch"
import { toggleUserBan } from "../actions"
import { toast } from "sonner"
import { Profile } from "@/types"

export function UserList({ users }: { users: Profile[] }) {
    const [search, setSearch] = useState('')

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        user.role?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search)
    )

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        try {
            await toggleUserBan(userId, !currentStatus)
            toast.success(`User ${!currentStatus ? 'banned' : 'unbanned'}`)
        } catch (error) {
            toast.error('Failed to update user status')
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/admin/users/create">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    onClick={() => {
                        const exportData = filteredUsers.map(u => ({
                            'Name': u.full_name || 'Anonymous',
                            'Email': u.email || '-',
                            'Phone': u.phone || '-',
                            'City': (u as any).city || '-',
                            'Role': u.role,
                            'Verification Status': u.is_banned ? 'Banned' : 'Active',
                            'Total Points': u.points || 0
                        }));
                        exportToCSV(`athr-users-${new Date().toISOString().split('T')[0]}.csv`, exportData);
                    }}
                >
                    <FileDown className="w-4 h-4 mr-2" />
                    📥 Export to CSV
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Contacts</TableHead>
                            <TableHead>Points / Deliv</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Ban</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => {
                            const initials = user.full_name
                                ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                : 'U';

                            const pointsDisplay = typeof user.points === 'number' && !Number.isInteger(user.points)
                                ? user.points.toFixed(1)
                                : user.points || 0;

                            const volunteerPointsDisplay = typeof user.volunteer_points === 'number' && !Number.isInteger(user.volunteer_points)
                                ? user.volunteer_points.toFixed(1)
                                : user.volunteer_points || 0;

                            return (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Link href={`/admin/users/${user.id}`}>
                                            <Avatar className="hover:opacity-80 transition-opacity cursor-pointer">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback>{initials}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/admin/users/${user.id}`} className="block group">
                                            <div className="font-medium group-hover:text-blue-600 group-hover:underline transition-all">
                                                {user.full_name || 'Anonymous'}
                                            </div>
                                            <div className="text-xs text-muted-foreground">ID: {user.id.substring(0, 8)}...</div>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-medium flex items-center gap-2">
                                                {user.phone || '-'}
                                                {user.phone && (
                                                    <a
                                                        href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-500 hover:text-green-600 transition-colors"
                                                        title="Chat on WhatsApp"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                {user.email}
                                                <a
                                                    href={`mailto:${user.email}`}
                                                    className="text-blue-500 hover:text-blue-600 transition-colors"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-yellow-600">
                                            {pointsDisplay} <span className="text-muted-foreground font-normal">/ {volunteerPointsDisplay}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'secondary' : 'outline'}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_banned ? (
                                            <Badge variant="destructive">Banned</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.is_banned}
                                            onCheckedChange={() => handleBanToggle(user.id, user.is_banned)}
                                        />
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
