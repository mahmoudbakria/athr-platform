'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { login, signup, getGoogleAuthSetting, signInWithGoogle } from "@/app/auth/actions"
import Link from "next/link"
import { useActionState, useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { FcGoogle } from "react-icons/fc"
import { Loader2 } from "lucide-react"
import { RegistrationSuccess } from "./RegistrationSuccess"

import { useSearchParams } from "next/navigation"

const initialState = {
    error: '',
    success: false,
    email: ''
}

export function AuthForm({ initialMode = 'login', errorMessage }: { initialMode?: 'login' | 'signup', errorMessage?: string }) {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
    const [enableGoogle, setEnableGoogle] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const searchParams = useSearchParams()
    const next = searchParams.get('next')
    const lastToastRef = useRef<string | null>(null)

    // Login Action State
    const [loginState, loginAction, loginPending] = useActionState(async (prevState: any, formData: FormData) => {
        const result = await login(formData)
        if (result?.error) return { error: result.error }
        return { error: '' }
    }, initialState)

    // Signup Action State
    const [signupState, signupAction, signupPending] = useActionState(async (prevState: any, formData: FormData) => {
        const email = formData.get('email') as string
        const result = await signup(formData)
        if (result?.error) return { error: result.error, success: false }
        return { error: '', success: true, email }
    }, initialState)


    useEffect(() => {
        getGoogleAuthSetting().then(setEnableGoogle)
    }, [])

    useEffect(() => {
        if (errorMessage && lastToastRef.current !== errorMessage) {
            toast.error(errorMessage, { id: 'auth-error' })
            lastToastRef.current = errorMessage
        }
    }, [errorMessage])

    useEffect(() => {
        if (loginState.error) toast.error(loginState.error)
        if (signupState.error) toast.error(signupState.error)
    }, [loginState.error, signupState.error])

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        try {
            const result = await signInWithGoogle()
            if (result?.error) toast.error(result.error)
        } catch (error) {
            toast.error("فشل في بدء تسجيل الدخول عبر Google")
        } finally {
            setGoogleLoading(false)
        }
    }

    if (signupState.success && signupState.email) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4">
                <RegistrationSuccess email={signupState.email} />
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-muted/20 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 sm:border">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {mode === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'login'
                            ? 'أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك'
                            : 'أدخل معلوماتك للبدء في استخدام المنصة'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">تسجيل دخول</TabsTrigger>
                            <TabsTrigger value="signup">إنشاء حساب</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form action={loginAction} className="space-y-4">
                                {next && <input type="hidden" name="next" value={next} />}
                                <div className="space-y-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input id="email" name="email" type="email" placeholder="بريدك الإلكتروني" required className="text-right" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">كلمة المرور</Label>
                                        <Link
                                            href="/auth/forgot-password"
                                            className="text-xs text-primary hover:underline font-medium"
                                        >
                                            نسيت كلمة المرور؟
                                        </Link>
                                    </div>
                                    <Input id="password" name="password" type="password" required className="text-right" />
                                </div>
                                <Button type="submit" className="w-full" disabled={loginPending}>
                                    {loginPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {loginPending ? 'جاري الدخول...' : 'تسجيل دخول'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form action={signupAction} className="space-y-4">
                                {next && <input type="hidden" name="next" value={next} />}
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">الاسم الكامل</Label>
                                    <Input id="full_name" name="full_name" placeholder="الاسم هنا" required className="text-right" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">البريد الإلكتروني</Label>
                                        <Input id="signup-email" name="email" type="email" placeholder="example@mail.com" required className="text-right" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">الهاتف</Label>
                                        <Input id="phone" name="phone" type="tel" placeholder="+970..." className="text-right" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">كلمة المرور</Label>
                                    <Input id="signup-password" name="password" type="password" required minLength={6} className="text-right" />
                                </div>
                                <Button type="submit" className="w-full" disabled={signupPending}>
                                    {signupPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {signupPending ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {enableGoogle && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        أو المتابعة باستخدام
                                    </span>
                                </div>
                            </div>
                            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleLogin} disabled={googleLoading}>
                                {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-4 w-4" />}
                                Google
                            </Button>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <p className="text-center text-sm text-muted-foreground w-full">
                        بالنقر على متابعة، فإنك توافق على{" "}
                        <Link href="/terms" className="underline hover:text-primary">
                            شروط الخدمة
                        </Link>{" "}
                        و{" "}
                        <Link href="/privacy" className="underline hover:text-primary">
                            سياسة الخصوصية
                        </Link>
                        .
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
