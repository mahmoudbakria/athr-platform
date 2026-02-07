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
            toast.success("Reset link sent! Check your email.")
        }
    }, [state.error, state.success])

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Forgot password</CardTitle>
                    <CardDescription>
                        Enter your email address and we will send you a link to reset your password
                    </CardDescription>
                </CardHeader>
                {state.success ? (
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-green-50 p-4 border border-green-200 text-green-800 text-sm">
                            <p className="font-medium">Check your email</p>
                            <p>We have sent a password reset link to your email address.</p>
                        </div>
                        <Button asChild className="w-full" variant="outline">
                            <Link href="/auth/login">Back to Login</Link>
                        </Button>
                    </CardContent>
                ) : (
                    <form action={formAction}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isPending ? 'Sending link...' : 'Send Reset Link'}
                            </Button>
                            <Button asChild variant="link" className="px-0 font-normal">
                                <Link href="/auth/login" className="flex items-center text-muted-foreground hover:text-foreground">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Login
                                </Link>
                            </Button>
                        </CardFooter>
                    </form>
                )}
            </Card>
        </div>
    )
}
