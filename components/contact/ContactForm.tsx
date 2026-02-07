"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"
import { submitContactForm } from "@/app/contact/actions"
import { useEffect, useRef } from "react"

const initialState = {
    success: false,
    message: "",
    errors: {}
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري الإرسال...
                </>
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" />
                    إرسال الرسالة
                </>
            )}
        </Button>
    )
}

export function ContactForm() {
    const [state, formAction] = useActionState(submitContactForm, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message)
                formRef.current?.reset()
            } else {
                toast.error(state.message)
            }
        }
    }, [state])

    return (
        <Card className="w-full max-w-lg mx-auto shadow-lg">
            <CardHeader className="text-right">
                <CardTitle>أرسل لنا رسالة</CardTitle>
                <CardDescription>
                    لديك سؤال أو ملاحظة؟ املأ النموذج أدناه.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={formAction} className="space-y-4">

                    <div className="space-y-2 text-right">
                        <Label htmlFor="name">الاسم</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="اسمك"
                            className="text-right"
                        />
                        {state.errors?.name && <p className="text-red-500 text-sm opacity-80">{state.errors.name}</p>}
                    </div>

                    <div className="space-y-2 text-right">
                        <Label htmlFor="email">البريد الإلكتروني</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            className="text-right"
                        />
                        {state.errors?.email && <p className="text-red-500 text-sm opacity-80">{state.errors.email}</p>}
                    </div>

                    <div className="space-y-2 text-right">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            className="text-right"
                        />
                    </div>

                    <div className="space-y-2 text-right">
                        <Label htmlFor="subject">الموضوع</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="عن ماذا يدور موضوعك؟"
                            className="text-right"
                        />
                        {state.errors?.subject && <p className="text-red-500 text-sm opacity-80">{state.errors.subject}</p>}
                    </div>

                    <div className="space-y-2 text-right">
                        <Label htmlFor="message">الرسالة</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="أخبرنا المزيد..."
                            className="min-h-[120px] text-right"
                        />
                        {state.errors?.message && <p className="text-red-500 text-sm opacity-80">{state.errors.message}</p>}
                    </div>

                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    )
}
