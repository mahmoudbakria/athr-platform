import { Wrench } from 'lucide-react'
import Link from 'next/link'

export default function MaintenancePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-8">
                    <Wrench className="h-16 w-16 text-primary animate-pulse" />
                </div>

                <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    الموقع في وضع الصيانة
                </h1>

                <p className="mt-6 text-lg leading-7 text-muted-foreground">
                    نحن نعمل على تحسين تجربتكم وتحديث أنظمة "أثر". سنعود للعمل قريباً جداً. شكراً لتفهمكم.
                </p>

                <div className="mt-10 flex flex-col gap-4 w-full">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <p className="text-sm font-medium">نعتذر عن أي إزعاج</p>
                        <p className="text-xs text-muted-foreground mt-1">فريق التطوير يعمل الآن على التحديثات</p>
                    </div>
                </div>

                <div className="mt-12 flex items-center justify-center gap-x-6">
                    <Link
                        href="/auth/login"
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        دخول المشرفين →
                    </Link>
                </div>

                <footer className="mt-16 text-sm text-muted-foreground">
                    © {new Date().getFullYear()} منصة أثر - جميع الحقوق محفوظة
                </footer>
            </div>
        </div>
    )
}
