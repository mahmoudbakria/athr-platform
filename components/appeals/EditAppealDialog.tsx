'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { AppealForm } from "./AppealForm"
import { updateAppeal } from "../../app/appeals/actions"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface EditAppealDialogProps {
    appeal: {
        id: string
        title: string
        story: string
        category: string
        city?: string | null
        target_amount?: number | null
        contact_info: string
        status: string
    }
    trigger?: React.ReactNode
    onOpenChange?: (open: boolean) => void
}

export function EditAppealDialog({ appeal, trigger }: EditAppealDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleUpdate = async (formData: FormData) => {
        setIsPending(true)
        try {
            // Bind the ID to the action
            const result = await updateAppeal(appeal.id, null, formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("تم تحديث النداء بنجاح")
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            toast.error("حدث خطأ أثناء التحديث")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تعديل النداء</DialogTitle>
                </DialogHeader>
                {/* <div>Debug: Appeal Form Disabled</div> */}
                <AppealForm
                    initialData={{
                        title: appeal.title,
                        story: appeal.story,
                        category: appeal.category,
                        city: appeal.city || '',
                        target_amount: appeal.target_amount,
                        contact_info: appeal.contact_info,
                    }}
                    action={handleUpdate}
                    isPending={isPending}
                    submitLabel="حفظ التعديلات"
                />
            </DialogContent>
        </Dialog>
    )
}
