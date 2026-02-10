'use client'

import { useActionState } from 'react'
import { createAppeal } from '../actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { HeartHandshake, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { AppealForm } from '@/components/appeals/AppealForm'

const initialState = {
    error: null,
    success: false
}

export default function CreateAppealPage() {
    const router = useRouter()
    const [state, formAction, isPending] = useActionState(createAppeal, initialState)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const checkAuthAndSettings = async () => {
            const supabase = createClient()

            // Check authentication first
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                const encodedError = encodeURIComponent("يجب تسجيل الدخول لتقديم طلب مساعدة")
                router.push(`/login?next=/appeals/create&error=${encodedError}`)
                return
            }

            // Check settings
            const { data: settings } = await supabase
                .from('system_settings')
                .select('key, value')
                .in('key', ['feature_appeals_enabled', 'feature_appeals_creation_enabled'])

            const appealsEnabled = settings?.find(s => s.key === 'feature_appeals_enabled')?.value ?? true
            const creationEnabled = settings?.find(s => s.key === 'feature_appeals_creation_enabled')?.value ?? true

            if (!appealsEnabled) {
                toast.error("The Appeals feature is currently disabled.")
                router.push('/')
                return
            }

            if (!creationEnabled) {
                toast.error("New appeals are currently disabled.")
                router.push('/appeals')
                return
            }
        }
        checkAuthAndSettings()
    }, [router])

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
        if (state?.success) {
            setIsSuccess(true)
            toast.success("Your request has been submitted and is under review by our team. It will appear once approved.", {
                duration: 5000,
            })

            const timer = setTimeout(() => {
                router.push('/my-appeals')
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [state, router])

    if (isSuccess) {
        return (
            <div className="container max-w-2xl py-20 px-4 text-center">
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-10 pb-10 flex flex-col items-center">
                        <div className="rounded-full bg-green-100 p-3 mb-4">
                            <HeartHandshake className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2">تم الإرسال بنجاح</h2>
                        <p className="text-green-700 max-w-md mx-auto">
                            لقد تم تقديم طلبك وهو قيد المراجعة من قبل فريقنا. سيتم توجيهك تلقائياً خلال لحظات.
                        </p>
                        <div className="mt-6">
                            <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container max-w-2xl py-10 px-4 flex flex-col justify-center min-h-[calc(100vh-200px)] mx-auto">
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <HeartHandshake className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">تقديم طلب مساعدة</CardTitle>
                    </div>
                    <CardDescription>
                        شارك قصتك واطلب المساعدة من المجتمع. يتم مراجعة جميع الطلبات من قبل المشرفين قبل نشرها.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AppealForm
                        action={formAction}
                        isPending={isPending}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

