"use client"

import { LogOut, Package, User, Heart, Zap, BarChart, HeartHandshake, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { User as AvailableUser } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface UserNavProps {
    user: AvailableUser
    profile?: any
    profilePath?: string
    enableGamification?: boolean
    enableVolunteer?: boolean
    enableVolunteerPoints?: boolean
}

export function UserNav({ user, profile, profilePath = "/profile", enableGamification, enableVolunteer, enableVolunteerPoints }: UserNavProps) {
    const router = useRouter()
    const supabase = createClient()
    const [fetchedProfile, setFetchedProfile] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    // Use passed profile or fetched profile
    const activeProfile = profile || fetchedProfile

    useEffect(() => {
        // Update admin status based on active profile
        if (activeProfile?.role === 'admin' || activeProfile?.role === 'moderator') {
            setIsAdmin(true)
        }
    }, [activeProfile])

    useEffect(() => {
        // If profile is NOT provided via props, fetch it client-side
        if (user && !profile) {
            const fetchProfile = async () => {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setFetchedProfile(data)
                    if (data.role === 'admin' || data.role === 'moderator') {
                        setIsAdmin(true)
                    }
                }
            }
            fetchProfile()
        }
    }, [user, supabase, profile])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    // Prioritize profile data, fallback to user metadata
    // Check show_avatar (default to true if undefined for backward compatibility, or false if strictly opt-in)
    // Assuming if show_avatar is explicitly false, we hide it.
    const shouldShowAvatar = activeProfile?.show_avatar !== false;
    const avatarUrl = shouldShowAvatar ? (activeProfile?.avatar_url || user.user_metadata?.avatar_url) : null
    const fullName = activeProfile?.full_name || user.user_metadata?.full_name || "User"

    const userInitials = fullName
        ? fullName.substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || "U"



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="h-12 w-12 cursor-pointer border border-slate-200 shadow-sm transition-opacity hover:opacity-90">
                    <AvatarImage
                        src={avatarUrl}
                        alt={fullName}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {userInitials}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border-slate-200 shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-normal truncate">
                            {fullName}
                        </p>
                        <p className="text-muted-foreground text-xs leading-normal truncate">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {enableGamification && activeProfile && (
                    <>
                        <DropdownMenuItem asChild className="cursor-pointer bg-amber-50 focus:bg-amber-100">
                            <Link href="/profile?tab=reports" className="flex items-center w-full text-amber-700 font-medium">
                                <Zap className="mr-2 h-4 w-4" />
                                <span>{Number(activeProfile.points || 0)} نقاط التبرع</span>
                            </Link>
                        </DropdownMenuItem>
                        {enableVolunteerPoints && (
                            <DropdownMenuItem asChild className="cursor-pointer bg-emerald-50 focus:bg-emerald-100 mt-1">
                                <Link href="/profile?tab=reports" className="flex items-center w-full text-emerald-700 font-medium">
                                    <Truck className="mr-2 h-4 w-4" />
                                    <span>{Number(activeProfile.volunteer_points || 0)} نقاط التطوع</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                    </>
                )}

                {isAdmin && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild className="cursor-pointer bg-purple-50 focus:bg-purple-100">
                                <Link href="/admin" className="text-purple-700 font-medium w-full flex items-center">
                                    <Zap className="mr-2 h-4 w-4" />
                                    <span>لوحة التحكم</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={profilePath}>
                            <User className="mr-2 h-4 w-4" />
                            <span>ملفي الشخصي</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/my-items">
                            <Package className="mr-2 h-4 w-4" />
                            <span>أغراضي</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/my-appeals">
                            <HeartHandshake className="mr-2 h-4 w-4" />
                            <span>طلبات المساعدة</span>
                        </Link>
                    </DropdownMenuItem>

                    {enableVolunteer && (
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/my-volunteers">
                                <Truck className="mr-2 h-4 w-4" />
                                <span>تطوعاتي</span>
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile?tab=reports">
                            <BarChart className="mr-2 h-4 w-4" />
                            <span>تقاريري</span>
                        </Link>
                    </DropdownMenuItem>

                    {enableVolunteer && (
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/volunteer/create">
                                <Truck className="mr-2 h-4 w-4" />
                                <span className="text-emerald-600 font-medium">تطوع للتوصيل</span>
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/donate" className="text-blue-600 font-medium focus:text-blue-700">
                            <Heart className="mr-2 h-4 w-4" />
                            <span>تبرع بغرض</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>تسجيل الخروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
