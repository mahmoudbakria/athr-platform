"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GrowthChart } from "./GrowthChart"
import { CategoryPieChart } from "./CategoryPieChart"
import { StatusBarChart } from "./StatusBarChart"
import { DateRangePicker } from "./DateRangePicker"

interface ReportsClientProps {
    growthData: any[] // Users & Items growth
    categoryData: any[]
    statusData: any[] // Items status
    appealsData?: {
        statusCounts: any[]
        growth: any[]
    }
    volunteerData?: {
        statusCounts: any[]
        growth: any[]
    }
}

export function ReportsClient({
    growthData,
    categoryData,
    statusData,
    appealsData,
    volunteerData
}: ReportsClientProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Reports</h1>
                    <p className="text-muted-foreground">In-depth insights into platform performance.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <DateRangePicker />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="flex-wrap h-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="appeals">Appeals</TabsTrigger>
                    <TabsTrigger value="items">Items Inventory</TabsTrigger>
                    <TabsTrigger value="volunteers">Volunteer Deliveries</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <GrowthChart data={growthData} />
                        <CategoryPieChart data={categoryData} />
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                        <GrowthChart
                            data={growthData.map(d => ({ date: d.date, value: d.users }))}
                            title="User Registration Trends"
                            color="#3b82f6"
                        />
                    </div>
                </TabsContent>

                <TabsContent value="appeals" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <StatusBarChart data={appealsData?.statusCounts || []} title="Appeals by Status" />
                        <GrowthChart data={appealsData?.growth || []} title="Appeals Growth" color="#8884d8" />
                    </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                        <CategoryPieChart data={categoryData} />
                        <StatusBarChart data={statusData} title="Items by Status" />
                    </div>
                </TabsContent>

                <TabsContent value="volunteers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <StatusBarChart data={volunteerData?.statusCounts || []} title="Volunteers by Status" />
                        <GrowthChart data={volunteerData?.growth || []} title="Deliveries Growth" color="#82ca9d" />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
