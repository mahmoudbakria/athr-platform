'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    ShieldCheck,
    Settings,
    ArrowLeft,
    Users,
    Package,
    Folder,
    FileText,
    Megaphone,
    Coins,
    HeartHandshake,
    BarChart3,
    Truck,
    Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

// Shared navigation items configuration
const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/verify', label: 'Moderation Queue', icon: ShieldCheck },
    { href: '/admin/users', label: 'Users Management', icon: Users },
    { href: '/admin/categories', label: 'Categories', icon: Folder },
    { href: '/admin/items', label: 'All Items', icon: Package },
    { href: '/admin/appeal-requests', label: 'Appeals Requests', icon: HeartHandshake },
    { href: '/admin/volunteers', label: 'Volunteer Deliveries', icon: Truck },
    { href: '/admin/appeals/categories', label: 'Appeal Categories', icon: Folder },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
];

const contentSettingsItems = [
    { href: '/admin/cms', label: 'Front Settings', icon: LayoutDashboard },
    { href: '/admin/banners', label: 'Banners', icon: Megaphone },
    { href: '/admin/pages', label: 'Pages', icon: FileText },
    { href: '/admin/settings', label: 'System Settings', icon: Settings },
];

const gamificationItem = { href: '/admin/points', label: 'Points System', icon: Coins };

interface SidebarProps {
    isGamificationEnabled: boolean;
    className?: string;
}

function SidebarContent({ isGamificationEnabled, setOpen }: { isGamificationEnabled: boolean; setOpen?: (open: boolean) => void }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 h-16 flex items-center border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    Admin Console
                </h2>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {sidebarItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen?.(false)}
                        className={cn(
                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group",
                            isActive(item.href) && item.href !== '/admin' // Exact match handled differently if needed, but robust enough
                                ? "bg-primary/10 text-primary"
                                : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                        )}
                    >
                        <item.icon className={cn(
                            "mr-3 h-5 w-5 group-hover:text-primary",
                            isActive(item.href) && item.href !== '/admin' ? "text-primary" : "text-slate-400"
                        )} />
                        {item.label}
                    </Link>
                ))}

                <div className="pt-4 mt-4 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Content & Settings
                </div>

                {contentSettingsItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen?.(false)}
                        className={cn(
                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group",
                            isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                        )}
                    >
                        <item.icon className={cn(
                            "mr-3 h-5 w-5 group-hover:text-primary",
                            isActive(item.href) ? "text-primary" : "text-slate-400"
                        )} />
                        {item.label}
                    </Link>
                ))}

                {isGamificationEnabled && (
                    <Link
                        href={gamificationItem.href}
                        onClick={() => setOpen?.(false)}
                        className={cn(
                            "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all group",
                            isActive(gamificationItem.href)
                                ? "bg-primary/10 text-primary"
                                : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                        )}
                    >
                        <gamificationItem.icon className={cn(
                            "mr-3 h-5 w-5 group-hover:text-primary",
                            isActive(gamificationItem.href) ? "text-primary" : "text-slate-400"
                        )} />
                        {gamificationItem.label}
                    </Link>
                )}
            </nav>

            <div className="p-4 border-t border-slate-200 mt-auto">
                <Link
                    href="/"
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Site
                </Link>
            </div>
        </div>
    );
}

export function AdminSidebar({ isGamificationEnabled, className }: SidebarProps) {
    return (
        <aside className={cn("w-64 bg-white border-r border-slate-200 md:flex flex-col hidden", className)}>
            <SidebarContent isGamificationEnabled={isGamificationEnabled} />
        </aside>
    );
}

export function AdminMobileSidebar({ isGamificationEnabled }: SidebarProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                {/* No SheetHeader needed if we just render the content, or we can add one for accessiblity */}
                <div className="h-full">
                    <SidebarContent isGamificationEnabled={isGamificationEnabled} setOpen={setOpen} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
