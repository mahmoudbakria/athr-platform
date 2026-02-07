"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


interface GrowthChartProps {
    data: any[]
    title?: string
    color?: string
}

export function GrowthChart({ data, title = "Platform Growth", color }: GrowthChartProps) {
    const isGeneric = data.length > 0 && ('count' in data[0] || 'value' in data[0])
    const dataKey = data.length > 0 && 'count' in data[0] ? 'count' : 'value'

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>
                    Growth over time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id={`colorGeneric${title}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color || "#8884d8"} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={color || "#8884d8"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                            />
                            <Legend />
                            {!isGeneric ? (
                                <>
                                    <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                                    <Area type="monotone" dataKey="items" stroke="#82ca9d" fillOpacity={1} fill="url(#colorItems)" name="Total Items" />
                                </>
                            ) : (
                                <Area type="monotone" dataKey={dataKey} stroke={color || "#8884d8"} fillOpacity={1} fill={`url(#colorGeneric${title})`} name="Total Count" />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
