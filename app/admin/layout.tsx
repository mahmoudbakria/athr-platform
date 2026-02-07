import Link from 'next/link'
import NextImage from 'next/image'
import { LayoutDashboard, ShieldCheck, Settings, ArrowLeft, Users, Package, Folder, FileText, Megaphone, Coins, HeartHandshake, BarChart3, Truck } from 'lucide-react'
import { createClient } from "@/lib/supabase-server"
import { UserNav } from "@/components/UserNav"
import { AdminSidebar, AdminMobileSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // Fetch User & Profile
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect if not logged in (middleware should handle this, but safe to check)
    // if (!user) redirect('/login') 

    let profile = null
    if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        profile = data
    }

    // Fetch Site Config for Logo
    const { data: siteConfigData } = await supabase.from('site_config').select('*')
    const siteConfig: Record<string, string> = {}
    siteConfigData?.forEach((item: any) => {
        siteConfig[item.key] = item.value
    })

    const logoUrl = siteConfig.site_logo

    // Fetch Feature Flags
    const { data: featureData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'feature_gamification')
        .maybeSingle()

    const isGamificationEnabled = featureData?.value ?? false

    return (
        <div dir="ltr" lang="en" className="font-sans flex h-screen overflow-hidden bg-slate-50">
            {/* Sidebar */}
            <AdminSidebar isGamificationEnabled={isGamificationEnabled} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <AdminMobileSidebar isGamificationEnabled={isGamificationEnabled} />
                        {logoUrl ? (
                            <div className="relative h-14 w-32">
                                <NextImage
                                    src={logoUrl}
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-primary font-bold text-lg">
                                Bridge of Good
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {user && <UserNav user={user} profile={profile} profilePath="/admin/profile" />}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
