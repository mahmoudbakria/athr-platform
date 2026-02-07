'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePointValue } from "./actions"
import { toast } from "sonner"
import { useState } from "react"
import { Coins, Upload, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PointsFormProps {
    initialValues: {
        upload_item: number
        donate_item: number
    }
}

export function PointsForm({ initialValues }: PointsFormProps) {
    const [values, setValues] = useState(initialValues)
    const [loading, setLoading] = useState<string | null>(null)

    const handleUpdate = async (key: string) => {
        // @ts-ignore
        const value = values[key]
        const numValue = parseFloat(value)

        if (isNaN(numValue)) {
            toast.error("Please enter a valid number")
            return
        }

        setLoading(key)
        try {
            const result = await updatePointValue(key, numValue)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Points value updated')
            }
        } catch (error) {
            toast.error('Failed to update value')
        } finally {
            setLoading(null)
        }
    }

    const handleChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }))
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        Points Configuration
                    </CardTitle>
                    <CardDescription>
                        Set the point values awarded for different user actions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="upload_item" className="text-base flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Item Upload
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                Points awarded when a user uploads a new item.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="upload_item"
                                type="number"
                                step="0.5"
                                value={values.upload_item}
                                onChange={(e) => handleChange('upload_item', e.target.value)}
                                className="w-[100px]"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdate('upload_item')}
                                disabled={loading === 'upload_item'}
                            >
                                {loading === 'upload_item' ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex flex-col space-y-1">
                            <Label htmlFor="donate_item" className="text-base flex items-center gap-2">
                                <Gift className="h-4 w-4" /> Item Donation
                            </Label>
                            <span className="text-sm text-muted-foreground">
                                Points awarded when an item is marked as donated.
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                id="donate_item"
                                type="number"
                                step="0.5"
                                value={values.donate_item}
                                onChange={(e) => handleChange('donate_item', e.target.value)}
                                className="w-[100px]"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdate('donate_item')}
                                disabled={loading === 'donate_item'}
                            >
                                {loading === 'donate_item' ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
