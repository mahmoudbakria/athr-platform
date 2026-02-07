'use client'

import { Switch } from "@/components/ui/switch"
import { useState, useTransition } from "react"
import { updateSetting } from "./actions"
import { toast } from "sonner"

interface SettingsToggleProps {
    settingKey: string
    initialValue: boolean
}

export function SettingsToggle({ settingKey, initialValue }: SettingsToggleProps) {
    const [enabled, setEnabled] = useState(initialValue)
    const [isPending, startTransition] = useTransition()

    const handleToggle = (checked: boolean) => {
        setEnabled(checked)

        startTransition(async () => {
            const result = await updateSetting(settingKey, checked)

            if (result.error) {
                toast.error(result.error)
                setEnabled(!checked) // Revert on error
            } else {
                toast.success("Setting updated")
            }
        })
    }

    return (
        <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
        />
    )
}
