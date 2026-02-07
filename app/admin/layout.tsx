import Link from 'next/link'
import NextImage from 'next/image'
import { LayoutDashboard, ShieldCheck, Settings, ArrowLeft, Users, Package, Folder, FileText, Megaphone, Coins, HeartHandshake, BarChart3, Truck } from 'lucide-react'
import { createClient } from "@/lib/supabase-server"
import { UserNav } from "@/components/UserNav"

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
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 h-16 flex items-center border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Admin Console
                    </h2>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/verify"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <ShieldCheck className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Moderation Queue
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Users className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Users Management
                    </Link>

                    <Link
                        href="/admin/categories"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Folder className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Categories
                    </Link>
                    <Link
                        href="/admin/items"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Package className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        All Items
                    </Link>
                    <Link
                        href="/admin/appeal-requests"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <HeartHandshake className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Appeals Requests
                    </Link>
                    <Link
                        href="/admin/volunteers"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Truck className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Volunteer Deliveries
                    </Link>
                    <Link
                        href="/admin/appeals/categories"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Folder className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Appeal Categories
                    </Link>

                    <Link
                        href="/admin/reports"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <BarChart3 className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Reports & Analytics
                    </Link>

                    <div className="pt-4 mt-4 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Content & Settings
                    </div>

                    <Link
                        href="/admin/cms"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <LayoutDashboard className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Front Settings
                    </Link>
                    <Link
                        href="/admin/banners"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Megaphone className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Banners
                    </Link>
                    <Link
                        href="/admin/pages"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <FileText className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        Pages
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                    >
                        <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                        System Settings
                    </Link>
                    {isGamificationEnabled && (
                        <Link
                            href="/admin/points"
                            className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-all group"
                        >
                            <Coins className="mr-3 h-5 w-5 text-slate-400 group-hover:text-primary" />
                            Points System
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <Link
                        href="/"
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Site
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center gap-4">
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
