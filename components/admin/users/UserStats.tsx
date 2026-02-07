import { Profile, Item, VolunteerDelivery, } from "@/types"

interface UserStatsProps {
    profile: Profile
    items: Item[]
    volunteerDeliveries: VolunteerDelivery[]
    appealsCount: number
    pointValues: { key: string; value: number }[]
}

export function UserStats({ profile, items, volunteerDeliveries, appealsCount, pointValues }: UserStatsProps) {
    const approvedVolunteerCount = volunteerDeliveries.filter(v => v.status === 'approved').length
    const donatedCount = items.filter(i => i.status === 'donated').length

    // Calculate Points safely
    const pointsFromUploads = (items.length * (pointValues?.find(p => p.key === 'upload_item')?.value || 0))
    const pointsFromDonations = (donatedCount * (pointValues?.find(p => p.key === 'donate_item')?.value || 0))

    // Formatting helper
    const fmt = (n: number) => n.toFixed(1).replace(/\.0$/, '')

    return (
        <div className="space-y-8">
            {/* Stats Cards - Activity Counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-slate-900">{items.length}</span>
                    <span className="text-sm text-muted-foreground">Items Uploaded</span>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-green-600">{donatedCount}</span>
                    <span className="text-sm text-muted-foreground">Items Donated</span>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{approvedVolunteerCount}</span>
                    <span className="text-sm text-muted-foreground">Deliveries</span>
                </div>

                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-purple-600">{appealsCount}</span>
                    <span className="text-sm text-muted-foreground">Appeals Raised</span>
                </div>
            </div>

            {/* Points Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-yellow-600">{fmt(pointsFromUploads)}</span>
                    <span className="text-sm text-muted-foreground">Points from Items</span>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-yellow-600">{fmt(pointsFromDonations)}</span>
                    <span className="text-sm text-muted-foreground">Points from Donations</span>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{profile.volunteer_points || 0}</span>
                    <span className="text-sm text-muted-foreground">Delivery Points</span>
                </div>
            </div>
        </div>
    )
}
