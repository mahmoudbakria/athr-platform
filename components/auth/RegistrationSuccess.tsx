'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Mail, ArrowRight, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { resendVerificationEmail } from "@/app/auth/actions"

export function RegistrationSuccess({ email }: { email: string }) {
    const [countdown, setCountdown] = useState(0)
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleResend = async () => {
        if (countdown > 0) return

        setIsResending(true)
        try {
            const result = await resendVerificationEmail(email)
            if (result?.success) {
                toast.success("تم إرسال رابط التفعيل مرة أخرى")
                setCountdown(60)
            } else {
                toast.error(result?.error || "حدث خطأ أثناء الإرسال")
            }
        } catch (error) {
            toast.error("حدث خطأ غير متوقع")
        } finally {
            setIsResending(false)
        }
    }

    const handleOpenMail = () => {
        // Simple heuristic to try and open the right mail provider
        const domain = email.split('@')[1]
        let url = 'https://mail.google.com' // Default to Gmail as it's most common

        if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
            url = 'https://outlook.live.com'
        } else if (domain.includes('yahoo')) {
            url = 'https://mail.yahoo.com'
        } else if (domain.includes('icloud')) {
            url = 'https://www.icloud.com/mail'
        }

        window.open(url, '_blank')
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
        >
            <Card className="border-0 shadow-lg sm:border bg-white overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

                <CardHeader className="text-center pb-2 pt-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-4 relative"
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Mail className="h-10 w-10 text-primary" />
                        </motion.div>
                        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        خطوة واحدة.. وتبدأ رحلة الأثر ✨
                    </h2>
                </CardHeader>

                <CardContent className="text-center space-y-6 px-8">
                    <div className="space-y-3 text-muted-foreground">
                        <p>
                            أهلاً بك في عائلة أثر! وجودك معنا اليوم ليس مجرد تسجيل حساب،
                            بل هو بداية لقصة عطاء جديدة ستترك أثراً في حياة الكثيرين.
                        </p>
                        <p className="font-medium text-gray-700">
                            بقي لَمسة أخيرة.. قمنا بإرسال رسالة تفعيل إلى بريدك الإلكتروني.
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800 text-right">
                        <p className="font-medium mb-1">💡 تنبيه:</p>
                        <p>
                            إذا لم تجد رسالتنا في بريدك، ربما تكون قد تاهت في ملف (الرسائل غير المرغوب فيها/Spam).
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Button
                            onClick={handleOpenMail}
                            className="w-full h-11 text-base shadow-md hover:shadow-lg transition-all"
                        >
                            <Mail className="ml-2 h-4 w-4" />
                            تفقّد بريدي الإلكتروني
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            asChild
                        >
                            <Link href="/">
                                العودة للرئيسية
                            </Link>
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col items-center border-t bg-gray-50/50 py-4">
                    <div className="text-sm text-center">
                        <span className="text-muted-foreground">لم تصلك الرسالة؟ </span>
                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || isResending}
                            className="text-primary hover:underline font-medium disabled:opacity-50 disabled:no-underline transition-all"
                        >
                            {isResending ? (
                                <span className="flex items-center">
                                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                    جاري الإرسال...
                                </span>
                            ) : countdown > 0 ? (
                                `إعادة الإرسال بعد ${countdown} ثانية`
                            ) : (
                                "إرسالها مرة أخرى"
                            )}
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
