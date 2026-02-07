'use client'

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSystemSetting } from "../actions"
import { toast } from "sonner"
import { useState } from "react"
import { Car, Wrench, Trophy } from "lucide-react"

interface SettingsFormProps {
    settings: Record<string, boolean>
}

export function SettingsForm({ settings }: SettingsFormProps) {
    // Use local state for optimistic updates
    const [localSettings, setLocalSettings] = useState(settings)

    const handleToggle = async (key: string, checked: boolean) => {
        // Optimistic update
        setLocalSettings(prev => ({ ...prev, [key]: checked }))

        try {
            await updateSystemSetting(key, checked)
            toast.success('Setting updated')
        } catch (error) {
            // Revert on error
            setLocalSettings(prev => ({ ...prev, [key]: !checked }))
            toast.error('Failed to update setting')
        }
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-500" />
                        Transporter Mode
                    </CardTitle>
                    <CardDescription>
                        Enable the transporter interface and functionality.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Label htmlFor="feature_transporter" className="text-base">Enable Transporters</Label>
                    <Switch
                        id="feature_transporter"
                        checked={localSettings['feature_transporter'] || false}
                        onCheckedChange={(checked) => handleToggle('feature_transporter', checked)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-orange-500" />
                        Maintenance Mode
                    </CardTitle>
                    <CardDescription>
                        Put the site in maintenance mode (only admins can access).
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Label htmlFor="feature_maintenance" className="text-base">Enable Maintenance</Label>
                    <Switch
                        id="feature_maintenance"
                        checked={localSettings['feature_maintenance'] || false}
                        onCheckedChange={(checked) => handleToggle('feature_maintenance', checked)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Gamification
                    </CardTitle>
                    <CardDescription>
                        Enable points, badges, and leaderboards.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <Label htmlFor="feature_gamification" className="text-base">Enable Gamification</Label>
                    <Switch
                        id="feature_gamification"
                        checked={localSettings['feature_gamification'] || false}
                        onCheckedChange={(checked) => handleToggle('feature_gamification', checked)}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
