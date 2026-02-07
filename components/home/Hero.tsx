import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteConfig } from '@/app/admin/cms/actions';

export async function Hero() {
    const config = await getSiteConfig();
    const bgImage = config.hero_image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop';

    return (
        <section className="relative h-[500px] w-full overflow-hidden flex items-center justify-center">
            {/* Optimized Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={bgImage}
                    alt="Hero Background"
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                />
                {config.hero_overlay !== 'false' && (
                    <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-background via-background/40 to-black/30" />
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-sm leading-tight">
                        {(config.hero_title || 'ارفع العبء، <br />شارك الثقل').split(/<br\s*\/?>/i).map((line, i, arr) => (
                            <span key={i}>
                                {line}
                                {i < arr.length - 1 && <br />}
                            </span>
                        ))}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                        {config.hero_description || 'انضم إلى مجتمعنا المعطاء. تبرع بالأغراض التي لم تعد بحاجة إليها أو ابحث عن الدعم عندما تكون في أمس الحاجة إليه.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105" asChild>
                        <Link href="/donate">
                            تبرع الآن
                        </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all" asChild>
                        <Link href="/volunteer/create" className="flex items-center gap-2">
                            تبرع بالتوصيل
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
