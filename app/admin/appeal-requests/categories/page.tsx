'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2, Trash2, Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from "sonner"
import { useRouter } from 'next/navigation'

interface Category {
    id: string
    name: string
    slug: string
    is_active: boolean
    created_at: string
}

export default function AppealCategoriesPage() {
    const supabase = createClient()
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [newCategory, setNewCategory] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Edit state
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editName, setEditName] = useState('')

    const fetchCategories = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('appeal_categories')
            .select('*')
            .order('created_at', { ascending: true })

        if (error) {
            toast.error("Failed to fetch categories")
        } else {
            setCategories(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategory.trim()) return

        setIsSubmitting(true)
        const name = newCategory.trim()
        const slug = name

        const { error } = await supabase
            .from('appeal_categories')
            .insert({ name, slug, is_active: true })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success("Category added")
            setNewCategory('')
            fetchCategories()
            router.refresh()
        }
        setIsSubmitting(false)
    }

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editName.trim()) return

        setIsSubmitting(true)

        const { error } = await supabase
            .from('appeal_categories')
            .update({
                name: editName.trim(),
                slug: editName.trim()
            })
            .eq('id', editingCategory.id)

        if (error) {
            toast.error(error.message || "Failed to update category")
        } else {
            toast.success("Category updated")
            fetchCategories()
            setEditingCategory(null)
            router.refresh()
        }
        setIsSubmitting(false)
    }

    const toggleActive = async (id: string, currentState: boolean) => {
        const { error } = await supabase
            .from('appeal_categories')
            .update({ is_active: !currentState })
            .eq('id', id)

        if (error) {
            toast.error("Failed to update category")
        } else {
            toast.success("Category updated")
            fetchCategories()
            router.refresh()
        }
    }

    const deleteCategory = async (id: string) => {
        if (!confirm("Are you sure? This might break existing appeals linked to this category.")) return

        const { error } = await supabase
            .from('appeal_categories')
            .delete()
            .eq('id', id)

        if (error) {
            toast.error("Failed to delete category")
        } else {
            toast.success("Category deleted")
            fetchCategories()
            router.refresh()
        }
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Appeal Categories</h1>
                    <p className="text-muted-foreground">Manage the active categories for community appeals.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* List Column */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Categories List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((cat) => (
                                        <TableRow key={cat.id}>
                                            <TableCell className="font-medium">{cat.name}</TableCell>
                                            <TableCell>
                                                <Badge variant={cat.is_active ? "default" : "secondary"}>
                                                    {cat.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                <Switch
                                                    checked={cat.is_active}
                                                    onCheckedChange={() => toggleActive(cat.id, cat.is_active)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingCategory(cat)
                                                        setEditName(cat.name)
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => deleteCategory(cat.id)}
                                                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {categories.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                No categories found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Add Form Column */}
                <Card className="h-fit sticky top-10">
                    <CardHeader>
                        <CardTitle>Add Category</CardTitle>
                        <CardDescription>Add a new category for users to select.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Housing"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Add Category
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update the category name.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Name</Label>
                            <Input
                                id="edit-name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                        <Button onClick={handleUpdateCategory} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
