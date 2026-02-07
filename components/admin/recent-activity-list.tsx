import NextImage from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Package, HeartHandshake, UserPlus, FileText } from "lucide-react"

export type ActivityItem = {
    id: string
    type: 'item' | 'appeal' | 'donation' | 'user'
    title: string
    description: string
    timestamp: string
    user?: {
        name: string
        avatar?: string
    }
}

interface RecentActivityListProps {
    activities: ActivityItem[]
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
    if (activities.length === 0) {
        return <div className="text-center py-4 text-muted-foreground text-sm">No recent activity.</div>
    }

    return (
        <div className="space-y-8">
            {activities.map((activity) => (
                <div key={`${activity.type}-${activity.id}`} className="flex items-center">
                    <div className="relative">
                        <Avatar className="h-9 w-9 overflow-hidden">
                            {activity.user?.avatar ? (
                                <NextImage
                                    src={activity.user.avatar}
                                    alt={activity.user?.name || "User"}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <AvatarFallback>{activity.user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                            )}
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-background border p-0.5">
                            <ActivityIcon type={activity.type} />
                        </div>
                    </div>

                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {activity.description}
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric'
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
    switch (type) {
        case 'item':
            return <Package className="h-3 w-3 text-blue-500" />
        case 'donation':
            return <HeartHandshake className="h-3 w-3 text-green-500" />
        case 'appeal':
            return <FileText className="h-3 w-3 text-orange-500" />
        case 'user':
            return <UserPlus className="h-3 w-3 text-purple-500" />
        default:
            return <Package className="h-3 w-3 text-slate-500" />
    }
}
