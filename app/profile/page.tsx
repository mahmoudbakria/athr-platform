import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch Stats
    // 1. Total Uploaded
    const { count: totalUploaded } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // 2. Total Donated
    const { count: totalDonated } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'donated')

    // 3. Gamification Settings
    const { data: gamificationSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_gamification')
        .single()

    const gamificationEnabled = gamificationSetting?.value === 'true'

    // 4. Drivers Feature
    const { data: driversSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_drivers_enabled')
        .single()

    // Default to true as per request, or based on DB value
    const driversEnabled = driversSetting ? driversSetting.value === 'true' : true

    // 4. Point Values
    const { data: uploadPoints } = await supabase
        .from('point_values')
        .select('value')
        .eq('key', 'upload_item')
        .single()

    const { data: volunteerEnabledSetting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'enable_volunteer_points')
        .single()

    const volunteerPointsEnabled = volunteerEnabledSetting?.value === true

    const { data: donatePoints } = await supabase
        .from('point_values')
        .select('value')
        .eq('key', 'donate_item')
        .single()

    const { data: volunteerPointsVal } = await supabase
        .from('point_values')
        .select('value')
        .eq('key', 'volunteer_delivery')
        .single()

    const stats = {
        totalUploaded: totalUploaded || 0,
        totalDonated: totalDonated || 0,
        totalPoints: profile?.points || 0,
        volunteerPoints: profile?.volunteer_points || 0
    }

    const gamification = {
        enabled: gamificationEnabled,
        volunteerEnabled: volunteerPointsEnabled,
        pointsPerUpload: uploadPoints?.value || 0,
        pointsPerDonation: donatePoints?.value || 0,
        pointsPerVolunteer: volunteerPointsVal?.value || 0
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-0 max-w-2xl">
            <div className="mb-8" dir="rtl">
                <h1 className="text-3xl font-bold tracking-tight">ملفي الشخصي</h1>
                <p className="text-muted-foreground mt-2">
                    إدارة إعدادات حسابك وتفضيلاتك.
                </p>
            </div>
            <ProfileForm
                profile={profile}
                user={user}
                stats={stats}
                gamification={gamification}
                driversEnabled={driversEnabled}
            />
        </div>
    )
}
