'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePassword } from "../actions"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const initialState = {
    error: '',
    success: false,
}

export default function UpdatePasswordPage() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        const password = formData.get('password') as string
        const result = await updatePassword(password)
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
            toast.success("Password updated successfully")
            // Redirect after a short delay
            setTimeout(() => {
                router.push("/auth/login")
            }, 2000)
        }
    }, [state.error, state.success, router])

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Update password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isPending ? 'Updating...' : 'Update Password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
