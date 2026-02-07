'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateProfile, updatePassword } from './actions'
import { toast } from "sonner"
import { useState } from 'react'
import { createClient } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ProfileReports } from "@/components/profile/ProfileReports"
import { Profile, ProfileStats, GamificationConfig } from "@/types"
import { User } from "@supabase/supabase-js"

import { useSearchParams } from "next/navigation"

export function ProfileForm({
    profile,
    user,
    stats,
    gamification,
    driversEnabled,
}: {
    profile: Profile,
    user: User,
    stats: ProfileStats,
    gamification: GamificationConfig,
    driversEnabled: boolean,
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url)
    const [showAvatar, setShowAvatar] = useState<boolean>(profile?.show_avatar ?? true)
    const [isUploading, setIsUploading] = useState(false)

    const searchParams = useSearchParams()
    const defaultTab = searchParams.get('tab') === 'reports' ? 'reports' : 'settings'

    // Helper to generate a consistent file path
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            toast.error('حدث خطأ أثناء رفع الصورة: ' + errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        // Append avatar_url manually since it's state
        if (avatarUrl) {
            formData.set('avatar_url', avatarUrl)
        }

        // Handle show_avatar
        if (showAvatar) {
            formData.set('show_avatar', 'on')
        } else {
            formData.delete('show_avatar')
        }

        try {
            const res = await updateProfile(formData)
            if (res?.error) toast.error(res.error)
            else toast.success('تم تحديث الملف الشخصي')
        } catch (error) {
            toast.error('حدث خطأ ما')
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPasswordLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const res = await updatePassword(formData)
            if (res?.error) toast.error(res.error)
            else {
                toast.success('تم تحديث كلمة المرور بنجاح')
                    ; (e.target as HTMLFormElement).reset()
            }
        } catch (error) {
            toast.error('حدث خطأ ما')
        } finally {
            setIsPasswordLoading(false)
        }
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase()

    return (
        <Tabs defaultValue={defaultTab} className="space-y-6" key={defaultTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                <TabsTrigger value="reports">التقارير والنقاط</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-6">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader className="text-right">
                            <CardTitle>معلومات الملف الشخصي</CardTitle>
                            <CardDescription>تحديث بياناتك الشخصية.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileSubmit} className="space-y-6 text-right">
                                <div className="flex flex-col items-center sm:flex-row gap-6">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={avatarUrl || ''} />
                                            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                                        >
                                            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="space-y-1 text-center sm:text-right">
                                        <h3 className="font-medium">صورة الملف الشخصي</h3>
                                        <p className="text-sm text-muted-foreground">
                                            انقر على الصورة لرفع صورة جديدة.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input id="email" value={user.email} disabled className="text-right" />
                                    <p className="text-[0.8rem] text-muted-foreground">لا يمكن تغيير البريد الإلكتروني.</p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">الاسم الكامل</Label>
                                    <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} placeholder="اسمك الكامل" className="text-right" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">رقم الهاتف</Label>
                                    <Input id="phone" name="phone" defaultValue={profile?.phone || ''} placeholder="+970..." dir="ltr" className="text-right" />
                                </div>

                                <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">إظهار الصورة للعامة</Label>
                                        <div className="text-sm text-muted-foreground">
                                            عرض صورتك الشخصية بجانب الأغراض المعروضة.
                                        </div>
                                    </div>
                                    <Switch
                                        checked={showAvatar}
                                        onCheckedChange={setShowAvatar}
                                    />
                                    <input type="hidden" name="show_avatar" value={showAvatar ? 'on' : 'off'} />
                                </div>

                                <Button type="submit" disabled={isLoading || isUploading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    حفظ التغييرات
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="text-right">
                            <CardTitle>الأمان</CardTitle>
                            <CardDescription>تغيير كلمة المرور.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-right">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">كلمة المرور الجديدة</Label>
                                    <Input id="password" name="password" type="password" required className="text-right" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                                    <Input id="confirmPassword" name="confirmPassword" type="password" required className="text-right" />
                                </div>
                                <Button type="submit" variant="secondary" disabled={isPasswordLoading}>
                                    {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    تحديث كلمة المرور
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                </div>
            </TabsContent>

            <TabsContent value="reports">
                <ProfileReports stats={stats} gamification={gamification} />
            </TabsContent>
        </Tabs>
    )
}
