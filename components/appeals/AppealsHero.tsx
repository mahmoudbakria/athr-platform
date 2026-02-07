import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HeartHandshake, HandHelping } from "lucide-react"
import Link from "next/link"

interface AppealsHeroProps {
    isCreationEnabled: boolean
}

export function AppealsHero({ isCreationEnabled }: AppealsHeroProps) {
    return (
        <div className="container relative z-10 pt-4 pb-4 md:pt-6 md:pb-6 px-5 md:px-8">
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-emerald-900 shadow-xl shadow-emerald-900/10 h-auto min-h-[220px] md:h-[260px] flex items-center justify-center text-center py-8 md:py-0">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/95 via-emerald-800/90 to-emerald-900/80 backdrop-blur-sm"></div>

                {/* Decor elements */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl"></div>

                <div className="relative w-full px-4 md:px-6 flex flex-col items-center justify-center gap-3 md:gap-4">
                    <Badge className="bg-white/10 text-emerald-50 border-white/10 backdrop-blur-md px-3 py-1 text-[10px] md:text-xs rounded-full shadow-sm translate-y-[3px]">
                        <HeartHandshake className="h-3 w-3 md:h-3.5 md:w-3.5 mr-2 text-emerald-200" />
                        مجتمع متكافل
                    </Badge>

                    <div className="space-y-1 md:space-y-2 max-w-2xl mx-auto">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white shadow-sm">
                            نداءات المجتمع
                        </h1>
                        <p className="text-sm md:text-lg text-emerald-100/90 leading-relaxed font-light max-w-[280px] md:max-w-none mx-auto">
                            منصة للتكافل المباشر، حيث تلتقي القلوب الرحيمة بمن يحتاج للعون.
                            <br className="hidden sm:block" />
                            <span className="hidden sm:inline"> نصنع الفرق معاً، يداً بيد.</span>
                        </p>
                    </div>

                    {isCreationEnabled && (
                        <div className="pt-2">
                            <Button asChild size="lg" className="bg-white text-emerald-950 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-emerald-900/20 rounded-full px-8 h-10 md:h-11 text-xs md:text-sm font-bold border-0">
                                <Link href="/appeals/create">
                                    <HandHelping className="ml-2 h-4 w-4" />
                                    تقديم طلب مساعدة
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
