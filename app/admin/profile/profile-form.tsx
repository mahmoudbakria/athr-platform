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

import { Switch } from "@/components/ui/switch"

export function ProfileForm({ profile, user }: { profile: any, user: any }) {
    const [isLoading, setIsLoading] = useState(false)
    const [isPasswordLoading, setIsPasswordLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url)
    const [showAvatar, setShowAvatar] = useState<boolean>(profile?.show_avatar ?? true)
    const [isUploading, setIsUploading] = useState(false)

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            // Compression options
            const options = {
                maxSizeMB: 0.2, // Avatars can be small
                maxWidthOrHeight: 400,
                useWebWorker: true,
                initialQuality: 0.7
            }

            let compressedFile = file
            try {
                const imageCompression = (await import('browser-image-compression')).default
                compressedFile = await imageCompression(file, options)
            } catch (err) {
                console.error("Compression failed, uploading original:", err)
            }

            const supabase = createClient()
            const fileExt = compressedFile.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, compressedFile)

            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
        } catch (error: any) {
            toast.error('Error uploading avatar: ' + error.message)
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

        // Ensure show_avatar is sent correctly (checkbox/switch behavior)
        // If the hidden input exists (showAvatar is true), it sends "on".
        // If not, it sends nothing (handled as false/undefined in server).
        // Actually, safer:
        if (showAvatar) {
            formData.set('show_avatar', 'on')
        } else {
            formData.delete('show_avatar')
        }

        try {
            const res = await updateProfile(formData)
            if (res?.error) toast.error(res.error)
            else toast.success('Profile updated')
        } catch (error) {
            toast.error('Something went wrong')
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
                toast.success('Password updated successfully')
                    ; (e.target as HTMLFormElement).reset()
            }
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setIsPasswordLoading(false)
        }
    }

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        : user.email?.substring(0, 2).toUpperCase()

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                            <div className="space-y-1">
                                <h3 className="font-medium">Profile Photo</h3>
                                <p className="text-sm text-muted-foreground">
                                    Click the image to upload a new one.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email} disabled />
                            <p className="text-[0.8rem] text-muted-foreground">Email cannot be changed.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} placeholder="Your Name" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={profile?.phone || ''} placeholder="+123..." />
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Public Avatar</Label>
                                <div className="text-sm text-muted-foreground">
                                    Show your avatar on public listings.
                                </div>
                            </div>
                            <Switch
                                checked={showAvatar}
                                onCheckedChange={setShowAvatar}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading || isUploading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>
                        <Button type="submit" variant="secondary" disabled={isPasswordLoading}>
                            {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
