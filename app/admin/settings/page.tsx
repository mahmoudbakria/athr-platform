import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle } from './settings-toggle'
import { VolunteerSettingsCard } from './volunteer-settings-card'
import { PointsForm } from './points-form'

import { Hammer, Truck, Trophy, Shield, HeartHandshake } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SettingItem {
    key: string
    value: boolean
}

export default async function SettingsPage() {
    const supabase = await createClient()

    // Fetch all settings
    const { data } = await supabase
        .from('system_settings')
        .select('*')

    // Transform logic: Create a map for easy access
    // This allows UI to be safe even if some keys are missing (default to false)
    const settingsMap = new Map<string, boolean>()
    if (data) {
        data.forEach((item: SettingItem) => {
            settingsMap.set(item.key, item.value)
        })
    }

    // Define the cards configuration to keep JSX clean
    const features = [
        {
            key: 'feature_maintenance',
            title: 'Maintenance Mode',
            description: 'Disable public access to the site.',
            icon: Hammer
        },
        {
            key: 'feature_transporter',
            title: 'Delivery System',
            description: 'Enable the transporter module and logistics.',
            icon: Truck
        },
        {
            key: 'feature_gamification',
            title: 'Gamification',
            description: 'Enable points, badging, and leaderboards.',
            icon: Trophy
        },
        {
            key: 'feature_appeals_enabled',
            title: 'Community Appeals',
            description: 'Enable fundraising and help requests.',
            icon: HeartHandshake
        },
        {
            key: 'feature_appeals_creation_enabled',
            title: 'Allow New Appeals',
            description: 'Allow users to submit new requests.',
            icon: HeartHandshake
        },
        {
            key: 'feature_google_auth',
            title: 'Google Authentication',
            description: 'Allow users to sign in with Google.',
            icon: Shield
        }
    ]


    // Fetch points values
    const { data: pointData } = await supabase
        .from('point_values')
        .select('*')
        .in('key', ['volunteer_delivery', 'upload_item', 'donate_item'])

    const volunteerPoints = pointData?.find(p => p.key === 'volunteer_delivery')?.value ?? 0
    const uploadItemPoints = pointData?.find(p => p.key === 'upload_item')?.value ?? 0
    const donateItemPoints = pointData?.find(p => p.key === 'donate_item')?.value ?? 0

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                <p className="text-muted-foreground">
                    Manage global platform features and toggles.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {features.map((feature) => (
                    <Card key={feature.key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {feature.title}
                            </CardTitle>
                            <feature.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-muted-foreground pr-4">
                                    {feature.description}
                                </span>
                                <SettingsToggle
                                    settingKey={feature.key}
                                    initialValue={settingsMap.get(feature.key) ?? false}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Volunteer Points Card */}
                <VolunteerSettingsCard
                    initialFeatureEnabled={settingsMap.get('feature_volunteer_delivery') ?? true}
                    initialShowRelatedEnabled={settingsMap.get('feature_item_related_volunteers') ?? true}
                    initialEnabled={settingsMap.get('enable_volunteer_points') ?? false}
                    initialPoints={volunteerPoints}
                />

                {/* Points Configuration Card */}
                <PointsForm
                    initialValues={{
                        upload_item: uploadItemPoints,
                        donate_item: donateItemPoints
                    }}
                />
            </div>
        </div>
    )
}

