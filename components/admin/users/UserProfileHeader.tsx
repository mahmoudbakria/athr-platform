import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, Calendar, Shield, Ban, MessageCircle } from "lucide-react"
import { Profile } from "@/types"

interface UserProfileHeaderProps {
    profile: Profile
}

export function UserProfileHeader({ profile }: UserProfileHeaderProps) {
    const userInitials = profile.full_name ? profile.full_name[0] : 'U'
    const whatsappLink = profile.phone
        ? `https://wa.me/${profile.phone.replace(/\D/g, '')}`
        : null
    const emailLink = `mailto:${profile.email}`

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start bg-slate-50 p-6 rounded-lg border border-slate-200">
            <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>

            <div className="space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                            <Badge variant={profile.role === 'admin' ? 'default' : (profile.role === 'moderator' ? 'secondary' : 'outline')}>
                                {profile.role}
                            </Badge>
                            {profile.is_banned && <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" /> Banned</Badge>}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center gap-2">
                            <Shield className="w-3 h-3" /> User ID: {profile.id}
                        </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-2">
                        {whatsappLink && (
                            <Button className="bg-green-600 hover:bg-green-700 text-white" asChild>
                                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </a>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <a href={emailLink}>
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-8 text-sm text-slate-600 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {profile.email}
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {profile.phone || 'No phone provided'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-yellow-600">
                        <span className="text-slate-400 font-normal">Points:</span>
                        {profile.points || 0}
                    </div>
                </div>
            </div>
        </div>
    )
}
