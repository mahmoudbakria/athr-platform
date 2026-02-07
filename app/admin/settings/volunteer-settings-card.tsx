'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Car } from "lucide-react"
import { useState, useTransition } from "react"
import { updateSetting, updatePointValue } from "./actions"
import { toast } from "sonner"

interface VolunteerSettingsCardProps {
    initialFeatureEnabled: boolean
    initialShowRelatedEnabled: boolean
    initialEnabled: boolean
    initialPoints: number
}

export function VolunteerSettingsCard({ initialFeatureEnabled, initialShowRelatedEnabled, initialEnabled, initialPoints }: VolunteerSettingsCardProps) {
    const [featureEnabled, setFeatureEnabled] = useState(initialFeatureEnabled)
    const [showRelatedEnabled, setShowRelatedEnabled] = useState(initialShowRelatedEnabled)
    const [enabled, setEnabled] = useState(initialEnabled)
    const [points, setPoints] = useState(initialPoints.toString())
    const [isPending, startTransition] = useTransition()

    const handleFeatureToggle = (checked: boolean) => {
        setFeatureEnabled(checked)
        startTransition(async () => {
            const result = await updateSetting('feature_volunteer_delivery', checked)
            if (result.error) {
                toast.error(result.error)
                setFeatureEnabled(!checked)
            } else {
                toast.success("Volunteer delivery feature toggled")
            }
        })
    }

    const handleShowRelatedToggle = (checked: boolean) => {
        setShowRelatedEnabled(checked)
        startTransition(async () => {
            const result = await updateSetting('feature_item_related_volunteers', checked)
            if (result.error) {
                toast.error(result.error)
                setShowRelatedEnabled(!checked)
            } else {
                toast.success("Related volunteers display updated")
            }
        })
    }

    const handleToggle = (checked: boolean) => {
        setEnabled(checked)
        startTransition(async () => {
            const result = await updateSetting('enable_volunteer_points', checked)
            if (result.error) {
                toast.error(result.error)
                setEnabled(!checked)
            } else {
                toast.success("Volunteer system updated")
            }
        })
    }

    const handlePointsSave = () => {
        const val = parseFloat(points)
        if (isNaN(val) || val < 0) {
            toast.error("Please enter a valid positive number")
            return
        }

        startTransition(async () => {
            const result = await updatePointValue('volunteer_delivery', val)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Point value saved")
            }
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-green-500" />
                    Volunteer Delivery Points
                </CardTitle>
                <CardDescription>
                    Configure points awarded for successful volunteer deliveries.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="vol_feature_enable" className="text-base">Enable Volunteer Delivery</Label>
                        <p className="text-sm text-muted-foreground">
                            Show volunteer cards on items and allow users to volunteer.
                        </p>
                    </div>
                    <Switch
                        id="vol_feature_enable"
                        checked={featureEnabled}
                        onCheckedChange={handleFeatureToggle}
                        disabled={isPending}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="vol_related_enable" className="text-base">Show Related Volunteers</Label>
                        <p className="text-sm text-muted-foreground">
                            Display matching volunteers on the Item Details page.
                        </p>
                    </div>
                    <Switch
                        id="vol_related_enable"
                        checked={showRelatedEnabled}
                        onCheckedChange={handleShowRelatedToggle}
                        disabled={isPending}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="vol_points_enable" className="text-base">Enable Points</Label>
                        <p className="text-sm text-muted-foreground">
                            When enabled, volunteers can earn points.
                        </p>
                    </div>
                    <Switch
                        id="vol_points_enable"
                        checked={enabled}
                        onCheckedChange={handleToggle}
                        disabled={isPending}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vol_points_val">Points per Delivery</Label>
                    <div className="flex gap-2">
                        <Input
                            id="vol_points_val"
                            type="number"
                            step="0.5"
                            min="0"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            disabled={isPending}
                            className="max-w-[120px]"
                        />
                        <Button
                            onClick={handlePointsSave}
                            disabled={isPending}
                            variant="outline"
                        >
                            Save Value
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Points are awarded automatically when an admin approves a delivery.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
