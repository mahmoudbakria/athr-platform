'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { resetPassword } from "../actions"
import Link from "next/link"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

const initialState = {
    error: '',
    success: false,
}

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const email = formData.get('email') as string
        const result = await resetPassword(email)
        if (result?.error) {
            return { error: result.error, success: false }
        }
        return { error: '', success: true }
    }, initialState)

    useEffect(() => {
        if (state.error) {
            toast.error(state.error)
        }
        if (state.success) {
            toast.success("تم إرسال رابط إعادة تعيين كلمة المرور! تحقق من بريدك الإلكتروني.")
        }
    }, [state.error, state.success])

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4" dir="rtl">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border text-right">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">نسيت كلمة المرور</CardTitle>
                    <CardDescription>
                        أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
                    </CardDescription>
                </CardHeader>
                {state.success ? (
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-green-50 p-4 border border-green-200 text-green-800 text-sm">
                            <p className="font-medium">تحقق من بريدك الإلكتروني</p>
                            <p>لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.</p>
                        </div>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/auth/login">العودة لتسجيل الدخول</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form action={formAction}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="text-right" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isPending ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                            </Button>
                            <Button asChild variant="link" className="px-0 font-normal">
                                <Link href="/auth/login" className="flex items-center text-muted-foreground hover:text-foreground gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    العودة لتسجيل الدخول
                                </Link>
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}
