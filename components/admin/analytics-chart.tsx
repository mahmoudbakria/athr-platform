"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type AnalyticsData = {
    date: string
    items: number
    appeals: number
    donations: number
    users: number
}

interface AnalyticsChartProps {
    data: AnalyticsData[]
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>
                    Overview of platform activity (Items, Appeals, Donations, Users) over time.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip
                            contentStyle={{ background: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="items" name="Listed Items" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="appeals" name="Appeals" fill="#f97316" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="donations" name="Donations" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="users" name="New Users" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
