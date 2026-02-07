import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                {/* LEFT COLUMN: Images & Map & Description */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery Skeleton */}
                    <div className="bg-background rounded-2xl overflow-hidden shadow-sm border h-[400px] w-full">
                        <Skeleton className="h-full w-full" />
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>

                    {/* Tags Skeleton */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-8 w-20 rounded-full" />
                            <Skeleton className="h-8 w-24 rounded-full" />
                            <Skeleton className="h-8 w-16 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Details & Actions */}
                <div className="space-y-8">
                    <div className="lg:sticky lg:top-24 space-y-6">

                        {/* Header Info */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <Skeleton className="h-10 w-3/4" />

                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>

                        <Separator />

                        {/* Quick Attributes */}
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>

                        {/* Donor Card */}
                        <Card className="border-border/60 shadow-sm">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-14 w-14 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-3">
                                    <Skeleton className="h-11 w-full" />
                                    <Skeleton className="h-11 w-full" />
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    )
}
