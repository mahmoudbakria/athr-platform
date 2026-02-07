import Link from 'next/link'
import { ArrowRight, Package, HeartHandshake, HandHeart, Truck } from 'lucide-react'

export function DualBanner({ showVolunteer = true }: { showVolunteer?: boolean }) {
    return (
        <div className="container mx-auto px-4 py-4 md:py-6 mt-12">
            <div className={`grid gap-2 md:gap-6 ${showVolunteer ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-3'}`}>
                {/* 1. Browse Items */}
                <Link href="/listings" className="group relative block w-full overflow-hidden rounded-xl md:rounded-2xl h-[75px] md:h-[80px] shadow-sm hover:shadow-md transition-all">
                    {/* Background: Teal Elegance Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0D9488] via-[#0F766E] to-[#134E4A] group-hover:scale-105 transition-transform duration-500" />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-between px-3 md:px-5 text-white z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-white/10 p-2 md:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm shrink-0">
                                <Package className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="text-xs md:text-lg font-bold leading-tight text-white">تصفح</h3>
                                <span className="hidden md:inline-block text-[10px] text-white/80 font-medium leading-tight uppercase tracking-widest">المتجر</span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center h-6 w-6 md:h-8 md:w-8 bg-white/10 rounded-full group-hover:bg-white/25 transition-colors shrink-0">
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-white rotate-180" />
                        </div>
                    </div>
                </Link>

                {/* 2. Appeals */}
                <Link href="/appeals" className="group relative block w-full overflow-hidden rounded-xl md:rounded-2xl h-[75px] md:h-[80px] shadow-sm hover:shadow-md transition-all">
                    {/* Background: Minty Forest Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#059669] via-[#047857] to-[#064e3b] group-hover:scale-105 transition-transform duration-500" />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-between px-3 md:px-5 text-white z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-white/10 p-2 md:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm shrink-0">
                                <HandHeart className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="text-xs md:text-lg font-bold leading-tight text-white">المساعدات</h3>
                                <span className="hidden md:inline-block text-[10px] text-white/80 font-medium leading-tight uppercase tracking-widest">المجتمع</span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center h-6 w-6 md:h-8 md:w-8 bg-white/10 rounded-full group-hover:bg-white/25 transition-colors shrink-0">
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-white rotate-180" />
                        </div>
                    </div>
                </Link>

                {/* 3. Donated */}
                <Link href="/donated-items" className="group relative block w-full overflow-hidden rounded-xl md:rounded-2xl h-[75px] md:h-[80px] shadow-sm hover:shadow-md transition-all">
                    {/* Background: Emerald Dream Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#065F46] group-hover:scale-105 transition-transform duration-500" />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-between px-3 md:px-5 text-white z-10">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="bg-white/10 p-2 md:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm shrink-0">
                                <HeartHandshake className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="text-xs md:text-lg font-bold leading-tight text-white">تم التبرع</h3>
                                <span className="hidden md:inline-block text-[10px] text-white/80 font-medium leading-tight uppercase tracking-widest">المعرض</span>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center justify-center h-6 w-6 md:h-8 md:w-8 bg-white/10 rounded-full group-hover:bg-white/25 transition-colors shrink-0">
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-white rotate-180" />
                        </div>
                    </div>
                </Link>

                {/* 4. Delivery */}
                {showVolunteer && (
                    <Link href="/volunteer" className="group relative block w-full overflow-hidden rounded-xl md:rounded-2xl h-[75px] md:h-[80px] shadow-sm hover:shadow-md transition-all">
                        {/* Background: Deep Teal Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e] via-[#115e59] to-[#134e4a] group-hover:scale-105 transition-transform duration-500" />

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-between px-3 md:px-5 text-white z-10">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="bg-white/10 p-2 md:p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-sm shrink-0">
                                    <Truck className="h-4 w-4 md:h-5 md:w-5 text-white" />
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="text-xs md:text-lg font-bold leading-tight text-white">التوصيل</h3>
                                    <span className="hidden md:inline-block text-[10px] text-white/80 font-medium leading-tight uppercase tracking-widest">تطوع</span>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center justify-center h-6 w-6 md:h-8 md:w-8 bg-white/10 rounded-full group-hover:bg-white/25 transition-colors shrink-0">
                                <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-white rotate-180" />
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    )
}
