'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createCategory, updateCategory, deleteCategory, createSubCategory, deleteSubCategory, updateSubCategory } from "./actions"
import { toast } from "sonner"
import { useState, Fragment } from "react"
import { Plus, Pencil, Trash2, Folder, ChevronRight, ChevronDown, CornerDownRight } from "lucide-react"
import NextImage from "next/image"
import { supabase } from "@/lib/supabase" // CLIENT side client
import { Category, SubCategory } from "@/types"

interface CategoryWithSubs extends Category {
    sub_categories: SubCategory[]
}

export function CategoryList({ categories }: { categories: CategoryWithSubs[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubOpen, setIsSubOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
    const [targetParentId, setTargetParentId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpandedRows(newExpanded)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const uploadImage = async (file: File) => {
        // Compression options
        const options = {
            maxSizeMB: 0.5, // Categories don't need huge images
            maxWidthOrHeight: 800,
            useWebWorker: true,
            initialQuality: 0.7
        }

        let compressedFile = file
        try {
            const imageCompression = (await import('browser-image-compression')).default
            compressedFile = await imageCompression(file, options)
        } catch (err) {
            console.error("Compression failed, uploading original:", err)
        }

        const fileExt = compressedFile.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('category-images')
            .upload(filePath, compressedFile)

        if (uploadError) {
            throw uploadError
        }

        const { data } = supabase.storage.from('category-images').getPublicUrl(filePath)
        return data.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)
        const fileInput = (e.currentTarget.elements.namedItem('file') as HTMLInputElement)
        const file = fileInput.files?.[0]

        try {
            let imageUrl = formData.get('icon') as string

            if (file) {
                imageUrl = await uploadImage(file)
                formData.set('icon', imageUrl)
            }

            if (editingCategory) {
                const res = await updateCategory(editingCategory.id, formData)
                if (res?.error) toast.error(res.error)
                else toast.success('Category updated')
            } else {
                const res = await createCategory(formData)
                if (res?.error) toast.error(res.error)
                else toast.success('Category created')
            }
            setIsOpen(false)
            setEditingCategory(null)
            setPreviewUrl(null)
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        if (targetParentId) {
            formData.append('category_id', targetParentId)
        }

        try {
            if (editingSubCategory) {
                const res = await updateSubCategory(editingSubCategory.id, formData)
                if (res?.error) toast.error(res.error)
                else toast.success('Sub-Category updated')
            } else {
                const res = await createSubCategory(formData)
                if (res?.error) toast.error(res.error)
                else toast.success('Sub-Category added')
            }
            setIsSubOpen(false)
            setTargetParentId(null)
            setEditingSubCategory(null)
        } catch (error) {
            console.error(error)
            toast.error('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This might affect items in this category.')) return

        try {
            const res = await deleteCategory(id)
            if (res?.error) toast.error(res.error)
            else toast.success('Category deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const handleDeleteSub = async (id: number) => {
        if (!confirm('Are you sure? This action is irreversible.')) return

        try {
            const res = await deleteSubCategory(id)
            if (res?.error) toast.error(res.error)
            else toast.success('Sub-Category deleted')
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const openEdit = (category: Category) => {
        setEditingCategory(category)
        setPreviewUrl(category.icon)
        setIsOpen(true)
    }

    const openCreate = () => {
        setEditingCategory(null)
        setPreviewUrl(null)
        setIsOpen(true)
    }

    const openAddSub = (parentId: string) => {
        setEditingSubCategory(null)
        setTargetParentId(parentId)
        setIsSubOpen(true)
    }

    const openEditSub = (sub: SubCategory) => {
        setEditingSubCategory(sub)
        setIsSubOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Main Category
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <Fragment key={category.id}>
                                <TableRow key={category.id} className="group">
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => toggleRow(category.id)}
                                        >
                                            {expandedRows.has(category.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center h-10 w-10 rounded bg-muted overflow-hidden border relative">
                                            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/')) ? (
                                                <NextImage
                                                    src={category.icon}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <Folder className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {category.name}
                                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                                            ({category.sub_categories?.length || 0} sub-categories)
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => openAddSub(category.id)}>
                                            <Plus className="h-3 w-3 mr-1" /> Sub
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(category)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                {expandedRows.has(category.id) && (
                                    <TableRow className="bg-muted/30">
                                        <TableCell colSpan={5} className="p-0">
                                            <div className="p-4 pl-16 space-y-2">
                                                {category.sub_categories && category.sub_categories.length > 0 ? (
                                                    <div className="grid gap-2">
                                                        {category.sub_categories.map((sub) => (
                                                            <div key={sub.id} className="flex items-center justify-between border rounded p-2 bg-white">
                                                                <div className="flex items-center gap-2">
                                                                    <CornerDownRight className="h-4 w-4 text-muted-foreground" />
                                                                    <span>{sub.name}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => openEditSub(sub)}
                                                                    >
                                                                        <Pencil className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-6 w-6 text-red-500 hover:text-red-600"
                                                                        onClick={() => handleDeleteSub(sub.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground pl-6">No sub-categories yet.</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Main Category Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={editingCategory?.name} required placeholder="e.g. Furniture" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" name="slug" defaultValue={editingCategory?.slug} required placeholder="e.g. furniture" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">Category Image</Label>
                            <Input id="file" name="file" type="file" accept="image/*" onChange={handleFileChange} />
                            <input type="hidden" name="icon" value={editingCategory?.icon || ''} />
                            {previewUrl && (
                                <div className="mt-2 text-center border p-2 rounded-md bg-slate-50 relative h-36">
                                    <NextImage
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Sub Category Dialog */}
            <Dialog open={isSubOpen} onOpenChange={setIsSubOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSubCategory ? 'Edit Sub-Category' : 'Add Sub-Category'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sub-name">Sub-Category Name</Label>
                            <Input id="sub-name" name="name" defaultValue={editingSubCategory?.name} required placeholder="e.g. Chairs" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsSubOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
